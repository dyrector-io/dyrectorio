import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import { AuditLogListDto, AuditLogQueryDto } from './audit.dto'
import AuditMapper from './audit.mapper'

@Injectable()
export default class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: AuditMapper,
    private readonly kratos: KratosService,
  ) {}

  async getAuditLog(teamSlug: string, query: AuditLogQueryDto): Promise<AuditLogListDto> {
    const { skip, take, from, to } = query

    const where: Prisma.AuditLogWhereInput = {
      team: {
        slug: teamSlug,
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
        include: {
          deploymentToken: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ])

    const identities = await this.kratos.getIdentitiesByIds(new Set(auditLog.map(it => it.userId)))

    return {
      items: auditLog.map(it => this.mapper.toDetailsDto(it, identities)),
      total,
    }
  }

  private async stringFilter(query: AuditLogQueryDto): Promise<Prisma.AuditLogWhereInput> {
    const { filter } = query

    if (!filter) {
      return {}
    }

    const user = await this.kratos.getIdentityByEmail(filter)

    return {
      OR: [
        {
          userId: user.id,
        },
        {
          event: {
            contains: `%${filter}%`,
            mode: 'insensitive',
          },
        },
      ],
    }
  }
}
