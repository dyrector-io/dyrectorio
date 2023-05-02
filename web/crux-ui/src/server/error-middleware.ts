import { DyoApiError } from '@app/models'
import { isDyoApiError } from '@app/utils'
import { NextApiRequest, NextApiResponse } from 'next'

// eslint-disable-next-line import/prefer-default-export
export const useErrorMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>,
): Promise<void> => {
  try {
    res.setHeader('Content-Type', 'application/json')
    await next()
  } catch (err) {
    if (isDyoApiError(err) && err.status < 500) {
      const error = err as DyoApiError
      res.statusCode = err.status

      res.json({
        error: error.error,
        property: error.property,
        value: error.value,
        description: error.description,
      })
    } else {
      res.statusCode = 500

      if (process.env.NODE_ENV !== 'production') {
        res.json({
          message: 'Internal Server Error',
          error: err,
        })
      } else {
        res.end()
      }
    }
  }
}
