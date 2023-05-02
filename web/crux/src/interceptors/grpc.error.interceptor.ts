import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, catchError } from 'rxjs'
import { CruxInternalServerErrorException } from 'src/exception/crux-exception'
import { GrpcException } from 'src/exception/grpc-exception'
import InterceptorGrpcHelperProvider, { GrpcCallLog } from './helper.interceptor'

const DNS_LOOKUP_FAILED = 'ENOTFOUND'

@Injectable()
export default class GrpcErrorInterceptor implements NestInterceptor {
  constructor(private readonly helper: InterceptorGrpcHelperProvider) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const grpcCall = this.helper.mapToGrpcObject(context)
    return next.handle().pipe(
      catchError(err => {
        if (err instanceof HttpException) {
          throw new GrpcException(err)
        }

        this.handleGrpcError(grpcCall, err)
        return null
      }),
    )
  }

  handleGrpcError(grpcCall: GrpcCallLog, err: SystemError) {
    // DNS_LOOKUP_FAILED from https://nodejs.org/api/errors.html
    if (err.code === DNS_LOOKUP_FAILED) {
      throw new CruxInternalServerErrorException({
        message: `${err.message} ${grpcCall.serviceCall} failed, make sure that the endpoint is reachable!`,
        property: 'environment',
      })
    }

    throw err as Error
  }
}

interface SystemError extends Error {
  code: string
}
