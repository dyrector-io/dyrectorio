import { DyoApiError, UnavailableErrorType } from './models'

export const invalidArgument = (
  property: string,
  description?: string,
  value?: string,
  error?: string,
): DyoApiError => ({
  status: 400,
  error: error ?? 'invalidArgument',
  property,
  description: description ?? `Invalid ${property}`,
  value,
})

export const missingParameter = (property: string, description?: string): DyoApiError => ({
  status: 400,
  error: 'missingParameter',
  property,
  description: description ?? `Missing ${property}`,
})

export const notFoundError = (property: string, description?: string, value?: string, error?: string): DyoApiError => ({
  status: 404,
  error: error ?? 'notFound',
  property,
  value,
  description: description ?? `The value of ${property} not found.`,
})

export const alreadyExistsError = (
  property: string,
  description?: string,
  value?: string,
  error?: string,
): DyoApiError => ({
  status: 409,
  error: error ?? 'alreadyExists',
  property,
  value,
  description: description ?? `The value of ${property} already exists.`,
})

export const preconditionFailedError = (
  property: string,
  description?: string,
  value?: string,
  error?: string,
): DyoApiError => ({
  status: 412,
  error: error ?? 'preconditionFailed',
  property,
  value,
  description: description ?? `Precondition failed for: ${property}`,
})

export const unauthorizedError = (
  description: string = 'Unauthorized',
  property?: string,
  error?: string,
): DyoApiError => ({
  status: 401,
  property,
  error: error ?? 'unauthorized',
  description,
})

export const forbiddenError = (description: string = 'Forbidden', error?: string): DyoApiError => ({
  status: 403,
  error: error ?? 'forbidden',
  description,
})

export const internalError = (description: string): DyoApiError => ({
  status: 500,
  error: 'internalError',
  description,
})

export const unavailableError = (error: UnavailableErrorType, description: string): DyoApiError => ({
  status: 503,
  error,
  description,
})

type CruxApiError = {
  message: string
  property?: string
  value?: string
  error?: string
}

export const fromApiError = (status: number, apiError: CruxApiError): DyoApiError => {
  const { message, property, value, error } = apiError

  switch (status) {
    case 503: {
      return unavailableError('crux', message)
    }
    case 401: {
      return unauthorizedError(message, property, error)
    }
    case 404: {
      return notFoundError(property, message, value, error)
    }
    case 400: {
      return invalidArgument(property, message, value, error)
    }
    case 409: {
      return alreadyExistsError(property, message, value, error)
    }
    case 412: {
      return preconditionFailedError(property, message, value, error)
    }
    case 403: {
      return forbiddenError(message, error)
    }
    default: {
      return internalError(apiError.message ?? 'Unknown error')
    }
  }
}
