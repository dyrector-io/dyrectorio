import { Injectable } from '@nestjs/common'
import { WsArgumentsHost } from '@nestjs/common/interfaces'
import { Identity } from '@ory/kratos-client'
import { Request as ExpressRequest } from 'express'
import TeamRepository from 'src/app/team/team.repository'
import { AuditLogLevelOption } from 'src/decorators/audit-logger.decorator'
import { WsClient, WsMessage } from 'src/websockets/common'
import PrismaService from 'src/services/prisma.service'
import { AuditLogRequestMethodEnum } from '@prisma/client'

@Injectable()
export default class AuditLoggerService {
  constructor(private readonly prisma: PrismaService, private readonly teamRepository: TeamRepository) {}

  async createHttpAudit(level: AuditLogLevelOption, identity: Identity, request: ExpressRequest) {
    const { method, url, body } = request
    const data = level === 'no-data' ? null : body

    // Check the team is existing with the given user id
    const activeTeam = await this.teamRepository.getActiveTeamByUserId(identity.id)

    await this.prisma.auditLog.create({
      data: {
        userId: identity.id,
        teamId: activeTeam.teamId,
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
