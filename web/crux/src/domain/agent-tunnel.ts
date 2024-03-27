import { Observable, Subject, finalize, map, takeUntil } from 'rxjs'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import { Empty } from 'src/grpc/protobuf/proto/common'

export default class AgentTunnel<T> {
  private readonly clientStream = new Subject<T>()

  private readonly clientCompleter = new Subject<unknown>()

  private readonly agentCompleter = new Subject<unknown>()

  private agentConnected = false

  get watched(): boolean {
    return this.clientStream.observed
  }

  watch(): Observable<T> {
    return this.clientStream.pipe(
      takeUntil(this.agentCompleter),
      finalize(() => this.onWatcherDisconnected()),
    )
  }

  onAgentStreamStarted(agentStream: Observable<T>): Observable<Empty> {
    if (this.agentConnected) {
      throw new CruxPreconditionFailedException({
        message: 'Agent tunnel is already in use ',
      })
    }

    this.agentConnected = true

    return agentStream.pipe(
      map(message => {
        this.clientStream.next(message)

        return Empty
      }),
      takeUntil(this.clientCompleter),
      finalize(() => this.agentCompleter.next(undefined)),
    )
  }

  private onWatcherDisconnected() {
    if (this.watched) {
      return
    }

    this.clientCompleter.next(undefined)
  }
}
