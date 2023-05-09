import { HttpStatus, INestApplicationContext, Logger } from '@nestjs/common'
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host'
import { AbstractWsAdapter } from '@nestjs/websockets'
import { CLOSE_EVENT, CONNECTION_EVENT, ERROR_EVENT } from '@nestjs/websockets/constants'
import { MessageMappingProperties } from '@nestjs/websockets/gateway-metadata-explorer'
import http from 'http'
import {
  EMPTY,
  Observable,
  Subject,
  catchError,
  filter,
  first,
  from,
  fromEvent,
  mergeAll,
  mergeMap,
  mergeWith,
  of,
  share,
  takeUntil,
} from 'rxjs'
import JwtAuthGuard, { AuthorizedHttpRequest } from 'src/app/token/jwt-auth.guard'
import { WebSocketExceptionOptions } from 'src/exception/websocket-exception'
import { v4 as uuid } from 'uuid'
import { WebSocketServer } from 'ws'
import WsClientSetup from './client-setup'
import {
  SubscriptionMessage,
  WS_TYPE_ERROR,
  WS_TYPE_SUBSCRIBE,
  WS_TYPE_UNSUBSCRIBE,
  WsClient,
  WsMessage,
  WsRouteMatch,
  WsTransform,
  ensurePathFormat,
  namespaceOf,
} from './common'
import WsRoute from './route'

export enum WebSocketReadyState {
  CONNECTING_STATE = 0,
  OPEN_STATE = 1,
  CLOSING_STATE = 2,
  CLOSED_STATE = 3,
}

export default class DyoWsAdapter extends AbstractWsAdapter {
  private readonly logger = new Logger(DyoWsAdapter.name)

  private server: WebSocketServer

  private redirections: Map<string, WsRoute> = new Map()

  private routes: WsRoute[] = []

  constructor(appContext: INestApplicationContext, private readonly authGuard: JwtAuthGuard) {
    super(appContext)
  }

  bindErrorHandler(server: any) {
    server.on(CONNECTION_EVENT, (sock: any) => sock.on(ERROR_EVENT, (err: any) => this.logger.error(err)))
    server.on(ERROR_EVENT, (err: any) => this.logger.error(err))
    return server
  }

  create(_port: number, options?: Record<string, any> & { namespace?: string; server?: any }) {
    if (!options.server) {
      const httpServer = this.httpServer as http.Server
      this.server = this.bindErrorHandler(
        new WebSocketServer({
          server: httpServer,
        }),
      )
      this.server.on(CONNECTION_EVENT, (client, req) => this.onClientConnect(client as WsClient, req))

      this.logger.log('WebSocket adapter registered.')
      return this.server
    }

    if (options?.path) {
      const error = new Error('WebSocket adapter does not support the path option. Use namespace instead.')
      this.logger.error(error)
      throw error
    }

    if (!options?.namespace) {
      const error = new Error('WebSocket adapter needs a namespace for your gateway.')
      this.logger.error(error)
      throw error
    }

    const path = ensurePathFormat(options.namespace)
    const redirectFrom = options.redirectFrom ? ensurePathFormat(options.redirectFrom) : null

    const route = new WsRoute(path)
    this.routes.push(route)

    if (redirectFrom) {
      if (this.redirections.has(redirectFrom)) {
        this.logger.error(`Multiple WebSocket redirections from ${redirectFrom}`)
        throw new Error('Multiple WebSocket redirections.')
      }

      this.redirections.set(redirectFrom, route)
    }

    return options.server
  }

  close(server: any) {
    if (this.server) {
      this.server.clients.forEach(it => it.close())
      this.server.close()
      this.server.removeAllListeners()
      this.server = null

      this.redirections.clear()
      this.routes.forEach(it => it.close())
      this.routes = []
    }

    return super.close(server)
  }

  private async authorize(client: WsClient): Promise<boolean> {
    const ctx = new ExecutionContextHost([client.connectionRequest], null, this.authorize)
    let authorized = false
    try {
      authorized = await this.authGuard.canActivate(ctx)
    } catch {
      /* empty */
    }

    if (!authorized) {
      client.close()
    }

    this.logger.debug(
      `Connection ${authorized ? 'authorized' : 'unauthorized'} - ${client.connectionRequest.socket.remoteAddress}`,
    )
    return authorized
  }

  async bindMessageHandlers(
    client: WsClient,
    handlers: MessageMappingProperties[],
    transform: WsTransform,
  ): Promise<void> {
    const { setup } = client
    const bound = await setup.bound()
    if (!bound) {
      return
    }
    // this is called once per client per gateway, the handlers itself contains the code
    // for the ws context creation, thus they are essential for pipes, guards, interceptors, etc. to work
    // the order of calls per gateway is the same as the gateway creation so we can use our routes list

    const route = this.routes[setup.boundRoutes++]

    this.logger.verbose(`Binding ${client.token} to ${route.path}`)

    route.onClientBind(client, handlers, transform)

    if (setup.finished(this.routes.length)) {
      client.setup = null
    }
  }

