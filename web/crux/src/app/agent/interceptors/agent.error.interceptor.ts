import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, catchError } from 'rxjs'
import { GrpcException } from 'src/exception/grpc-exception'

@Injectable()
export default class AgentErrorInterceptor implements NestInterceptor {
  async intercept(_: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    return next.handle().pipe(
      catchError(err => {
        if (err instanceof HttpException) {
          throw new GrpcException(err)
        }

        throw err
      }),
    )
  }
}
