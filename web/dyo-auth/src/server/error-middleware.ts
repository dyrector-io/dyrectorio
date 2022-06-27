import { NextApiRequest, NextApiResponse } from 'next'
import { isDyoError } from '@app/utils'
import { DyoErrorDto } from './models'

export type DyoApiError = DyoErrorDto & {
  status: number
}

const isDyoApiError = (instance: any) =>
  isDyoError(instance) && 'status' in instance

export const invalidParameter = (
  paramName: string,
  description?: string,
): DyoApiError => {
  return {
    status: 400,
    error: 'INVALID_PARAMETER',
    value: paramName,
    description: description ?? `Invalid ${paramName}`,
  }
}

export const missingParameter = (
  paramName: string,
  description?: string,
): DyoApiError => {
  return {
    status: 400,
    error: 'MISSING_PARAMETER',
    value: paramName,
    description: description ?? `Missing ${paramName}`,
  }
}

export const alreadyExistError = (
  paramName: string,
  description?: string,
): DyoApiError => {
  return {
    status: 409,
    error: 'ALREADY_EXIST',
    value: paramName,
    description: description ?? `The value of ${paramName} already exist.`,
  }
}

export const unauthorizedError = (
  description: string = 'Unauthorized',
): DyoApiError => {
  return {
    status: 401,
    error: 'UNAUTHORIZED',
    description,
  }
}

export const forbiddenError = (
  description: string = 'Forbidden',
): DyoApiError => {
  return {
    status: 403,
    error: 'FORBIDDEN',
    description,
  }
}

export const internalError = (description: string): DyoApiError => {
  return {
    status: 500,
    error: 'INTERNAL_ERROR',
    description,
  }
}

export async function useErrorMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>,
) {
  try {
    res.setHeader('Content-Type', 'application/json')
    await next()
  } catch (e) {
    if (isDyoApiError(e) && e.status < 500) {
      const error = e as DyoApiError
      res.statusCode = e.status

      res.json({
        error: error.error,
        value: error.value,
        description: error.description,
      })
    } else {
      console.log('Internal Server Error: ', e)
      res.statusCode = 500

      if (process.env.NODE_ENV !== 'production') {
        res.json({
          message: 'Internal Server Error',
          error: e,
        })
      } else {
        res.end()
      }
    }
  }
}
