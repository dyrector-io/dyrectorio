import {
  alreadyExistsError,
  forbiddenError,
  internalError,
  invalidArgument,
  notFoundError,
  preconditionFailedError,
  unauthorizedError,
  unavailableError,
} from '@app/error-responses'
import { DyoApiError } from '@app/models'
import { isDyoApiError } from '@app/utils'
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

export const fromApiError = (
  status: number,
  error: { message: string; property?: string; value?: string },
): DyoApiError => {
  switch (status) {
    case 503: {
      const dto = error as UnavailableError
      return unavailableError('crux', dto.message)
    }
    case 401: {
      const dto = error as UnauthenticatedError
      return unauthorizedError(dto.message)
    }
    case 404: {
      const dto = error as NotFoundError
      return notFoundError(dto.property, dto.message, dto.value)
    }
    case 400: {
      const dto = error as InvalidArgumentError
      return invalidArgument(dto.property, dto.message, dto.value)
    }
    case 409: {
      const dto = error as AlreadyExistsError
      return alreadyExistsError(dto.property, dto.message, dto.value)
    }
    case 412: {
      const dto = error as PreconditionFailedError
      return preconditionFailedError(dto.property, dto.message, dto.value)
    }
    case 403: {
      return forbiddenError(error.message)
    }
    default: {
      return internalError(error?.message ?? 'Unknown error')
    }
  }
}

export const parseGrpcError = (error: ServiceError): CruxGrpcError => {
  let { message } = error
  let details

  try {
    const json = JSON.parse(error.details)
    message = json.message
    details = json.details
    // TODO(@m8vago)
    // eslint-disable-next-line
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
