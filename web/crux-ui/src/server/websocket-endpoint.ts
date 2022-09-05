import { internalError } from '@app/error-responses'
import WsEndpoint, { WsEndpointOnMessage, WsEndpointOptions } from '@app/websockets/endpoint'
import WebSocketServer from '@app/websockets/server'
import { NextApiRequest, NextApiResponse } from 'next'
import { Logger } from '../logger'

import { NextApiEndpoint, withMiddlewares } from './middlewares'
import { useWebsocketMiddlewares, WsMiddleWareFunction } from './websocket-middlewares'

const initWebSocketServer = (req: NextApiRequest, res: NextApiResponse): WebSocketServer => {
  const httpServer = (res.socket as any).server
  let server: WebSocketServer = httpServer.ws
  if (!server) {
    server = new WebSocketServer(httpServer)
    httpServer.ws = server
  }

  if (!req.url) {
    res.status(400).end()
    return null
  }

  return server
}

const websocketEndpoint = (
  logger: Logger,
  messageTypes: string | string[],
  options?: WsEndpointOptions,
): NextApiEndpoint =>
  withMiddlewares(async (req, res) => {
    const server = initWebSocketServer(req, res)
    if (!server) {
      logger.error('Failed to initialize WebSocketServer')
      return
    }

    const route = req.url
    const { query } = req

    switch (req.method) {
      case 'POST': {
        let endpoint = server.getEndpoint(route)
        if (!endpoint) {
          const interests = typeof messageTypes === 'string' ? [messageTypes] : messageTypes
          endpoint = new WsEndpoint(route, query, interests, options)
          server.registerEndpoint(endpoint)
          options?.onReady?.call(this, endpoint)
        }

        await server.subscribe(req, res)
        break
      }
      case 'DELETE': {
        server.unsubscribe(req, res)
        break
      }
      default: {
        res.status(405).end()
        break
      }
    }
  })

export type WebSocketRouteOption = [string, WsEndpointOnMessage]

export const routedWebSocketEndpoint = (
  logger: Logger,
  routes: WebSocketRouteOption[],
  middlewares: WsMiddleWareFunction[],
  options?: WsEndpointOptions,
): NextApiEndpoint => {
  const handlers: Map<string, WsEndpointOnMessage> = new Map()
  routes.forEach(it => {
    const msgType = it[0]
    const handler = it[1]

    if (handlers.has(msgType)) {
      throw internalError('There should be only one handler per message type per endpoint')
    }

    handlers.set(msgType, handler)
  })

  const onMessage: WsEndpointOnMessage = async (endpoint: WsEndpoint, connection, message) => {
    options?.onMessage?.call(null)

    const handler = handlers.get(message.type)
    if (!handler) {
      logger.warn('Handler missing for message type: ', message.type)
    }

    await useWebsocketMiddlewares(logger, middlewares, endpoint, connection, message, async () =>
      handler(endpoint, connection, message),
    )
  }

  return websocketEndpoint(
    logger,
    routes.map(it => it[0]),
    {
      ...(options ?? {}),
      onMessage,
    },
  )
}

export const redirectedWebSocketEndpoint = (
  logger: Logger,
  onRedirect: (request: NextApiRequest) => Promise<string>,
): NextApiEndpoint =>
  withMiddlewares(async (req, res) => {
    const server = initWebSocketServer(req, res)
    if (!server) {
      logger.error('Failed to initialized WebSocketServer')
      return
    }

    if (req.method === 'POST' || req.method === 'DELETE') {
      const url = await onRedirect(req)
      res.redirect(307, url)
    } else {
      res.status(405).end()
    }
  })

export default websocketEndpoint
