import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NodeTypeEnum } from '@prisma/client'
import { readFileSync } from 'fs'
import Handlebars from 'handlebars'
import { join } from 'path'
import { cwd } from 'process'
import { Subject } from 'rxjs'
import { InvalidArgumentException, PreconditionFailedException } from 'src/exception/errors'
import { AgentInfo } from 'src/grpc/protobuf/proto/agent'
import { DagentTraefikOptions, NodeEventMessage, NodeScriptType } from 'src/grpc/protobuf/proto/crux'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import { Agent } from './agent'

export default class AgentInstaller {
  private readonly logger = new Logger(AgentInstaller.name)

  scriptCompiler: ScriptCompiler

  constructor(
    readonly configService: ConfigService,
    readonly nodeId: string,
    readonly token: string,
    readonly expireAt: Date,
    readonly nodeType: NodeTypeEnum,
    readonly rootPath: string | null,
    readonly scriptType: NodeScriptType,
    readonly dagentTraefik: DagentTraefikOptions | null,
  ) {
    this.loadScriptAndCompiler(nodeType, scriptType)
  }

  get expired(): boolean {
    const now = new Date()
    return now > this.expireAt
  }

  verify() {
    if (this.expired) {
      throw new PreconditionFailedException({
        message: 'Install script expired',
        property: 'expireAt',
      })
    }
  }

  getCommand(): string {
    switch (this.scriptType) {
      case NodeScriptType.SHELL:
        return `curl -sL ${this.configService.get<string>('CRUX_UI_URL')}/api/nodes/${this.nodeId}/script | sh -`
      case NodeScriptType.POWERSHELL:
        return `Invoke-WebRequest -Uri ${this.configService.get<string>('CRUX_UI_URL')}/api/nodes/${
          this.nodeId
        }/script -Method GET | Select-Object -Expand Content | Invoke-Expression`
      default:
        throw new InvalidArgumentException({
          message: 'Unknown script type',
          property: 'scriptType',
          value: this.scriptType,
        })
    }
  }

  getScript(name: string): string {
    this.verify()

    const configLocalDeployment = this.configService.get<string>('LOCAL_DEPLOYMENT')
    const configLocalDeploymentNetwork = this.configService.get<string>('LOCAL_DEPLOYMENT_NETWORK')
    const configK8sLocalManifest = this.configService.get<string>('K8S_LOCAL_MANIFEST')
    const disableForcePull = this.configService.get<boolean>('AGENT_INSTALL_SCRIPT_DISABLE_PULL', false)
    const debugMode = process.env.NODE_ENV !== 'production'

    let installScriptParams: InstallScriptConfig = {
      name: name.toLowerCase().replace(/\s/g, ''),
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
    }

    if (this.nodeType === NodeTypeEnum.k8s) {
      installScriptParams = Object.assign(installScriptParams, {
        localManifests: configK8sLocalManifest === 'true',
      })
    }

    return this.scriptCompiler.compile(installScriptParams)
  }

  complete(connection: GrpcNodeConnection, info: AgentInfo, eventChannel: Subject<NodeEventMessage>): Agent {
    this.verify()
    return new Agent(connection, info, eventChannel)
  }

  loadScriptAndCompiler(nodeType: NodeTypeEnum, scriptType: NodeScriptType): void {
    const extension = this.getInstallScriptExtension(nodeType, scriptType)
    const agentFilename = `install-${nodeType}${extension}.hbr`
    const scriptFile = readFileSync(join(cwd(), 'assets', 'install-script', agentFilename), 'utf8')
    this.scriptCompiler = {
      compile: Handlebars.compile(scriptFile),
      file: scriptFile,
    }
  }

  private getInstallScriptExtension(nodeType: NodeTypeEnum, scriptType: NodeScriptType): string {
    if (nodeType === 'k8s') {
      return '.sh'
    }

    switch (scriptType) {
      case NodeScriptType.SHELL:
        return '.sh'
      case NodeScriptType.POWERSHELL:
        return '.ps1'
      default:
        throw new InvalidArgumentException({
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
