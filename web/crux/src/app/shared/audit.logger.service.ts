import { Injectable } from '@nestjs/common'
import { WsArgumentsHost } from '@nestjs/common/interfaces'
import TeamRepository from 'src/app/team/team.repository'
import { AuditLogLevelOption } from 'src/decorators/audit-logger.decorator'
import { Identity } from '@ory/kratos-client'
import { Request as ExpressRequest } from 'express'
import { WsClient, WsMessage } from 'src/websockets/common'
import PrismaService from '../../services/prisma.service'

@Injectable()
export default class AuditLoggerService {
  constructor(private readonly prisma: PrismaService, private readonly teamRepository: TeamRepository) {}

  private mapRequestToServiceCall(request: ExpressRequest): string {
    const {
      route: { path },
      url,
      method,
    } = request

    return `${method} ${path} ${url}`
  }

  async createHttpAudit(level: AuditLogLevelOption, identity: Identity, request: ExpressRequest) {
    const { body } = request
    const data = level === 'no-data' ? undefined : body

    // Check the team is existing with the given user id
    const activeTeam = await this.teamRepository.getActiveTeamByUserId(identity.id)

    await this.prisma.auditLog.create({
      data: {
        userId: identity.id,
        teamId: activeTeam.teamId,
        serviceCall: this.mapRequestToServiceCall(request),
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
        serviceCall: `WS ${type}`,
        data: level === 'no-data' ? undefined : data,
      },
    })
  }
}
