import { AxiosErrorResponse } from '@app/models'
import { isDyoApiError } from '@app/utils'
import { NextApiRequest, NextApiResponse } from 'next'

const useKratosErrorMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>,
): Promise<void> => {
  try {
    await next()
  } catch (err) {
    if (isDyoApiError(err)) {
      throw err
    } else if (err.response) {
      const error = err.response as AxiosErrorResponse<any>
      res.status(error.status).json(error.data)
      return
    }

    console.error('[ERROR][INTERNAL]:', err)
    throw err
  }
}

export default useKratosErrorMiddleware
