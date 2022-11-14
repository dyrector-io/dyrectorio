import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { IncomingMessage } from 'http'
import { Observable } from 'rxjs'

/**
 * HTTP request controller logger. We are using this to get more information
 * about our HTTP service calls.
 *
 * Disclaimer: Works only with HTTP controllers.
 */
@Injectable()
export default class HttpLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpLoggerInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.getArgByIndex<IncomingMessage>(0)
    this.logger.debug(`HTTP ${request.method} ${request.url} path called.`)
    return next.handle()
  }
}
