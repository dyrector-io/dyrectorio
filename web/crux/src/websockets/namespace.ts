import { Logger } from '@nestjs/common'
import { EMPTY, Observable, first, map, mergeWith, of } from 'rxjs'
import {
  SubscriptionMessage,
  WS_TYPE_SUBBED,
  WS_TYPE_UNSUBBED,
  WsCallback,
  WsClient,
  WsClientCallbacks,
  WsMessage,
  WsRouteMatch,
  WsSubscription,
  WsTransform,
  handlerKeyOf,
} from './common'

export default class WsNamespace implements WsSubscription {
  private readonly logger: Logger

  private readonly clients: Map<string, ClientWithHandlers> = new Map()

  private readonly path: string

  private readonly params: Record<string, string>

  constructor(match: WsRouteMatch) {
    this.path = match.path
    this.params = match.params

    this.logger = new Logger(`${WsNamespace.name}${this.path}`)
  }

  close() {
    this.clients.forEach(it => it.client.subscriptions.delete(this.path))
  }

  getParameter(name: string): string {
    return this.params[name]
  }

  onSubscribe(
    client: WsClient,
    callbacks: WsClientCallbacks,
    message: WsMessage<SubscriptionMessage>,
  ): Observable<WsMessage> {
    const { subscribe, handlers, transform, unsubscribe } = callbacks

    this.clients.set(client.token, {
      client,
      handlers,
      transform,
      unsubscribe,
    })

    client.subscriptions.set(this.path, this)

    this.logger.verbose(`${client.token} subscribed`)

    const res: WsMessage<SubscriptionMessage> = {
      type: WS_TYPE_SUBBED,
      data: {
        path: this.path,
      },
    }

    const stream: Observable<WsMessage> | null = subscribe ? transform(subscribe(message)) : null

    if (stream) {
      return stream.pipe(
        map(it => this.overwriteMessageType(it)),
        mergeWith(of(res)),
      )
    }

    return of(res).pipe(first())
  }

  onUnsubscribe(client: WsClient, message: WsMessage<SubscriptionMessage> | null): UnsubcribeResult {
    const { token } = client

    const clientWithHandlers = this.clients.get(token)
    const { unsubscribe } = clientWithHandlers

    if (unsubscribe) {
      unsubscribe(message)
    }

    this.clients.delete(token)

    this.logger.verbose(`${token} unsubscribed`)

    return {
      res: {
        type: WS_TYPE_UNSUBBED,
        data: {
          path: this.path,
        },
      },
      shouldRemove: this.clients.size < 1,
    }
  }

  onMessage(client: WsClient, message: WsMessage): Observable<WsMessage> {
    const handlerKey = handlerKeyOf(message)

    const clientWithHandlers = this.clients.get(client.token)
    const handler = clientWithHandlers.handlers.get(handlerKey)
    if (!handler) {
      this.logger.error(`Handler not found for: ${handlerKey}`)
      return EMPTY
    }

    const result: Observable<WsMessage> | null = clientWithHandlers.transform(handler(message))

    return !result ? EMPTY : result.pipe(map(it => this.overwriteMessageType(it)))
  }

  sendToAll(message: WsMessage): void {
    Array.from(this.clients.values()).forEach(it => it.client.sendWsMessage(message))
  }

  sendToAllExcept(except: WsClient, message: WsMessage<any>): void {
    Array.from(this.clients.values())
      .filter(it => it.client !== except)
      .forEach(it => it.client.sendWsMessage(message))
  }

  private overwriteMessageType(message: WsMessage): WsMessage {
    message.type = `${this.path}/${message.type}`
    return message
  }
}

type ClientWithHandlers = {
  client: WsClient
  handlers: Map<string, WsCallback>
  transform: WsTransform
  unsubscribe?: WsCallback
}

type UnsubcribeResult = {
  res: WsMessage<SubscriptionMessage>
  shouldRemove: boolean
}
