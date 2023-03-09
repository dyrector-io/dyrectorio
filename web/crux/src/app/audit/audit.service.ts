import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { Prisma } from '@prisma/client'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import { AuditLogListDto, AuditLogQueryDto } from './audit.dto'

@Injectable()
export default class AuditService {
  constructor(private readonly prisma: PrismaService, private readonly kratos: KratosService) {}

  async getAuditLog(query: AuditLogQueryDto, identity: Identity): Promise<AuditLogListDto> {
    const { skip, take, from, to } = query

    const where: Prisma.AuditLogWhereInput = {
      team: {
        users: {
          some: {
            userId: identity.id,
            active: true,
          },
        },
      },
      AND: {
        createdAt: {
          gte: from,
          lte: to,
        },
        ...(await this.stringFilter(query)),
      },
    }

    const [auditLog, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
        select: {
          createdAt: true,
          userId: true,
          serviceCall: true,
          data: true,
        },
      }),
      this.prisma.auditLog.count({ where }),
    ])

    const identities = await this.kratos.getIdentitiesByIds(new Set(auditLog.map(it => it.userId)))

    return {
      items: auditLog.map(it => ({
        ...it,
        email: identities.get(it.userId).traits.email as string,
        data: it.data as object,
      })),
      total,
    }
  }

  private async stringFilter(query: AuditLogQueryDto): Promise<Prisma.AuditLogWhereInput> {
    const { filter } = query

    if (!filter) {
      return {}
    }

    const userIds = await this.kratos.getIdentityIdsByEmail(filter)

    return {
      OR: [
        {
          userId: {
            in: userIds,
          },
        },
        {
          serviceCall: {
            contains: `%${filter}%`,
            mode: 'insensitive',
          },
        },
      ],
    }
  }
}
