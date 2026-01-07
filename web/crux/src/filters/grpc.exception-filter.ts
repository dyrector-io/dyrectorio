import { Status } from '@grpc/grpc-js/build/src/constants'
import { HandlerType, ServerReadableStream } from '@grpc/grpc-js/build/src/server-call'
import { ArgumentsHost, Catch, HttpException, Logger, RpcExceptionFilter } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { Observable, of, throwError } from 'rxjs'
import { CruxInternalServerErrorException } from 'src/exception/crux-exception'
import { GrpcErrorObject, GrpcException } from 'src/exception/grpc-exception'

@Catch()
export default class GrpcExceptionFilter implements RpcExceptionFilter {
  private readonly logger = new Logger('GRPC')

  catch(exception: Error, host: ArgumentsHost): Observable<any> {
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, host)
    }

    if (exception instanceof RpcException) {
      return this.handleRpcException(exception, host)
    }

    this.logger.error('Unhandled Exception')
    this.logger.error(`${exception.name}: ${exception.message}`, exception.stack)
    return this.handleHttpException(
      new CruxInternalServerErrorException({
        message: 'UnhandledException',
      }),
      host,
    )
  }

  private handleHttpException(exception: HttpException, host: ArgumentsHost): Observable<any> {
    const res = exception.getResponse()
    this.logger.verbose(`${exception.getStatus()} ${typeof res === 'object' ? JSON.stringify(res) : res}`)

    const contextType = host.getType()
    const grpcException = new GrpcException(exception)
    if (contextType === 'rpc') {
      return this.handleRpcException(grpcException, host)
    }

    this.logger.error(`GrpcExceptionFilter was executed on a ${contextType} context`)
    throw Error('Invalid context.')
  }

  private handleRpcException(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const call = host.getArgByIndex(2) as GrpcCall
    const { handler } = call.call

    const err: GrpcErrorObject =
      typeof exception.getError() === 'object'
        ? (exception.getError() as GrpcErrorObject)
        : {
            name: 'unknown',
            code: Status.UNKNOWN,
            message: exception.getError() as string,
          }

    this.logger.error(`${err.code} ${handler.path} ${err.message}`)

    if (call.call.handler.type === 'clientStream') {
      return this.sendErrorToClientStream(err, host)
    }

    return throwError(() => err)
  }

  private sendErrorToClientStream(error: GrpcErrorObject, host: ArgumentsHost): Observable<any> {
    const call = host.getArgByIndex(2) as ServerReadableStream<any, any>

    call.destroy(error)

    return of({})
  }
}

type GrpcCall = {
  call: {
    handler: {
      type: HandlerType
      path: string
    }
  }
}
