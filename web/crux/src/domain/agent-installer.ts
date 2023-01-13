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
import { NodeEventMessage, NodeScriptType } from 'src/grpc/protobuf/proto/crux'
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
    return `curl -sL ${this.configService.get<string>('CRUX_UI_URL')}/api/nodes/${this.nodeId}/script | sh -`
  }

  getScript(name: string): string {
    this.verify()

    const configLocalDeployment = this.configService.get<string>('LOCAL_DEPLOYMENT')
    const configLocalDeploymentNetwork = this.configService.get<string>('LOCAL_DEPLOYMENT_NETWORK')
    const configK8sLocalManifest = this.configService.get<string>('K8S_LOCAL_MANIFEST')
    const debugMode = process.env.NODE_ENV !== 'production'

    let installScriptParams: InstallScriptConfig = {
      name: name.toLowerCase().replace(/\s/g, ''),
      token: this.token,
      network: configLocalDeployment,
      networkName: configLocalDeploymentNetwork,
      debugMode,
      rootPath: this.rootPath,
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
    const extension = this.getInstallScriptExtension(scriptType)
    const agentFilename = `install-${nodeType}${extension}.hbr`
    const scriptFile = readFileSync(join(cwd(), agentFilename), 'utf8')
    this.scriptCompiler = {
      compile: Handlebars.compile(scriptFile),
      file: scriptFile,
    }
  }

  private getInstallScriptExtension(scriptType: NodeScriptType): string {
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
  traefik?: boolean
  hostname?: string
}

export type ScriptCompiler = {
  file: Buffer | string
  compile: Handlebars.TemplateDelegate
}
