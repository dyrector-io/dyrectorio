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
  startedBy: string
  scriptType: NodeScriptType
  rootPath?: string | null
  dagentTraefikAcmeEmail?: string | null
  containerName?: string | null,
}

export default class AgentInstaller {
  private scriptCompiler: ScriptCompiler

  private readonly expirationDate: Date

  constructor(
    private readonly configService: ConfigService,
    readonly teamSlug: string,
    readonly node: BasicNode,
    private readonly options: AgentInstallerOptions,
  ) {
    this.scriptCompiler = this.loadScriptAndCompiler(node.type, this.options.scriptType)

    this.expirationDate = new Date(options.token.iat * 1000 + JWT_EXPIRATION_MILLIS)
  }

  get expireAt(): Date {
    return this.expirationDate
  }

  get expired(): boolean {
    const now = new Date()
    return now.getTime() - this.expirationDate.getTime() > JWT_EXPIRATION_MILLIS
  }

  get startedBy(): string {
    return this.options.startedBy
  }

  getCommand(): string {
    const scriptUrl = `${this.configService.get<string>('CRUX_UI_URL')}/api/${this.teamSlug}/nodes/${
      this.node.id
    }/script`

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

  getScript(): string {
    const configLocalDeployment = this.configService.get<string>('LOCAL_DEPLOYMENT')
    const configLocalDeploymentNetwork = this.configService.get<string>('LOCAL_DEPLOYMENT_NETWORK')
    const disableForcePull = this.configService.get<boolean>('AGENT_INSTALL_SCRIPT_DISABLE_PULL', false)
    const agentImageTag = this.configService.get<string>(
      'CRUX_AGENT_IMAGE',
      getAgentVersionFromPackage(this.configService),
    )
    const debugMode = process.env.NODE_ENV !== PRODUCTION

    const installScriptParams: InstallScriptConfig = {
      name: this.node.name.toLowerCase().replace(/\s/g, ''),
      token: this.options.signedToken,
      network: configLocalDeployment,
      networkName: configLocalDeploymentNetwork,
      debugMode,
      containerName: this.options.containerName,
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

  complete(agentOptions: Omit<AgentOptions, 'outdated'>) {
    this.throwIfExpired()

    const { connection } = agentOptions

    if (this.options.signedToken !== connection.jwt) {
      throw new CruxUnauthorizedException({
        message: 'Invalid token.',
      })
    }

    const agent = new Agent({
      ...agentOptions,
      outdated: false,
    })

    return agent
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
    if (this.expired) {
      throw new CruxPreconditionFailedException({
        message: 'Install script expired',
        property: 'expireAt',
      })
    }
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
  containerName: string
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
