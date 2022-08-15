import { Status } from '@grpc/grpc-js/build/src/constants'
import { BaseGrpcException, BaseGrpcExceptionOptions } from './crux-exception'

export const mapNotFoundError = (property: string) => () =>
  new NotFoundException({
    message: `${property} not found`,
    property,
  })

export type AlreadyExistsExceptionOptions = Omit<BaseGrpcExceptionOptions, 'status'> & {
  property: string
  value?: string
}

export class AlreadyExistsException extends BaseGrpcException {
  constructor(options: AlreadyExistsExceptionOptions) {
    super({
      ...options,
      status: Status.ALREADY_EXISTS,
    })
  }
}

export type NotFoundExceptionOptions = Omit<BaseGrpcExceptionOptions, 'status'> & {
  property: string
  value?: any
}

export class NotFoundException extends BaseGrpcException {
  constructor(options: NotFoundExceptionOptions) {
    super({
      ...options,
      status: Status.NOT_FOUND,
    })
  }
}

export type InvalidArgumentExceptionOptions = Omit<BaseGrpcExceptionOptions, 'status'> & {
  property: string
  value?: any
}

export class InvalidArgumentException extends BaseGrpcException {
  constructor(options: InvalidArgumentExceptionOptions) {
    super({
      ...options,
      status: Status.INVALID_ARGUMENT,
    })
  }
}

export type PreconditionFailedExceptionOptions = Omit<BaseGrpcExceptionOptions, 'status'> & {
  property: string
  value?: any
}

export class PreconditionFailedException extends BaseGrpcException {
  constructor(options: PreconditionFailedExceptionOptions) {
    super({
      ...options,
      status: Status.FAILED_PRECONDITION,
    })
  }
}

export type UnauthenticatedExceptionOptions = Omit<BaseGrpcExceptionOptions, 'status'>

export class UnauthenticatedException extends BaseGrpcException {
  constructor(options: UnauthenticatedExceptionOptions) {
    super({
      ...options,
      status: Status.UNAUTHENTICATED,
    })
  }
}

export type InternalExceptionOptions = Omit<BaseGrpcExceptionOptions, 'status'>

export class InternalException extends BaseGrpcException {
  constructor(options: InternalExceptionOptions) {
    super({
      ...options,
      status: Status.INTERNAL,
    })
  }
}

export class PermissionDeniedException extends BaseGrpcException {
  constructor(options: InternalExceptionOptions) {
    super({
      ...options,
      status: Status.PERMISSION_DENIED,
    })
  }
}

export class DatabaseException extends InternalException {
  constructor(
    options: InternalExceptionOptions = {
      message: 'Database error.',
    },
  ) {
    super(options)
  }
}

export class UserNotFoundException extends InternalException {
  constructor(
    options: InternalExceptionOptions = {
      message: 'User is not found.',
    },
  ) {
    super(options)
  }
}

export class MailServiceException extends InternalException {
  constructor(
    options: InternalExceptionOptions = {
      message: 'Mail server error.',
    },
  ) {
    super(options)
  }
}

export class EmailBuilderException extends InternalException {
  constructor(
    options: InternalExceptionOptions = {
      message: 'Failed to create email item',
    },
  ) {
    super(options)
  }
}
