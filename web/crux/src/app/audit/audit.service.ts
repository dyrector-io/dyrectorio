import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { Prisma } from '@prisma/client'
import { IdentityTraits, nameOfIdentity } from 'src/domain/identity'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import { AuditLogListDto, AuditLogQueryDto } from './audit.dto'
import AuditMapper, { AuditLogWithDeploymentToken } from './audit.mapper'

@Injectable()
export default class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: AuditMapper,
    private readonly kratos: KratosService,
  ) {}

  async getAuditLog(teamSlug: string, query: AuditLogQueryDto): Promise<AuditLogListDto> {
    const { skip, take, from, to, filter } = query

    const where: Prisma.AuditLogWhereInput = {
      team: {
        slug: teamSlug,
      },
      createdAt: {
        gte: from,
        lte: to,
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

    if (filter) {
      const filtered = this.filterAuditLog(auditLog, filter, identities)
      return {
        items: filtered.map(it => this.mapper.toDetailsDto(it, identities)),
        total: filtered.length,
      }
    }

    return {
      items: auditLog.map(it => this.mapper.toDetailsDto(it, identities)),
      total,
    }
  }

  private filterAuditLog(
    items: AuditLogWithDeploymentToken[],
    filter: string,
    identities: Map<string, Identity>,
  ): AuditLogWithDeploymentToken[] {
    const filterLowercase = filter.toLowerCase()
    return items.filter(it => {
      if (it.event.toLowerCase().includes(filterLowercase)) {
        return true
      }

      const identity = identities.get(it.userId)
      if (identity) {
        const name = nameOfIdentity(identity).toLowerCase()
        const traits = identity.traits as IdentityTraits

        return name.includes(filterLowercase) || traits.email.toLowerCase().includes(filterLowercase)
      }

      return false
    })
  }
}
