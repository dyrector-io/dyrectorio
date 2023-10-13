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
    const req: Request = context.switchToHttp().getRequest()
    this.logger.log(`Starting ${req.method} ${req.url}`)

    return next.handle().pipe(
      tap(() => {
        const res: Response = context.switchToHttp().getResponse()

        this.logger.log(`Finished ${res.statusCode} ${req.method} ${req.url}`)
      }),
    )
  }
}
