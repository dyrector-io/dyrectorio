import { ConfigService } from '@nestjs/config'
import { NodeTypeEnum } from '@prisma/client'
import { readFileSync } from 'fs'
import Handlebars from 'handlebars'
import { join } from 'path'
import { cwd } from 'process'
import { Subject } from 'rxjs'
import { DagentTraefikOptionsDto, NodeScriptTypeDto } from 'src/app/node/node.dto'
import {
  CruxBadRequestException,
  CruxInternalServerErrorException,
  CruxPreconditionFailedException,
} from 'src/exception/crux-exception'
import { AgentInfo } from 'src/grpc/protobuf/proto/agent'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import { Agent, AgentEvent } from './agent'

export default class AgentInstaller {
  scriptCompiler: ScriptCompiler

  constructor(
    readonly configService: ConfigService,
    readonly nodeId: string,
    readonly nodeName: string,
    readonly token: string,
    readonly expireAt: Date,
    readonly nodeType: NodeTypeEnum,
    readonly rootPath: string | null,
    readonly scriptType: NodeScriptTypeDto,
    readonly dagentTraefik: DagentTraefikOptionsDto | null,
  ) {
    this.loadScriptAndCompiler(nodeType, scriptType)
  }

  get expired(): boolean {
    const now = new Date()
    return now > this.expireAt
  }

  verify() {
    if (this.expired) {
      throw new CruxPreconditionFailedException({
        message: 'Install script expired',
        property: 'expireAt',
      })
    }
  }

  getCommand(): string {
    const scriptUrl = `${this.configService.get<string>('CRUX_UI_URL')}/api/nodes/${this.nodeId}/script`

    switch (this.scriptType) {
      case 'shell':
        return `curl -sL ${scriptUrl} | sh -`
      case 'powershell':
        return `Invoke-WebRequest -Uri ${scriptUrl} -Method GET | Select-Object -Expand Content | Invoke-Expression`
      default:
        throw new CruxInternalServerErrorException({
          message: 'Unknown script type',
          property: 'scriptType',
          value: this.scriptType,
        })
    }
  }

  getScript(): string {
    this.verify()

    const configLocalDeployment = this.configService.get<string>('LOCAL_DEPLOYMENT')
    const configLocalDeploymentNetwork = this.configService.get<string>('LOCAL_DEPLOYMENT_NETWORK')
    const disableForcePull = this.configService.get<boolean>('AGENT_INSTALL_SCRIPT_DISABLE_PULL', false)
    const agentImageTag = this.configService.get<string>('CRUX_AGENT_IMAGE', 'stable')
    const debugMode = process.env.NODE_ENV !== 'production'

    const installScriptParams: InstallScriptConfig = {
      name: this.nodeName.toLowerCase().replace(/\s/g, ''),
      token: this.token,
      network: configLocalDeployment,
      networkName: configLocalDeploymentNetwork,
      debugMode,
      rootPath: this.rootPath,
      traefik: this.dagentTraefik
        ? {
            acmeEmail: this.dagentTraefik.acmeEmail,
          }
        : undefined,
      disableForcePull,
      agentImageTag,
    }

    return this.scriptCompiler.compile(installScriptParams)
  }

  complete(connection: GrpcNodeConnection, info: AgentInfo, eventChannel: Subject<AgentEvent>): Agent {
    this.verify()
    return new Agent(connection, info, eventChannel)
  }

  loadScriptAndCompiler(nodeType: NodeTypeEnum, scriptType: NodeScriptTypeDto): void {
    const extension = this.getInstallScriptExtension(nodeType, scriptType)
    const agentFilename = `install-${nodeType}${extension}.hbr`
    const scriptFile = readFileSync(join(cwd(), 'assets', 'install-script', agentFilename), 'utf8')
    this.scriptCompiler = {
      compile: Handlebars.compile(scriptFile),
      file: scriptFile,
    }
  }

  private getInstallScriptExtension(nodeType: NodeTypeEnum, scriptType: NodeScriptTypeDto): string {
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
