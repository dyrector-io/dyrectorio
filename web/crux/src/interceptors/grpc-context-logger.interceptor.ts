import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { catchError, Observable } from 'rxjs'
import InterceptorGrpcHelperProvider from './helper.interceptor'

/**
 * gRPC request controller logger. We are using this to get more information
 * about our gRPC service calls.
 *
 * Disclaimer: Works only with gRPC controllers.
 */
@Injectable()
export default class GrpcContextLogger implements NestInterceptor {
  private readonly logger = new Logger(GrpcContextLogger.name)

  constructor(private readonly helper: InterceptorGrpcHelperProvider) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const result = this.helper.mapToGrpcObject(context)
    const data = JSON.stringify(result.data)

    this.logger.debug(`gRPC ${result.serviceCall} called with the following object: ${data}`)

    return next.handle().pipe(
      catchError((err: Error) => {
        this.logger.error(`gRPC ${result.serviceCall} failed with: ${data}`, err.stack)
        throw err
      }),
    )
  }
}
