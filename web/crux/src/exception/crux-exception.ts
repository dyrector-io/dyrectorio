import { HttpException, HttpStatus } from '@nestjs/common'

export type CruxExceptionOptions = {
  message: string
  property?: string
  value?: any
}

export class CruxException extends HttpException {
  constructor(status: HttpStatus, options: CruxExceptionOptions) {
    super(options, status)
  }
}

export class CruxBadRequestException extends CruxException {
  constructor(options: CruxExceptionOptions) {
    super(HttpStatus.BAD_REQUEST, options)
  }
}

export class CruxUnauthorizedException extends CruxException {
  constructor(options?: Pick<CruxExceptionOptions, 'message'>) {
    super(HttpStatus.UNAUTHORIZED, { message: options?.message ?? 'Unauthorized.' })
  }
}

export class CruxForbiddenException extends CruxException {
  constructor(options?: Pick<CruxExceptionOptions, 'message'>) {
    super(HttpStatus.FORBIDDEN, { message: options?.message ?? 'Forbidden.' })
  }
}

export class CruxNotFoundException extends CruxException {
  constructor(options: CruxExceptionOptions) {
    super(HttpStatus.NOT_FOUND, options)
  }
}

export class CruxConflictException extends CruxException {
  constructor(options: CruxExceptionOptions) {
    super(HttpStatus.CONFLICT, options)
  }
}

export class CruxPreconditionFailedException extends CruxException {
  constructor(options: CruxExceptionOptions) {
    super(HttpStatus.PRECONDITION_FAILED, options)
  }
}

export class CruxInternalServerErrorException extends CruxException {
  constructor(options: CruxExceptionOptions) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, options)
  }
}
