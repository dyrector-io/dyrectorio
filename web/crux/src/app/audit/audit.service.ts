import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/config/prisma.service'
import { AccessRequest, AuditLogListResponse } from 'src/proto/proto/crux'
import { KratosService } from '../kratos.service'
import { AuditMapper } from './audit.mapper'

@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: AuditMapper,
    private readonly kratos: KratosService,
  ) {}

  async getAuditLog(request: AccessRequest): Promise<AuditLogListResponse> {
    const auditLog = await this.prisma.auditLog.findMany({
      where: {
        team: {
          users: {
            some: {
              userId: request.accessedBy,
              active: true,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const identites = await this.kratos.getIdentitiesByIds(auditLog.map(it => it.userId))

    return {
      data: auditLog.map(it => this.mapper.toGrpc(it, identites)),
    }
  }
}
