import { Status } from '@grpc/grpc-js/build/src/constants'
import { Subject, finalize, firstValueFrom, map, merge, throwError, timeout } from 'rxjs'
import { CruxException, CruxInternalServerErrorException, CruxNotFoundException } from 'src/exception/crux-exception'
import { AgentCommand, AgentError } from 'src/grpc/protobuf/proto/agent'

export type CallbackCommand = Pick<
  AgentCommand,
  'listSecrets' | 'containerLog' | 'containerInspect' | 'deleteContainers'
>

export type KeyAndCommandProvider<Req> = (req: Req) => [string, CallbackCommand]

type RunningRequest<Res> = {
  response: Subject<Res>
  error: Subject<AgentError>
}

export default class AgentCallback<Req, Res> {
  private requests: Map<string, RunningRequest<Res>> = new Map()

  constructor(
    private readonly callbackTimeout: number,
    private readonly commandChannel: Subject<AgentCommand>,
    private readonly keyAndCommandOf: KeyAndCommandProvider<Req>,
  ) {}

  async fetch(req: Req): Promise<Res> {
    const [key, command] = this.keyAndCommandOf(req)

    let agentReq = this.requests.get(key)
    if (!agentReq) {
      agentReq = {
        response: new Subject(),
        error: new Subject(),
      }
      this.requests.set(key, agentReq)

      this.commandChannel.next(command)
    }

    const errorRes = agentReq.error.pipe(
      map(err => {
        throw AgentCallback.mapCommandError(key, err)
      }),
    )

    const result = merge(errorRes, agentReq.response).pipe(
      finalize(() => {
        this.requests.delete(key)
      }),
      timeout({
        first: this.callbackTimeout,
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

    result.error.complete()
    result.response.next(res)
    result.response.complete()
  }

  onError(key: string, error: AgentError) {
    console.log('error', key)
    const result = this.requests.get(key)
    if (!result) {
      return
    }

    result.error.next(error)
    result.error.complete()
  }

  cancel() {
    this.requests.forEach(it => {
      it.error.complete()
      it.response.complete()
    })
  }

  private static mapCommandError(key, error: AgentError): CruxException {
    switch (error.status) {
      case Status.NOT_FOUND:
        throw new CruxNotFoundException({
          property: 'key',
          value: key,
          message: error.error,
        })
      default:
        throw new CruxInternalServerErrorException({
          message: error.error,
        })
    }
  }
}