  async bindClientMessageHandlers(client: WsClient): Promise<boolean> {
    const { setup } = client

    const authorized = await setup.authorized
    if (!authorized) {
      return false
    }

    const onClose = fromEvent(client, CLOSE_EVENT).pipe(share(), first())

    const onReceiveSub = new Subject<any>()
    const onReceive = onReceiveSub.pipe(
      mergeWith(fromEvent(client, 'message')),
      mergeMap(buffer =>
        this.onClientMessage(client, buffer).pipe(
          filter(result => typeof result !== 'undefined' && result !== null),
          catchError(err => {
            const errorMsg = 'Error while handling message'
            this.logger.error(errorMsg)
            this.logger.error(err)
            const message: WsMessage<WebSocketExceptionOptions> = {
              type: WS_TYPE_ERROR,
              data: {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: errorMsg,
              },
            }

            return of(message)
          }),
        ),
      ),
      takeUntil(onClose),
    )

    const onResponse = (response: any) => {
      if (client.readyState !== WebSocketReadyState.OPEN_STATE) {
        return
      }

      client.send(JSON.stringify(response))
    }

    const subscribe = () => {
      onReceive.subscribe(onResponse)
      return onReceiveSub
    }

    setup.bind(subscribe)
    return true
  }

  onClientMessage(client: WsClient, buffer: any): Observable<WsMessage> {
    const message: WsMessage = JSON.parse(buffer.data)

    this.logger.verbose(`Received ${buffer.data}`)

    if (message.type === WS_TYPE_SUBSCRIBE || message.type === WS_TYPE_UNSUBSCRIBE) {
      return from(this.onSubscriptionMessage(client, message)).pipe(mergeAll())
    }

    const namespace = namespaceOf(message)

    const subscription = client.subscriptions.get(namespace)
    if (!subscription) {
      this.logger.debug(`Subscription not found for ${namespace} for client ${client.token}`)
      return null
    }

    return subscription.onMessage(client, message)
  }

  private async onSubscriptionMessage(
    client: WsClient,
    message: WsMessage<SubscriptionMessage>,
  ): Promise<Observable<WsMessage>> {
    const subMessage = message as WsMessage<SubscriptionMessage>
    const { path } = subMessage.data

    const redirectRoute = this.redirections.get(path)
    if (redirectRoute) {
      const match: WsRouteMatch = {
        path: message.data.path,
        params: {},
        subpath: '',
      }

      this.logger.debug(`Redirecting ${path} to ${redirectRoute.path}`)
      return await redirectRoute.onSubscribe(client, match, message, true)
    }

    const [route, match] = this.findRouteByPath(path)

    if (!match) {
      this.logger.debug(`Subscription failed. No route for: ${path}`)
      const err: WsMessage<WebSocketExceptionOptions> = {
        type: WS_TYPE_ERROR,
        data: {
          status: 404,
          message: 'Route not found',
          property: 'path',
          value: path,
        },
      }
      return of(err)
    }

    let res: Observable<WsMessage> = EMPTY
    if (message.type === WS_TYPE_SUBSCRIBE) {
      res = await route.onSubscribe(client, match, message)
    } else if (message.type === WS_TYPE_UNSUBSCRIBE) {
      res = route.onUnsubscribe(client, match, message)
    } else {
      const err = new Error(`Invalid subscription type ${message.type}`)
      this.logger.verbose(err)
      throw err
    }

    return res
  }

  private onClientConnect(client: WsClient, req: http.IncomingMessage) {
    client.token = uuid()
    client.connectionRequest = req as AuthorizedHttpRequest
    client.subscriptions = new Map()
    client.sendWsMessage = msg => {
      if (!msg || client.readyState !== WebSocketReadyState.OPEN_STATE) {
        return
      }

      client.send(JSON.stringify(msg))
    }
    client.on(CLOSE_EVENT, () => this.onClientDisconnect(client))

    client.setup = new WsClientSetup(
      client,
      client.token,
      () => this.authorize(client),
      () => this.bindClientMessageHandlers(client),
    )
    client.setup.start()

    this.logger.log(`Connected ${client.token} clients: ${this.server?.clients?.size}`)
  }

  private onClientDisconnect(client: WsClient) {
    this.logger.log(`Disconnected ${client.token} clients: ${this.server?.clients?.size}`)

    this.routes.forEach(it => it.onClientDisconnect(client))

    client?.setup?.onClientDisconnect()
  }

  private findRouteByPath(path: string): [WsRoute, WsRouteMatch] {
    if (this.routes.length < 0) {
      return [null, null]
    }

    let index = 0
    let match: WsRouteMatch = null
    let route: WsRoute = null
    while (index < this.routes.length) {
      route = this.routes[index]
      match = route.matches(path)
      if (match) {
        break
      }

      index++
    }

    if (!match) {
      return [null, null]
    }

    return [route, match]
  }
}
