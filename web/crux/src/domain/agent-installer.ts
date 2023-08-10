import { ConfigService } from '@nestjs/config'
import { NodeTypeEnum } from '@prisma/client'
import { readFileSync } from 'fs'
import Handlebars from 'handlebars'
import { join } from 'path'
import { cwd } from 'process'
import {
  CruxBadRequestException,
  CruxInternalServerErrorException,
  CruxPreconditionFailedException,
  CruxUnauthorizedException,
} from 'src/exception/crux-exception'
import { JWT_EXPIRATION_MILLIS, PRODUCTION } from 'src/shared/const'
import { getAgentVersionFromPackage } from 'src/shared/package'
import { Agent, AgentOptions } from './agent'
import { AgentToken } from './agent-token'
import { BasicNode, NodeScriptType } from './node'

export type AgentInstallerOptions = {
  token: AgentToken
  signedToken: string
  scriptType: NodeScriptType
  rootPath?: string | null
  dagentTraefikAcmeEmail?: string | null
}

export default class AgentInstaller {
  private scriptCompiler: ScriptCompiler

  private readonly expireAt: Date

  constructor(
    readonly teamSlug: string,
    readonly node: BasicNode,
    private readonly options: AgentInstallerOptions,
  ) {
    this.scriptCompiler = this.loadScriptAndCompiler(node.type, this.options.scriptType)

    this.expireAt = new Date(options.token.iat * 1000 + JWT_EXPIRATION_MILLIS)
  }

  get expired(): boolean {
    const now = new Date()
    return now > this.expireAt
  }

  getCommand(configService: ConfigService): string {
    const scriptUrl = `${configService.get<string>('CRUX_UI_URL')}/api/${this.teamSlug}/nodes/${this.node.id}/script`

    switch (this.options.scriptType) {
      case 'shell':
        return `curl -sL ${scriptUrl} | sh -`
      case 'powershell':
        return `Invoke-WebRequest -Uri ${scriptUrl} -Method GET | Select-Object -Expand Content | Invoke-Expression`
      default:
        throw new CruxInternalServerErrorException({
          message: 'Unknown script type',
          property: 'scriptType',
          value: this.options.scriptType,
        })
    }
  }

  getScript(configService: ConfigService): string {
    this.throwIfExpired()

    const configLocalDeployment = configService.get<string>('LOCAL_DEPLOYMENT')
    const configLocalDeploymentNetwork = configService.get<string>('LOCAL_DEPLOYMENT_NETWORK')
    const disableForcePull = configService.get<boolean>('AGENT_INSTALL_SCRIPT_DISABLE_PULL', false)
    const agentImageTag = configService.get<string>('CRUX_AGENT_IMAGE', getAgentVersionFromPackage(configService))
    const debugMode = process.env.NODE_ENV !== PRODUCTION

    const installScriptParams: InstallScriptConfig = {
      name: this.node.name.toLowerCase().replace(/\s/g, ''),
      token: this.options.signedToken,
      network: configLocalDeployment,
      networkName: configLocalDeploymentNetwork,
      debugMode,
      rootPath: this.options.rootPath,
      traefik: this.options.dagentTraefikAcmeEmail
        ? {
            acmeEmail: this.options.dagentTraefikAcmeEmail,
          }
        : undefined,
      disableForcePull,
      agentImageTag,
    }

    return this.scriptCompiler.compile(installScriptParams)
  }

  complete(agentOptions: Omit<AgentOptions, 'outdated'>): Agent {
    this.throwIfExpired()

    const { connection } = agentOptions

    if (this.options.signedToken !== connection.jwt) {
      throw new CruxUnauthorizedException({
        message: 'Invalid token.',
      })
    }

    return new Agent({
      ...agentOptions,
      outdated: false,
    })
  }

  private loadScriptAndCompiler(nodeType: NodeTypeEnum, scriptType: NodeScriptType): ScriptCompiler {
    const extension = this.getInstallScriptExtension(nodeType, scriptType)
    const agentFilename = `install-${nodeType}${extension}.hbr`
    const scriptFile = readFileSync(join(cwd(), 'assets', 'install-script', agentFilename), 'utf8')

    return {
      compile: Handlebars.compile(scriptFile),
      file: scriptFile,
    }
  }

  private throwIfExpired() {
    throw new CruxPreconditionFailedException({
      message: 'Install script expired',
      property: 'expireAt',
    })
  }

  private getInstallScriptExtension(nodeType: NodeTypeEnum, scriptType: NodeScriptType): string {
    if (nodeType === 'k8s') {
      return '.sh'
    }

    switch (scriptType) {
      case 'shell':
        return '.sh'
      case 'powershell':
        return '.ps1'
      default:
        throw new CruxBadRequestException({
          message: 'Unknown script type',
          property: 'scriptType',
          value: scriptType,
        })
    }
  }
}

export type InstallScriptConfig = {
  name: string
  token: string
  network: string
  networkName: string
  debugMode: boolean
  agentImageTag: string
  rootPath?: string
  update?: boolean
  hostname?: string
  traefik?: {
    acmeEmail: string
  }
  disableForcePull?: boolean
}

export type ScriptCompiler = {
  file: Buffer | string
  compile: Handlebars.TemplateDelegate
}
