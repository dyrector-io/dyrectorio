import { Subject, finalize, firstValueFrom, throwError, timeout } from 'rxjs'
import { CruxInternalServerErrorException } from 'src/exception/crux-exception'
import { AgentCommand } from 'src/grpc/protobuf/proto/agent'
import { AGENT_CALLBACK_TIMEOUT } from 'src/shared/const'

export type CallbackCommand = Pick<
  AgentCommand,
  'listSecrets' | 'containerLog' | 'containerInspect' | 'deleteContainers'
>

export type KeyAndCommandProvider<Req> = (req: Req) => [string, CallbackCommand]

export default class AgentCallback<Req, Res> {
  private requests: Map<string, Subject<Res>> = new Map()

  constructor(
    private readonly commandChannel: Subject<AgentCommand>,
    private readonly keyAndCommandOf: KeyAndCommandProvider<Req>,
  ) {}

  async fetch(req: Req): Promise<Res> {
    const [key, command] = this.keyAndCommandOf(req)

    let res = this.requests.get(key)
    if (!res) {
      res = new Subject<Res>()
      this.requests.set(key, res)

      this.commandChannel.next(command)
    }

    const result = res.pipe(
      finalize(() => {
        this.requests.delete(key)
      }),
      timeout({
        first: AGENT_CALLBACK_TIMEOUT,
        with: () =>
          throwError(
            () =>
              new CruxInternalServerErrorException({
                message: 'Agent callback request timed out.',
              }),
          ),
      }),
    )

    return await firstValueFrom(result)
  }

  onResponse(key: string, res: Res) {
    const result = this.requests.get(key)
    if (!result) {
      return
    }

    result.next(res)
    result.complete()
  }

  cancel() {
    this.requests.forEach(it => it.complete())
  }
}
