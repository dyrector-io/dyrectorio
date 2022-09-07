import { Logger } from '@nestjs/common'
import { NodeTypeEnum } from '@prisma/client'
import { readFileSync } from 'fs'
import Handlebars from 'handlebars'
import { join } from 'path'
import { cwd } from 'process'
import { Subject } from 'rxjs'
import { PreconditionFailedException } from 'src/exception/errors'
import { NodeEventMessage } from 'src/grpc/protobuf/proto/crux'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import { Agent } from './agent'

const agentFileTemplate = 'install-{{nodeType}}.sh.hbr'

export default class AgentInstaller {
  private readonly logger = new Logger(AgentInstaller.name)

  scriptCompiler: ScriptCompiler

  constructor(
    readonly nodeId: string,
    readonly token: string,
    readonly expireAt: number,
    readonly nodeType: NodeTypeEnum,
  ) {
    this.loadScriptAndCompiler(nodeType)
  }

  get expired(): boolean {
    const now = new Date().getTime()
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
    return `curl -sL ${process.env.CRUX_UI_URL}/api/nodes/${this.nodeId}/script | sh -`
  }

  getScript(name: string): string {
    this.verify()

    let installScriptParams = {
      name: name.toLowerCase().replace(/\s/g, ''),
      token: this.token,
      insecure: process.env.GRPC_AGENT_INSTALL_SCRIPT_INSECURE === 'true',
      network: process.env.LOCAL_DEPLOYMENT === 'true',
    }

    if (this.nodeType === NodeTypeEnum.k8s) {
      installScriptParams = Object.assign(installScriptParams, {
        localManifests: process.env.K8S_LOCAL_MANIFEST === 'true',
      })
    }

    return this.scriptCompiler.compile(installScriptParams)
  }

  complete(connection: GrpcNodeConnection, eventChannel: Subject<NodeEventMessage>, version?: string): Agent {
    this.verify()
    return new Agent(connection, eventChannel, version)
  }

  loadScriptAndCompiler(nodeType: NodeTypeEnum): void {
    const agentFilename = Handlebars.compile(agentFileTemplate)({ nodeType })
    const scriptFile = readFileSync(join(cwd(), agentFilename), 'utf8')
    this.scriptCompiler = {
      compile: Handlebars.compile(scriptFile),
      file: scriptFile,
    }
  }
}

export type InstallScriptConfig = {
  name: string
  token: string
  insecure: boolean
  dataPath?: string
  update?: boolean
  traefik?: boolean
  hostname?: string
}

export type ScriptCompiler = {
  file: Buffer | string
  compile: Handlebars.TemplateDelegate
}
