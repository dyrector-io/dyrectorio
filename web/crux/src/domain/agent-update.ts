import { Subject } from 'rxjs'
import { CruxPreconditionFailedException, CruxUnauthorizedException } from 'src/exception/crux-exception'
import { AgentCommand } from 'src/grpc/protobuf/proto/agent'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'

export default class AgentUpdate {
  constructor(
    private readonly token: string,
    private readonly startedAt: Date,
  ) {}

  get expired(): boolean {
    const now = new Date().getTime()
    return now - this.startedAt.getTime() >= AgentUpdate.TIMEOUT_SECONDS * 1000
  }

  start(commandChannel: Subject<AgentCommand>, tag: string) {
    commandChannel.next({
      update: {
        tag,
        timeoutSeconds: AgentUpdate.TIMEOUT_SECONDS,
      },
    })
  }

  complete(connection: GrpcNodeConnection) {
    if (this.expired) {
      throw new CruxPreconditionFailedException({
        message: 'Update timeout.',
      })
    }

    if (connection.jwt !== this.token) {
      throw new CruxUnauthorizedException({
        message: 'Invalid token.',
      })
    }
  }

  public static TIMEOUT_SECONDS = 60 * 5
}
