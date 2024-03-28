import { finalize, Observable, startWith, Subject, tap } from 'rxjs'
import { AgentCommand } from 'src/grpc/protobuf/proto/agent'
import { ContainerIdentifier, ContainerLogMessage, Empty } from 'src/grpc/protobuf/proto/common'
import FixedLengthLinkedList from 'src/shared/fixed-length-linked-list'
import AgentTunnel from './agent-tunnel'

export default class ContainerLogStream {
  private readonly cache: FixedLengthLinkedList<ContainerLogMessage> = new FixedLengthLinkedList(this.tail)

  private currentTunel: AgentTunnel<ContainerLogMessage> = null

  constructor(
    private readonly commandChannel: Subject<AgentCommand>,
    private readonly container: ContainerIdentifier,
    private readonly tail: number,
    private readonly onFree: VoidFunction,
  ) {}

  watch(): Observable<ContainerLogMessage> {
    if (!this.currentTunel) {
      this.currentTunel = new AgentTunnel()

      this.commandChannel.next({
        containerLog: {
          container: this.container,
          streaming: true,
          tail: this.tail,
        },
      } as AgentCommand)
    }

    return this.currentTunel.watch().pipe(startWith(...Array.from(this.cache)))
  }

  onAgentStreamStarted(stream: Observable<ContainerLogMessage>): Observable<Empty> {
    return this.currentTunel
      .onAgentStreamStarted(stream.pipe(tap(message => this.cache.push(message))))
      .pipe(finalize(() => this.onAgenStreamFinished()))
  }

  private onAgenStreamFinished() {
    this.currentTunel = null
    this.onFree()
  }
}
