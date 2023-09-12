import { Subject } from 'rxjs'
import { CruxPreconditionFailedException, CruxUnauthorizedException } from 'src/exception/crux-exception'
import { AgentCommand } from 'src/grpc/protobuf/proto/agent'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import { AgentToken } from './agent-token'

export type AgentUpdateOptions = {
  token: AgentToken
  signedToken: string
  startedAt: Date
  startedBy: string
}

export type AgentUpdateResult = {
  startedBy: string
}

export default class AgentUpdate {
  private readonly token: AgentToken

  private readonly signedToken: string

  private readonly startedAt: Date

  private readonly startedBy: string

  constructor(options: AgentUpdateOptions) {
    this.token = options.token
    this.signedToken = options.signedToken
    this.startedAt = options.startedAt
    this.startedBy = options.startedBy
  }

  get expired(): boolean {
    const now = new Date().getTime()
    return now - this.startedAt.getTime() >= AgentUpdate.TIMEOUT_SECONDS * 1000
  }

  start(commandChannel: Subject<AgentCommand>, tag: string) {
    commandChannel.next({
      update: {
        tag,
        timeoutSeconds: AgentUpdate.TIMEOUT_SECONDS,
        token: this.signedToken,
      },
    })
  }

  complete(connection: GrpcNodeConnection): AgentUpdateResult {
    if (this.expired) {
      throw new CruxPreconditionFailedException({
        message: 'Update timeout.',
      })
    }

    if (connection.jwt !== this.signedToken) {
      throw new CruxUnauthorizedException({
        message: 'Invalid token.',
      })
    }

    return {
      startedBy: this.startedBy,
    }
  }

  onTokenReplaced(): AgentToken {
    return this.token
  }

  public static TIMEOUT_SECONDS = 60 * 5
}
