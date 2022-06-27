import { DyoErrorDto, UnavailableErrorType } from '@app/models'
import { isDyoError } from '@app/utils'
import { ServiceError } from '@grpc/grpc-js'
import { Status } from '@grpc/grpc-js/build/src/constants'
import { NextApiRequest, NextApiResponse } from 'next'
import {
  AlreadyExistsError,
  CruxGrpcError,
  InvalidArgumentError,
  NotFoundError,
  PreconditionFailedError,
  UnauthenticatedError,
  UnavailableError,
} from './crux/grpc-errors'

export type DyoApiError = DyoErrorDto & {
  status: number
}

export const isDyoApiError = (instance: any): instance is DyoApiError => isDyoError(instance) && 'status' in instance

export const invalidArgument = (property: string, description?: string, value?: string): DyoApiError => {
  return {
    status: 400,
    error: 'invalidArgument',
    property,
    description: description ?? `Invalid ${property}`,
    value,
  }
}

export const missingParameter = (property: string, description?: string): DyoApiError => {
  return {
    status: 400,
    error: 'missingParameter',
    property,
    description: description ?? `Missing ${property}`,
  }
}

export const notFoundError = (property: string, description?: string, value?: string): DyoApiError => {
  return {
    status: 404,
    error: 'notFound',
    property,
    value,
    description: description ?? `The value of ${property} not found.`,
  }
}

export const alreadyExistsError = (property: string, description?: string, value?: string): DyoApiError => {
  return {
    status: 409,
    error: 'alreadyExists',
    property,
    value,
    description: description ?? `The value of ${property} already exists.`,
  }
}

export const preconditionFailedError = (property: string, description?: string, value?: string): DyoApiError => {
  return {
    status: 412,
    error: 'preconditionFailed',
    property,
    value,
    description: description ?? `Precondition failed for: ${property}`,
  }
}

export const unauthorizedError = (description: string = 'Unauthorized'): DyoApiError => {
  return {
    status: 401,
    error: 'unauthorized',
    description,
  }
}

export const forbiddenError = (description: string = 'Forbidden'): DyoApiError => {
  return {
    status: 403,
    error: 'forbidden',
    description,
  }
}

export const internalError = (description: string): DyoApiError => {
  return {
    status: 500,
    error: 'internalError',
    description,
  }
}

export const unavailableError = (error: UnavailableErrorType, description: string): DyoApiError => {
  return {
    status: 503,
    error,
    description,
  }
}

export const parseGrpcError = (error: ServiceError): CruxGrpcError => {
  let message = error.message
  let details = undefined

  try {
    const json = JSON.parse(error.details)
    message = json.message
    details = json.details
  } catch {}

  return {
    status: error.code,
    message,
    ...details,
  }
}

// nestjs magic string
const FORBIDDEN_MESSAGE = '2 UNKNOWN: Forbidden resource'

export const fromGrpcError = (error: CruxGrpcError) => {
  switch (error.status) {
    case Status.UNAVAILABLE: {
      const dto = error as UnavailableError
      return unavailableError('crux', dto.message)
    }
    case Status.UNAUTHENTICATED: {
      const dto = error as UnauthenticatedError
      return unauthorizedError(dto.message)
    }
    case Status.NOT_FOUND: {
      const dto = error as NotFoundError
      return notFoundError(dto.property, dto.message, dto.value)
    }
    case Status.INVALID_ARGUMENT: {
      const dto = error as InvalidArgumentError
      return invalidArgument(dto.property, dto.message, dto.value)
    }
    case Status.ALREADY_EXISTS: {
      const dto = error as AlreadyExistsError
      return alreadyExistsError(dto.property, dto.message, dto.value)
    }
    case Status.FAILED_PRECONDITION: {
      const dto = error as PreconditionFailedError
      return preconditionFailedError(dto.property, dto.message, dto.value)
    }
    case Status.PERMISSION_DENIED: {
      return forbiddenError(error.message)
    }
    default: {
      if (error.message === FORBIDDEN_MESSAGE) {
        return forbiddenError(error.message)
      }

      return internalError(error.message)
    }
  }
}

export const useErrorMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>,
): Promise<void> => {
  try {
    res.setHeader('Content-Type', 'application/json')
    await next()
  } catch (e) {
    if (isDyoApiError(e) && e.status < 500) {
      const error = e as DyoApiError
      res.statusCode = e.status

      res.json({
        error: error.error,
        property: error.property,
        value: error.value,
        description: error.description,
      })
    } else {
      console.error('Internal Server Error: ', e)
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
