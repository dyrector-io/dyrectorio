import { Status } from '@grpc/grpc-js/build/src/constants'
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common'
import { Request, Response } from 'express'
import BaseGrpcException from 'src/exception/crux-exception'

interface Exception {
  name: string
  message: string
  meta?: { message: string }
}

type ExceptionNameToStatusMapping = { [name: string]: number }
type GRPCStatusToHttpStatusMapping = { [S in Status]: number }

@Catch()
export default class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    if (exception.meta) {
      return HttpExceptionFilter.error(response, 400, request.url, exception.meta.message)
    }

    if (exception instanceof BaseGrpcException) {
      const { details } = exception as BaseGrpcException
      const { message, status } = details
      return HttpExceptionFilter.error(
        response,
        HttpExceptionFilter.GRPC_STATUS_TO_HTTP[status] ?? 400,
        request.url,
        message,
      )
    }

    return HttpExceptionFilter.error(
      response,
      HttpExceptionFilter.ERROR_TO_HTTP[exception.name] ?? 400,
      request.url,
      exception.message,
    )
  }

  static error(response: Response<any, Record<string, any>>, statusCode: number, path: string, message: any) {
    return response.status(statusCode).json({
      statusCode,
      timestamp: new Date().toISOString(),
      path,
      message,
    })
  }

  private static readonly ERROR_TO_HTTP: ExceptionNameToStatusMapping = {
    NotFoundException: 404,
    UnauthorizedException: 401,
    UnauthenticatedException: 403,
    PermissionDeniedException: 403,
    AlreadyExistsException: 409,
    InternalException: 500,
    PreconditionFailedException: 412,
    NotImplementedException: 501,
  }

  private static readonly GRPC_STATUS_TO_HTTP: GRPCStatusToHttpStatusMapping = {
    [Status.OK]: 200,
    [Status.CANCELLED]: 400,
    [Status.UNKNOWN]: 400,
    [Status.INVALID_ARGUMENT]: 400,
    [Status.DEADLINE_EXCEEDED]: 400,
    [Status.NOT_FOUND]: 404,
    [Status.ALREADY_EXISTS]: 409,
    [Status.PERMISSION_DENIED]: 403,
    [Status.RESOURCE_EXHAUSTED]: 400,
    [Status.FAILED_PRECONDITION]: 412,
    [Status.ABORTED]: 400,
    [Status.OUT_OF_RANGE]: 400,
    [Status.UNIMPLEMENTED]: 501,
    [Status.INTERNAL]: 500,
    [Status.UNAVAILABLE]: 400,
    [Status.DATA_LOSS]: 400,
    [Status.UNAUTHENTICATED]: 401,
  }
}
