import { readFileSync } from 'fs'
import Handlebars from 'handlebars'
import { join } from 'path'
import { cwd } from 'process'
import { Subject } from 'rxjs'
import { PreconditionFailedException } from 'src/exception/errors'
import { NodeEventMessage } from 'src/grpc/protobuf/proto/crux'
import { GrpcNodeConnection } from 'src/shared/grpc-node-connection'
import { Agent } from './agent'

const SCRIPT_TEMPLATE = readFileSync(join(cwd(), 'install.sh.hbr'), 'utf8')
const compileScript = Handlebars.compile(SCRIPT_TEMPLATE)

export class AgentInstaller {
  constructor(readonly nodeId: string, readonly token: string, readonly expireAt: number) {}

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

    return compileScript({
      name: name.toLowerCase().replace(/\s/g, ''),
      token: this.token,
      insecure: process.env.GRPC_AGENT_INSTALL_SCRIPT_INSECURE === 'true',
      image: 'registry.github.com/dyrector-io/dyrectorio/agent/dagent:stable',
    })
  }

  complete(connection: GrpcNodeConnection, eventChannel: Subject<NodeEventMessage>): Agent {
    this.verify()

    return new Agent(connection, eventChannel)
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
