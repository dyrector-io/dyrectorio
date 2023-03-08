import { Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import KratosService from 'src/services/kratos.service'
import { Prisma } from '@prisma/client'
import { Identity } from '@ory/kratos-client'
import { AuditLogListCountResponseDto, AuditLogListResponseDto, AuditLogListRequestDto } from './audit.dto'

@Injectable()
export default class AuditService {
  constructor(private readonly prisma: PrismaService, private readonly kratos: KratosService) {}

  async getAuditLog(request: AuditLogListRequestDto, identity: Identity): Promise<AuditLogListResponseDto> {
    const conditions = await this.getConditions(request, identity)

    const auditLog = await this.prisma.auditLog.findMany({
      ...conditions,
      skip: (request.pageNumber ?? 0) * request.pageSize,
      take: request.pageSize,
      select: {
        createdAt: true,
        userId: true,
        serviceCall: true,
        data: true,
      },
    })

    const auditLogReponseResult = await Promise.all(
      auditLog.map(async it => {
        const kratosIdentity = await this.kratos.getIdentityById(it.userId)
        return {
          ...it,
          data: JSON.stringify(it.data),
          identityEmail: kratosIdentity.traits.email,
        }
      }),
    )

    return {
      data: auditLogReponseResult,
    }
  }

  async getAuditLogListCount(
    request: AuditLogListRequestDto,
    identity: Identity,
  ): Promise<AuditLogListCountResponseDto> {
    const conditions = await this.getConditions(request, identity)

    const count = await this.prisma.auditLog.count(conditions as Prisma.AuditLogCountArgs)

    return {
      count,
    }
  }

  private async getConditions(
    request: AuditLogListRequestDto,
    identity: Identity,
  ): Promise<Prisma.AuditLogFindManyArgs> {
    const { keyword, createdFrom, createdTo } = request
    const keywordFilter = keyword ? await this.getKeywordFilter(keyword) : null

    return {
      where: {
        team: {
          users: {
            some: {
              userId: identity.id,
              active: true,
            },
          },
        },
        createdAt: {
          gte: createdFrom ?? createdFrom,
          lte: createdTo,
        },
        ...keywordFilter,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }
  }

  private async getKeywordFilter(keyword: string): Promise<Prisma.AuditLogWhereInput> {
    const userIds = await this.kratos.getIdentityIdsByEmail(keyword)

    return {
      OR: [
        {
          userId: {
            in: userIds,
          },
        },
        {
          serviceCall: {
            contains: `%${keyword}%`,
            mode: 'insensitive',
          },
        },
      ],
    }
  }
}
