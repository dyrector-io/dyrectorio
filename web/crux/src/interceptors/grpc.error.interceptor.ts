import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { catchError, Observable } from 'rxjs'
import { PreconditionFailedException } from 'src/exception/errors'
import InterceptorGrpcHelperProvider from './helper.interceptor'

const DNS_LOOKUP_FAILED = 'ENOTFOUND'

@Injectable()
export default class GrpcErrorInterceptor implements NestInterceptor {
  constructor(private readonly helper: InterceptorGrpcHelperProvider) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const result = this.helper.mapToGrpcObject(context)
    return next.handle().pipe(
      catchError((err: SystemError) => {
        // DNS_LOOKUP_FAILED from https://nodejs.org/api/errors.html
        if (err.code === DNS_LOOKUP_FAILED) {
          throw new PreconditionFailedException({
            message: `${err.message} ${result.serviceCall} failed, make sure that the endpoint is reachable!`,
            property: 'environment',
          })
        }

        throw err as Error
      }),
    )
  }
}

interface SystemError extends Error {
  code: string
}
