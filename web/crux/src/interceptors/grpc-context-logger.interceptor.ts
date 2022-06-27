import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { InterceptorGrpcHelperProvider } from './helper.interceptor'

/**
 * gRPC request controller logger. We are using this to get more information
 * about our gRPC service calls.
 *
 * Disclaimer: Works only with gRPC controllers.
 */
@Injectable()
export class GrpcContextLogger implements NestInterceptor {
  private readonly logger = new Logger(GrpcContextLogger.name)

  constructor(private readonly helper: InterceptorGrpcHelperProvider) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const result = this.helper.mapToGrpcObject(context)
    this.logger.debug(`gRPC ${result.serviceCall} called with the following object: ${JSON.stringify(result.data)}`)

    return next.handle()
  }
}
