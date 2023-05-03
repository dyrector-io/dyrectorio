import { Logger } from '@nestjs/common'
import { MessageMappingProperties } from '@nestjs/websockets'
import { EMPTY, Observable, firstValueFrom, of, tap } from 'rxjs'
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

  close() {
    this.namespaces.forEach(it => it.close())
    this.namespaces.clear()
    this.callbacks.clear()

    this.logger.verbose('Closed')
  }

  matches(messageType: string): WsRouteMatch | null {
    const parts = messageType.split('/').filter(it => it.length > 0)
    if (this.matchers.length > parts.length) {
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
    redirect?: boolean,
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
    if (redirect) {
      return authorizationRes.pipe(
        tap(it => {
          if (typeof it === 'boolean') {
            throw new Error('Missing WsRedirectInterceptor')
          }
        }),
      )
    }

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

    const res = this.removeClientFromNamespace(client, path, message)

    return res ? of(res) : EMPTY
  }

  onClientBind(client: WsClient, handlers: MessageMappingProperties[], transform: WsTransform) {
    const { token } = client
    if (this.callbacks.has(token)) {
      this.logger.error(`Client already connected ${token}`)
      // TODO(@m8vago): check when this error could occour
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

  onClientDisconnect(client: WsClient) {
    const subscriptionPaths = Array.from(client.subscriptions.keys())

    Array.from(subscriptionPaths).forEach(it => this.removeClientFromNamespace(client, it, null))

    this.callbacks.delete(client.token)
  }

  private upsertNamespace(match: WsRouteMatch): WsNamespace {
    const { path } = match

    let ns = this.namespaces.get(path)
    if (!ns) {
      ns = new WsNamespace(match)
      this.namespaces.set(path, ns)

      this.logger.verbose(`Namespace created ${path}`)
    }

    return ns
  }

  private removeClientFromNamespace(
    client: WsClient,
    namespacePath: string,
    message: WsMessage<SubscriptionMessage> | null,
  ): WsMessage<SubscriptionMessage> {
    const ns = this.namespaces.get(namespacePath)
    if (!ns) {
      return null
    }

    const { res, shouldRemove } = ns.onUnsubscribe(client, message)
    if (shouldRemove) {
      this.namespaces.delete(namespacePath)
      this.logger.verbose(`Namespace deleted ${namespacePath}`)
    }

    return res
  }

  private pathFromParts(parts: string[], from?: number, to?: number): string {
    return parts.slice(from, to).reduce((prev, it) => `${prev}/${it}`, '')
  }
}
