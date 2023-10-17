import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { Prisma } from '@prisma/client'
import { IdentityTraits, nameOfIdentity } from 'src/domain/identity'
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
    const { skip, take, from, to, filter: queryFilter } = query

    let where: Prisma.AuditLogWhereInput = {
      team: {
        slug: teamSlug,
      },
      createdAt: {
        gte: from,
        lte: to,
      },
    }

    let identities: Map<string, Identity> = null

    if (queryFilter) {
      const filter = queryFilter.toLowerCase()

      const users = await this.prisma.auditLog.findMany({
        where,
        select: {
          userId: true,
        },
        distinct: ['userId'],
      })

      identities = await this.kratos.getIdentitiesByIds(new Set(users.map(it => it.userId)))

      const filteredIdentities = Array.from(identities.values())
        .filter(it => {
          const traits = it.traits as IdentityTraits
          if (traits.email.toLocaleLowerCase().includes(filter)) {
            return true
          }

          const name = nameOfIdentity(it)
          return name.toLowerCase().includes(filter)
        })
        .map(it => it.id)

      where = {
        ...where,
        OR: [
          {
            userId: {
              in: filteredIdentities,
            },
          },
          {
            event: {
              contains: filter,
              mode: 'insensitive',
            },
          },
        ],
      }
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

    if (!queryFilter) {
      identities = await this.kratos.getIdentitiesByIds(new Set(auditLog.map(it => it.userId)))
    }

    return {
      items: auditLog.map(it => this.mapper.toDetailsDto(it, identities)),
      total,
    }
  }
}
