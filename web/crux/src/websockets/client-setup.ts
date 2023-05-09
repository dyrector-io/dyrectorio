import { Logger } from '@nestjs/common'
import { Subject } from 'rxjs'
import { WebSocket, RawData } from 'ws'

type WsInitializer = () => Promise<boolean>

export default class WsClientSetup {
  private readonly logger: Logger

  private messages: ProcessableMessage[] = []

  private clearReceiver: VoidFunction

  private subscribe: () => Subject<any> = null

  private authorize: Promise<boolean> = null

  private binder: Promise<boolean> = null

  boundRoutes = 0

  get authorized(): Promise<boolean> {
    return this.authorize
  }

  constructor(
    client: WebSocket,
    token: string,
    private readonly initAuthorize: WsInitializer,
    private readonly initBind: WsInitializer,
  ) {
    this.logger = new Logger(`${WsClientSetup.name} ${token}`)

    const receiver: (buffer: RawData, isBinary: boolean) => void = (buffer, binary) => {
      if (binary) {
        return
      }

      this.messages.push({
        data: buffer.toString(),
      })
    }

    this.clearReceiver = () => client.removeListener('message', receiver)

    client.addListener('message', receiver)
  }

  async bound(): Promise<boolean> {
    const authorized = await this.authorize
    if (!authorized) {
      return false
    }

    return await this.binder
  }

  start() {
    this.authorize = this.initAuthorize()
    this.binder = this.initBind()
    this.logger.verbose('started')
  }

  bind(subscribe: () => Subject<any>) {
    this.subscribe = subscribe
    this.logger.verbose('bound')
  }

  finished(routes: number): boolean {
    if (this.boundRoutes === routes) {
      const onReceive = this.subscribe()
      this.clearReceiver()

      this.logger.verbose('flusing messages', this.messages.length)
      this.messages.forEach(it => onReceive.next(it))
      this.messages = []

      this.logger.verbose('finished')
      return true
    }

    return false
  }

  onClientDisconnect() {
    this.clearReceiver()
    this.messages = []

    this.authorize = null
    this.binder = null
    this.subscribe = null

    this.logger.verbose('disconnected')
  }
}

type ProcessableMessage = {
  data: string
}
