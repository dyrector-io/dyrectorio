import { Injectable } from '@nestjs/common'
import { WsArgumentsHost } from '@nestjs/common/interfaces'
import { AuditLogRequestMethodEnum } from '@prisma/client'
import TeamRepository from 'src/app/team/team.repository'
import { AuditLogLevelOption } from 'src/decorators/audit-logger.decorator'
import { auditActorOfRequest } from 'src/domain/audit'
import PrismaService from 'src/services/prisma.service'
import { WsClient, WsMessage } from 'src/websockets/common'
import { AuthorizedHttpRequest } from '../token/jwt-auth.guard'

@Injectable()
export default class AuditLoggerService {
  constructor(private readonly prisma: PrismaService, private readonly teamRepository: TeamRepository) {}

  async createHttpAudit(level: AuditLogLevelOption, request: AuthorizedHttpRequest): Promise<void> {
    const { method, url, body } = request
    const data = level === 'no-data' ? null : body

    const actor = auditActorOfRequest(request)

    if (actor.type === 'user') {
      const { userId } = actor
      const activeTeam = await this.teamRepository.getActiveTeamByUserId(userId)

      await this.prisma.auditLog.create({
        data: {
          actorType: 'user',
          userId,
          teamId: activeTeam.teamId,
          context: 'http',
          method: this.httpMethodToRequestMethodEnum(method),
          event: url,
          data,
        },
      })

      return
    }

    // deploymentToken
    const { deploymentId } = actor

    const deploymentToken = await this.prisma.deploymentToken.findUnique({
      where: {
        deploymentId,
      },
      select: {
        id: true,
        deployment: {
          select: {
            version: {
              select: {
                project: {
                  select: {
                    teamId: true, // ♫♪♫ rockin' around, the christmas tree ♪♫♫
                  },
                },
              },
            },
          },
        },
      },
    })

    await this.prisma.auditLog.create({
      data: {
        actorType: 'deploymentToken',
        deploymentTokenId: deploymentToken.id,
        teamId: deploymentToken.deployment.version.project.teamId,
        context: 'http',
        method: this.httpMethodToRequestMethodEnum(method),
        event: url,
        data,
      },
    })
  }

  async createWsAudit(level: AuditLogLevelOption, context: WsArgumentsHost) {
    const client = context.getClient() as WsClient
    const { type, data } = context.getData() as WsMessage<any>

    const user = client.connectionRequest.identity
    const activeTeam = await this.teamRepository.getActiveTeamByUserId(user.id)

    await this.prisma.auditLog.create({
      data: {
        actorType: 'user',
        userId: user.id,
        teamId: activeTeam.teamId,
        context: 'ws',
        method: null,
        event: type,
        data: level === 'no-data' ? undefined : data,
      },
    })
  }

  private httpMethodToRequestMethodEnum(method: string): AuditLogRequestMethodEnum | null {
    switch (method) {
      case 'GET':
        return 'get'
      case 'POST':
        return 'post'
      case 'PUT':
        return 'put'
      case 'PATCH':
        return 'patch'
      case 'DELETE':
        return 'delete'
      default:
        return null
    }
  }
}
