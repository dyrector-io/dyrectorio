import { Status } from '@grpc/grpc-js/build/src/constants'
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { catchError, Observable } from 'rxjs'
import BaseGrpcException from 'src/exception/crux-exception'
import InterceptorGrpcHelperProvider from './helper.interceptor'

/**
 * gRPC request controller logger. We are using this to get more information
 * about our gRPC service calls.
 *
 * Disclaimer: Works only with gRPC controllers.
 */
@Injectable()
export default class GrpcLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GrpcLoggerInterceptor.name)

  constructor(private readonly helper: InterceptorGrpcHelperProvider) {}

  shouldLogStack(err: Error) {
    const grpcErr = err as BaseGrpcException
    if (grpcErr.getError && (grpcErr.getError() as GrpcError).code !== Status.INTERNAL) {
      return false
    }
    return true
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const result = this.helper.mapToGrpcObject(context)
    const data = JSON.stringify(result.data)

    this.logger.verbose(`gRPC ${result.serviceCall} called with the following object: ${data}`)

    return next.handle().pipe(
      catchError((err: Error | BaseGrpcException) => {
        const message = `gRPC ${result.serviceCall} failed with: ${data}`
        if (this.shouldLogStack(err)) {
          this.logger.error(message, err.stack)
        } else {
          this.logger.error(message)
        }
        throw err
      }),
    )
  }
}

interface GrpcError {
  code?: number
}
