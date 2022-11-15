import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable, tap } from 'rxjs'
import TeamRepository from 'src/app/team/team.repository'
import PrismaService from 'src/services/prisma.service'
import { AuditLogLevelOption, AUDIT_LOGGER_LEVEL } from 'src/decorators/audit-logger.decorators'
import InterceptorGrpcHelperProvider from './helper.interceptor'

/**
 * Audit Logger Interceptor helps to log every activity to a database and only
 * ones where the transaction are run successfully.
 */
@Injectable()
export default class AuditLoggerInterceptor implements NestInterceptor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helper: InterceptorGrpcHelperProvider,
    private readonly teamRepository: TeamRepository,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const level = this.reflector.get<AuditLogLevelOption>(AUDIT_LOGGER_LEVEL, context.getHandler()) ?? 'all'

    if (level === 'disabled') {
      return next.handle()
    }

    const result = this.helper.mapToGrpcObject(context)

    // Check the team is existing with the given accessedBy Id
    const activeTeam = await this.teamRepository.getActiveTeamByUserId(result.userId)

    return next.handle().pipe(
      tap(async () => {
        await this.prisma.auditLog.create({
          data: {
            ...result,
            teamId: activeTeam.teamId,
            data: level === 'no-data' ? undefined : result.data,
          },
        })
      }),
    )
  }
}
