import { NextApiRequest, NextApiResponse } from 'next'
import { isDyoApiError } from './error-middleware'

export const useKratosErrorMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>,
): Promise<void> => {
  try {
    await next()
  } catch (err) {
    if (isDyoApiError(err)) {
      throw err
    } else {
      res.status(err.response.status).json(err.response.data)
    }
  }
}
