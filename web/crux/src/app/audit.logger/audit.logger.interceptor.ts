import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request as ExpressRequest } from 'express'
import { Observable, tap } from 'rxjs'
import AuditLoggerService from 'src/app/audit.logger/audit.logger.service'
import {
  AUDIT_LOGGER_LEVEL,
  AuditLogLevelOptions,
  teamSlugFromHttpRequestParams,
  teamSlugFromWsContext,
  teamSlugProviderOfContext,
} from 'src/decorators/audit-logger.decorator'
import { tapOnce } from 'src/domain/utils'
import { WS_TYPE_SUBSCRIBE, WS_TYPE_UNSUBSCRIBE, WsMessage } from 'src/websockets/common'

/**
 * Audit Logger Interceptor helps to log every activity to a database and only
 * ones where the transaction are run successfully.
 */
@Injectable()
export default class AuditLoggerInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly service: AuditLoggerService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const level = this.reflector.get<AuditLogLevelOptions>(AUDIT_LOGGER_LEVEL, context.getHandler())

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
    level: AuditLogLevelOptions | null,
  ): Promise<Observable<any>> {
    const req: ExpressRequest = context.switchToHttp().getRequest()

    if (!level && req.method === 'GET') {
      return next.handle()
    }

    const teamSlugProvider = teamSlugProviderOfContext(context, this.reflector) ?? teamSlugFromHttpRequestParams

    return next.handle().pipe(
      tap(async () => {
        await this.service.createHttpAudit(teamSlugProvider, level, context)
      }),
    )
  }

  private async logWebSocket(
    context: ExecutionContext,
    next: CallHandler,
    level: AuditLogLevelOptions,
  ): Promise<Observable<any>> {
    const wsContext = context.switchToWs()
    const { type } = wsContext.getData() as WsMessage<any>

    if (type === WS_TYPE_SUBSCRIBE || type === WS_TYPE_UNSUBSCRIBE) {
      return next.handle()
    }

    const teamSlugProvider = teamSlugProviderOfContext(context, this.reflector) ?? teamSlugFromWsContext

    return next.handle().pipe(
      tapOnce(async () => {
        await this.service.createWsAudit(teamSlugProvider, level, context)
      }),
    )
  }
}
