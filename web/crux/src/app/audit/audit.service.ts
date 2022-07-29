import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/services/prisma.service'
import { AccessRequest, AuditLogListResponse } from 'src/grpc/protobuf/proto/crux'
import { AuditMapper } from './audit.mapper'
import { KratosService } from 'src/services/kratos.service'

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
