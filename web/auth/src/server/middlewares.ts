import { NextApiRequest, NextApiResponse } from 'next'

export type MiddlewareFunction = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>,
) => Promise<void>

export const useMiddlewares = async (
  middlewares: MiddlewareFunction[],
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>,
) => {
  let i = 0
  const callNext = async () =>
    (await i) < middlewares.length ? await callNextMiddleware() : await next()
  const callNextMiddleware = async () =>
    await middlewares[i++](req, res, callNext)

  await callNextMiddleware()
}
