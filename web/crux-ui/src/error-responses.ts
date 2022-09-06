import { DyoApiError, UnavailableErrorType } from './models'

export const invalidArgument = (property: string, description?: string, value?: string): DyoApiError => ({
  status: 400,
  error: 'invalidArgument',
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

export const notFoundError = (property: string, description?: string, value?: string): DyoApiError => ({
  status: 404,
  error: 'notFound',
  property,
  value,
  description: description ?? `The value of ${property} not found.`,
})

export const alreadyExistsError = (property: string, description?: string, value?: string): DyoApiError => ({
  status: 409,
  error: 'alreadyExists',
  property,
  value,
  description: description ?? `The value of ${property} already exists.`,
})

export const preconditionFailedError = (property: string, description?: string, value?: string): DyoApiError => ({
  status: 412,
  error: 'preconditionFailed',
  property,
  value,
  description: description ?? `Precondition failed for: ${property}`,
})

export const unauthorizedError = (description: string = 'Unauthorized'): DyoApiError => ({
  status: 401,
  error: 'unauthorized',
  description,
})

export const forbiddenError = (description: string = 'Forbidden'): DyoApiError => ({
  status: 403,
  error: 'forbidden',
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
