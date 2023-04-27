import { Status } from '@grpc/grpc-js/build/src/constants'
import { HttpException, HttpStatus } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { CruxExceptionOptions } from './crux-exception'

export type GrpcExceptionOptions = Pick<CruxExceptionOptions, 'message'> & {
  details?: Omit<CruxExceptionOptions, 'message'>
}

export class GrpcException extends RpcException {
  constructor(httpException: HttpException) {
    super(GrpcException.convertHttpException(httpException))
  }

  private static convertHttpException(exception: HttpException) {
    const res = exception.getResponse() as string | CruxExceptionOptions

    return {
      code: GrpcException.httpStatusToGrpc(exception.getStatus()),
      message: JSON.stringify(GrpcException.formatMessage(res)),
    }
  }

  private static formatMessage(res: string | CruxExceptionOptions): GrpcExceptionOptions {
    if (typeof res === 'string') {
      return {
        message: res,
      }
    }

    const { message, ...rest } = res

    return {
      message,
      details: rest ?? undefined,
    }
  }

  private static httpStatusToGrpc(status: HttpStatus): Status {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return Status.INVALID_ARGUMENT
      case HttpStatus.UNAUTHORIZED:
        return Status.UNAUTHENTICATED
      case HttpStatus.FORBIDDEN:
        return Status.PERMISSION_DENIED
      case HttpStatus.NOT_FOUND:
        return Status.NOT_FOUND
      case HttpStatus.CONFLICT:
        return Status.ALREADY_EXISTS
      case HttpStatus.PRECONDITION_FAILED:
        return Status.FAILED_PRECONDITION
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return Status.INTERNAL
      case HttpStatus.NOT_IMPLEMENTED:
        return Status.UNIMPLEMENTED
      case HttpStatus.SERVICE_UNAVAILABLE:
        return Status.UNAVAILABLE
      case HttpStatus.REQUEST_TIMEOUT:
      case HttpStatus.GATEWAY_TIMEOUT:
        return Status.DEADLINE_EXCEEDED
      default: {
        if (status >= 200 && status < 300) {
          return Status.OK
        }

        return Status.UNKNOWN
      }
    }
  }
}
