import { finalize, lastValueFrom, Observable, startWith, Subject, tap, toArray } from 'rxjs'
import { AgentCommand } from 'src/grpc/protobuf/proto/agent'
import { ContainerIdentifier, ContainerLogMessage, Empty } from 'src/grpc/protobuf/proto/common'
import FixedLengthLinkedList from 'src/shared/fixed-length-linked-list'
import AgentTunnel from './agent-tunnel'

type ContainerLogStreamState = 'ready' | 'fetching' | 'streaming'

export default class ContainerLogStream {
  private readonly cache: FixedLengthLinkedList<ContainerLogMessage> = new FixedLengthLinkedList(this.tail)

  private currentTunel: AgentTunnel<ContainerLogMessage> = null

  private nextTunnel: AgentTunnel<ContainerLogMessage> = null

  private state: ContainerLogStreamState = 'ready'

  constructor(
    private readonly commandChannel: Subject<AgentCommand>,
    private readonly container: ContainerIdentifier,
    private readonly tail: number,
    private readonly onFree: VoidFunction,
  ) {}

  watch(): Observable<ContainerLogMessage> {
    if (this.state === 'fetching') {
      if (!this.nextTunnel) {
        this.nextTunnel = new AgentTunnel()
      }

      return this.nextTunnel.watch()
    }

    if (this.state === 'ready') {
      this.currentTunel = new AgentTunnel()
      this.sendAgentCommand('streaming')
    }

    return this.currentTunel.watch().pipe(startWith(...Array.from(this.cache)))
  }

  async fetchOnce(): Promise<ContainerLogMessage[]> {
    if (this.state === 'streaming') {
      return Array.from(this.cache)
    }

    if (this.state === 'ready') {
      this.currentTunel = new AgentTunnel()
      this.sendAgentCommand('fetching')
    }

    return lastValueFrom(this.currentTunel.watch().pipe(toArray()))
  }

  onAgentStreamStarted(stream: Observable<ContainerLogMessage>): Observable<Empty> {
    return this.currentTunel
      .onAgentStreamStarted(stream.pipe(tap(message => this.cache.push(message))))
      .pipe(finalize(() => this.onAgenStreamFinished()))
  }

  private onAgenStreamFinished() {
    this.currentTunel = null

    if (this.state === 'fetching') {
      if (this.nextTunnel?.watched) {
        this.currentTunel = this.nextTunnel
        this.nextTunnel = null
        this.sendAgentCommand('streaming')
        return
      }
    }

    this.nextTunnel = null
    this.state = 'ready'
    this.onFree()
  }

  private sendAgentCommand(commandType: ContainerLogStreamState) {
    this.state = commandType

    this.commandChannel.next({
      containerLog: {
        container: this.container,
        streaming: commandType === 'streaming',
        tail: this.tail,
      },
    } as AgentCommand)
  }
}
