import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request as ExpressRequest } from 'express'
import { Observable, concatMap, of, tap } from 'rxjs'
import AuditLoggerService from 'src/app/audit.logger/audit.logger.service'
import { AuthorizedHttpRequest } from 'src/app/token/jwt-auth.guard'
import { AUDIT_LOGGER_LEVEL, AuditLogLevelOption } from 'src/decorators/audit-logger.decorator'
import { WS_TYPE_SUBSCRIBE, WS_TYPE_UNSUBSCRIBE, WsMessage } from 'src/websockets/common'

/**
 * Audit Logger Interceptor helps to log every activity to a database and only
 * ones where the transaction are run successfully.
 */
@Injectable()
export default class AuditLoggerInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector, private readonly service: AuditLoggerService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const level = this.reflector.get<AuditLogLevelOption>(AUDIT_LOGGER_LEVEL, context.getHandler())

    if (level === 'disabled') {
      return next.handle()
    }

    if (context.getType() === 'http') {
      return await this.logHttp(context, next, level)
    }

    if (context.getType() === 'ws') {
      return await this.logWebSocket(context, next, level)
    }

    return next.handle()
  }

  private async logHttp(
    context: ExecutionContext,
    next: CallHandler,
    level: AuditLogLevelOption | null,
  ): Promise<Observable<any>> {
    const req: ExpressRequest = context.switchToHttp().getRequest()

    if (!level && req.method === 'GET') {
      return next.handle()
    }

    return next.handle().pipe(
      tap(async () => {
        await this.service.createHttpAudit(level, req as AuthorizedHttpRequest)
      }),
    )
  }

  private async logWebSocket(
    context: ExecutionContext,
    next: CallHandler,
    level: AuditLogLevelOption,
  ): Promise<Observable<any>> {
    const wsContext = context.switchToWs()
    const { type } = wsContext.getData() as WsMessage<any>

    if (type === WS_TYPE_SUBSCRIBE || type === WS_TYPE_UNSUBSCRIBE) {
      return next.handle()
    }

    return next.handle().pipe(
      // log only the first
      concatMap((it, index) =>
        index === 0
          ? of(it).pipe(
              tap(async () => {
                await this.service.createWsAudit(level, wsContext)
              }),
            )
          : of(it),
      ),
    )
  }
}
