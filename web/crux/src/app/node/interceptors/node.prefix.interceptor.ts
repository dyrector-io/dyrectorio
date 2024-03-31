import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { GLOBAL_PREFIX } from '../node.const'

@Injectable()
export default class NodePrefixInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { params } = context.switchToHttp().getRequest()

    if (params.prefix && params.prefix === GLOBAL_PREFIX) {
      params.prefix = ''
    }

    return next.handle()
  }
}
