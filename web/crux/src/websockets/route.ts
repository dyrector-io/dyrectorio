import { Logger } from '@nestjs/common'
import { MessageMappingProperties } from '@nestjs/websockets'
import { EMPTY, Observable, combineLatest, firstValueFrom, map, of, switchMap } from 'rxjs'
import WsMetrics from 'src/shared/metrics/ws.metrics'
import {
  SubscriptionMessage,
  WS_TYPE_AUTHORIZE,
  WS_TYPE_SUBSCRIBE,
  WS_TYPE_SUB_FAILED,
  WS_TYPE_UNSUBSCRIBE,
  WsCallback,
  WsClient,
  WsClientCallbacks,
  WsMessage,
  WsMessageWithParams,
  WsRouteMatch,
  WsTransform,
} from './common'
import WsNamespace from './namespace'

type Matcher = (part: string, match: WsRouteMatch) => boolean

export default class WsRoute {
  private readonly logger: Logger

  private readonly namespaces: Map<string, WsNamespace> = new Map()

  private readonly matchers: Matcher[]

  private readonly callbacks: Map<string, WsClientCallbacks> = new Map()

  constructor(readonly path: string) {
    this.logger = new Logger(`${WsRoute.name} ${path}`)

    WsMetrics.routeNamespaces(this.path).set(this.countNamespaces())

    const parts = path.split('/').filter(it => it.length > 0)
    this.matchers = parts.map(it => {
      if (it[0] === ':') {
        const paramName = it.slice(1).trim()
        if (paramName.length !== it.length - 1 || paramName.length < 1) {
          throw new Error(`Invalid parameter in websocket namespace: ${path}, param: ${it}`)
        }

        return (part, match) => {
          match.params[paramName] = part
          return true
        }
      }

      return part => part === it
    })
  }

  countNamespaces() {
    return this.namespaces.size
  }

  close() {
    this.namespaces.forEach(it => it.close())
    this.namespaces.clear()
    this.callbacks.clear()

    this.logger.verbose('Closed')
  }

  matches(messageType: string): WsRouteMatch | null {
    const parts = messageType.split('/').filter(it => it.length > 0)
    if (this.matchers.length !== parts.length) {
      return null
    }

    let subpath = this.pathFromParts(parts, this.matchers.length)
    if (subpath) {
      subpath = subpath.substring(1)
    }
    const match: WsRouteMatch = {
      path: this.pathFromParts(parts, 0, this.matchers.length),
      subpath,
      params: {},
    }

    return this.matchers.every((matcher, index) => matcher(parts[index], match)) ? match : null
  }

  async onSubscribe(
    client: WsClient,
    match: WsRouteMatch,
    message: WsMessage<SubscriptionMessage>,
  ): Promise<Observable<WsMessage>> {
    const callbacks = this.callbacks.get(client.token)
    const { authorize, transform } = callbacks
    if (!authorize) {
      this.logger.error('Gateway without authorize callback.')
      throw new Error('Missing authorize callback')
    }

    const authMessage: WsMessageWithParams = {
      ...message,
      params: match.params,
    }

    const authorizationRes = transform(authorize(authMessage))

    const authorized = (await firstValueFrom(authorizationRes)) as boolean
    if (!authorized) {
      const subFailedMsg: WsMessage<SubscriptionMessage> = {
        type: WS_TYPE_SUB_FAILED,
        data: {
          path: match.path,
        },
      }

      return of(subFailedMsg)
    }

    const ns = this.upsertNamespace(match)

    return ns.onSubscribe(client, callbacks, message)
  }

  onUnsubscribe(
    client: WsClient,
    match: WsRouteMatch,
    message: WsMessage<SubscriptionMessage>,
  ): Observable<WsMessage<SubscriptionMessage>> {
    const { path } = match

    return this.removeClientFromNamespace(client, path, message).pipe(switchMap(it => of(it) ?? EMPTY))
  }

  onClientBind(client: WsClient, handlers: MessageMappingProperties[], transform: WsTransform) {
    const { token } = client
    if (this.callbacks.has(token)) {
      this.logger.error(`Client already connected ${token}`)

      // NOTE (@m8vago): This normally never happens, unless we unintentionally
      // overwrite the clients' token to the same uuid
      throw new Error('Duplicated client')
    }

    let authorize: WsCallback
    let subscribe: WsCallback | null = null
    let unsubscribe: WsCallback | null = null
    const messageHandlers: Map<string, WsCallback> = new Map()

    handlers.forEach(it => {
      const { message, callback } = it

      if (message === WS_TYPE_AUTHORIZE) {
        authorize = callback
      } else if (message === WS_TYPE_SUBSCRIBE) {
        subscribe = callback
      } else if (message === WS_TYPE_UNSUBSCRIBE) {
        unsubscribe = callback
      } else {
        messageHandlers.set(message, callback)
      }
    })

    this.callbacks.set(token, {
      authorize,
      subscribe,
      unsubscribe,
      handlers: messageHandlers,
      transform,
    })
  }

  onClientDisconnect(client: WsClient): Observable<void> {
    const subscriptionPaths = Array.from(client.subscriptions.keys())

    const unsubscribes = Array.from(subscriptionPaths).map(it => this.removeClientFromNamespace(client, it, null))

    return unsubscribes.length
      ? combineLatest(unsubscribes).pipe(
          map(() => {
            this.callbacks.delete(client.token)
          }),
        )
      : EMPTY
  }

  private upsertNamespace(match: WsRouteMatch): WsNamespace {
    const { path } = match

    let ns = this.namespaces.get(path)
    if (!ns) {
      ns = new WsNamespace(match)
      this.namespaces.set(path, ns)

      this.logger.verbose(`Namespace created ${path}`)

      WsMetrics.routeNamespaces(this.path).set(this.countNamespaces())
    }

    return ns
  }

  private removeClientFromNamespace(
    client: WsClient,
    namespacePath: string,
    message: WsMessage<SubscriptionMessage> | null,
  ): Observable<WsMessage<SubscriptionMessage>> {
    const ns = this.namespaces.get(namespacePath)
    if (!ns) {
      return EMPTY
    }

    return ns.onUnsubscribe(client, message).pipe(
      map(({ res, shouldRemove }) => {
        if (shouldRemove) {
          this.namespaces.delete(namespacePath)
          this.logger.verbose(`Namespace deleted ${namespacePath}`)

          WsMetrics.routeNamespaces(this.path).set(this.countNamespaces())
        }

        return res
      }),
    )
  }

  private pathFromParts(parts: string[], from?: number, to?: number): string {
    return parts.slice(from, to).reduce((prev, it) => `${prev}/${it}`, '')
  }
}
