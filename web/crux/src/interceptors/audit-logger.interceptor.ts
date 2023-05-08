import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable, tap } from 'rxjs'
import AuditLoggerService from 'src/app/shared/audit.logger.service'
import { identityOfRequest } from 'src/app/token/jwt-auth.guard'
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
    const auditLevel = this.reflector.get<AuditLogLevelOption>(AUDIT_LOGGER_LEVEL, context.getHandler())
    const level = auditLevel ?? 'all'

    if (level === 'disabled') {
      return next.handle()
    }

    if (context.getType() === 'http') {
      const user = identityOfRequest(context)
      if (!user) {
        return next.handle()
      }

      const request = context.switchToHttp().getRequest()
      const {
        route: {
          methods: { get },
        },
      } = request

      if (get && !auditLevel) {
        return next.handle()
      }

      return next.handle().pipe(
        tap(async () => {
          await this.service.createHttpAudit(level, user, request)
        }),
      )
    }

    if (context.getType() === 'ws') {
      const wsContext = context.switchToWs()
      const { type } = wsContext.getData() as WsMessage<any>

      if (type === WS_TYPE_SUBSCRIBE || type === WS_TYPE_UNSUBSCRIBE) {
        return next.handle()
      }

      return next.handle().pipe(
        tap(async () => {
          await this.service.createWsAudit(level, wsContext)
        }),
      )
    }

    return next.handle()
  }
}
