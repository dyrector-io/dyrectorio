import { AsyncVoidFunction } from '@app/utils'
import { NextApiRequest, NextApiResponse } from 'next'
import useAuthorizeApiMiddleware from './auth-middleware'
import { useErrorMiddleware } from './error-middleware'

export type NextApiEndpoint = (req: NextApiRequest, res: NextApiResponse) => Promise<void>

export type MiddlewareFunction = (req: NextApiRequest, res: NextApiResponse, next: AsyncVoidFunction) => Promise<void>

export const useMiddlewares = async (
  middlewares: MiddlewareFunction[],
  req: NextApiRequest,
  res: NextApiResponse,
  callEndpoint: NextApiEndpoint,
) => {
  let i = 0
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const callNext = async () => (i < middlewares.length ? await callNextMiddleware() : await callEndpoint(req, res))
  const callNextMiddleware = async () => await middlewares[i++](req, res, callNext)

  await callNextMiddleware()
}

export type MiddlewareRoute = {
  endpoint: NextApiEndpoint
  middlewares: MiddlewareFunction[]
}

export type MiddlewareRouteOptions = {
  onGet?: NextApiEndpoint | MiddlewareRoute
  onPost?: NextApiEndpoint | MiddlewareRoute
  onPut?: NextApiEndpoint | MiddlewareRoute
  onDelete?: NextApiEndpoint | MiddlewareRoute
}

const ROUTE_MAPPINGS = {
  GET: 'onGet',
  POST: 'onPost',
  PUT: 'onPut',
  DELETE: 'onDelete',
}

export const withMiddlewares = (
  endpoint: MiddlewareRouteOptions | NextApiEndpoint,
  middlewares: MiddlewareFunction[] = [],
  defaultMiddlewares = true,
): NextApiEndpoint => {
  const allMiddleware = defaultMiddlewares
    ? [useErrorMiddleware, useAuthorizeApiMiddleware, ...middlewares]
    : middlewares

  const actualEndpoint: NextApiEndpoint =
    typeof endpoint === 'function'
      ? endpoint
      : (req, res) => {
          const routeOptions: MiddlewareRouteOptions = endpoint

          const methodName = ROUTE_MAPPINGS[req.method]

          const handler = routeOptions[methodName]

          if (!handler) {
            res.status(405).end()
            return null
          }

          if (typeof handler === 'function') {
            return handler(req, res)
          }

          const route: MiddlewareRoute = handler

          return useMiddlewares(route.middlewares, req, res, () => route.endpoint(req, res))
        }

  return (req, res) => useMiddlewares(allMiddleware, req, res, actualEndpoint)
}
