import { Logger } from '@nestjs/common'
import { EMPTY, Observable, Subject, filter, first, map, mergeWith, of, takeUntil } from 'rxjs'
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

  private readonly clients: Map<string, ClientResources> = new Map()

  private readonly path: string

  readonly params: Record<string, string>

  constructor(match: WsRouteMatch) {
    this.path = match.path
    this.params = match.params

    this.logger = new Logger(`${WsNamespace.name} ${this.path}`)
  }

  close() {
    this.clients.forEach(it => it.client.subscriptions.delete(this.path))
    this.clients.clear()

    this.logger.verbose('Closed')
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

    const resources: ClientResources = {
      client,
      handlers,
      transform,
      unsubscribe,
      completer: new Subject(),
    }
    this.clients.set(client.token, resources)

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
        filter(it => typeof it !== 'undefined' && it !== null),
        map(it => this.overwriteMessageType(it)),
        mergeWith(of(res)),
        takeUntil(resources.completer),
      )
    }

    return of(res).pipe(first())
  }

  onUnsubscribe(client: WsClient, message: WsMessage<SubscriptionMessage> | null): UnsubcribeResult {
    const { token } = client

    const resources = this.clients.get(token)
    if (!resources) {
      this.logger.warn(`undefined resource for '${token}'`)
      return {
        res: null,
        shouldRemove: true,
      }
    }

    // When the connection is killed, we get an empty message,
    // a fake message is created so subscriptionOfContext still works for @WsUnsubscribe
    if (!message) {
      message = this.overwriteMessageType({
        type: WS_TYPE_UNSUBBED,
        data: {
          path: this.path,
        },
      })
    }

    const { unsubscribe, transform, completer } = resources

    completer.next(undefined)
    this.clients.delete(token)

    if (unsubscribe) {
      transform(unsubscribe(message))
        .pipe(first())
        .subscribe(() => client.subscriptions.delete(this.path))
    } else {
      client.subscriptions.delete(this.path)
    }

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

    const { handlers, transform, completer } = this.clients.get(client.token)
    const handler = handlers.get(handlerKey)
    if (!handler) {
      this.logger.error(`Handler not found for: ${handlerKey}`)
      return EMPTY
    }

    const result: Observable<WsMessage> | null = transform(handler(message))

    return !result
      ? EMPTY
      : result.pipe(
          filter(it => typeof it !== 'undefined' && it !== null),
          map(it => this.overwriteMessageType(it)),
          takeUntil(completer),
        )
  }

  sendToAll(message: WsMessage): void {
    message = this.overwriteMessageType(message)
    Array.from(this.clients.values()).forEach(it => it.client.sendWsMessage(message))
  }

  sendToAllExcept(except: WsClient, message: WsMessage<any>): void {
    message = this.overwriteMessageType(message)
    Array.from(this.clients.values())
      .filter(it => it.client !== except)
      .forEach(it => it.client.sendWsMessage(message))
  }

  private overwriteMessageType(message: WsMessage): WsMessage {
    message.type = `${this.path}/${message.type}`
    return message
  }
}

type ClientResources = {
  client: WsClient
  handlers: Map<string, WsCallback>
  transform: WsTransform
  unsubscribe?: WsCallback
  completer: Subject<undefined>
}

type UnsubcribeResult = {
  res: WsMessage<SubscriptionMessage>
  shouldRemove: boolean
}
