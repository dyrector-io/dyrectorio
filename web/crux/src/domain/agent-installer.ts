import { readFileSync } from 'fs'
import Handlebars from 'handlebars'
import { join } from 'path'
import { cwd } from 'process'
import { Subject } from 'rxjs'
import { PreconditionFailedException } from 'src/exception/errors'
import { NodeEventMessage } from 'src/grpc/protobuf/proto/crux'
import { GrpcNodeConnection } from 'src/shared/grpc-node-connection'
import { Agent } from './agent'

const agent_file_tmpl = 'install-{{nodeType}}.sh.hbr'

export class AgentInstaller {
  scriptCompiler: ScriptCompiler

  constructor(readonly nodeId: string, readonly token: string, readonly expireAt: number, readonly nodeType: string) {
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

    return this.scriptCompiler.compile({
      name: name.toLowerCase().replace(/\s/g, ''),
      token: this.token,
      insecure: process.env.GRPC_AGENT_INSTALL_SCRIPT_INSECURE === 'true',
    })
  }

  complete(connection: GrpcNodeConnection, eventChannel: Subject<NodeEventMessage>, version?: string): Agent {
    this.verify()
    return new Agent(connection, eventChannel, version)
  }

  loadScriptAndCompiler(nodeType: string): void {
    if (['dagent', 'crane'].includes(nodeType)) {
      const agentFilename = Handlebars.compile(agent_file_tmpl)({ nodeType })
      const scriptFile = readFileSync(join(cwd(), agentFilename), 'utf8')
      this.scriptCompiler = {
        compile: Handlebars.compile(scriptFile),
        file: scriptFile,
      }
    } else {
      console.error('Error: invalid agent type requested to be loaded.')
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
