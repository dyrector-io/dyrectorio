import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Request, Response } from 'express'
import { Observable, tap } from 'rxjs'

/**
 * HTTP request controller logger. We are using this to get more information
 * about our HTTP service calls.
 *
 * Disclaimer: Works only with HTTP controllers.
 */
@Injectable()
export default class HttpLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const req: Request = context.switchToHttp().getRequest()
        const res: Response = context.switchToHttp().getResponse()

        this.logger.log(`${res.statusCode} ${req.method} ${req.url}`)
      }),
    )
  }
}
