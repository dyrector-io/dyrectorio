import { Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { AuditLogListCountResponse, AuditLogListRequest, AuditLogListResponse } from 'src/grpc/protobuf/proto/crux'
import KratosService from 'src/services/kratos.service'
import { Timestamp } from 'src/grpc/google/protobuf/timestamp'
import { Prisma } from '@prisma/client'
import AuditMapper from './audit.mapper'

@Injectable()
export default class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: AuditMapper,
    private readonly kratos: KratosService,
  ) {}

  async getAuditLog(request: AuditLogListRequest): Promise<AuditLogListResponse> {
    const conditions = await this.getConditions(request)

    const auditLog = await this.prisma.auditLog.findMany({
      ...conditions,
      skip: (request.pageNumber ?? 0) * request.pageSize,
      take: request.pageSize,
    })

    const identites = await this.kratos.getIdentitiesByIds(auditLog.map(it => it.userId))

    return {
      data: auditLog.map(it => this.mapper.toProto(it, identites)),
    }
  }

  async getAuditLogListCount(request: AuditLogListRequest): Promise<AuditLogListCountResponse> {
    const conditions = await this.getConditions(request)

    const count = await this.prisma.auditLog.count(conditions as Prisma.AuditLogCountArgs)

    return {
      count,
    }
  }

  private async getConditions(request: AuditLogListRequest): Promise<Prisma.AuditLogFindManyArgs> {
    const { keyword, accessedBy, createdFrom, createdTo } = request

    const dateFilter = this.getDateFilter(createdTo, createdFrom)

    const keywordFilter = keyword ? await this.getKeywordFilter(keyword) : null

    return {
      where: {
        team: {
          users: {
            some: {
              userId: accessedBy,
              active: true,
            },
          },
        },
        ...dateFilter,
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

  private getDateFilter(createdTo: Timestamp, createdFrom?: Timestamp): Prisma.AuditLogWhereInput {
    if (!createdFrom) {
      return {
        createdAt: {
          lte: new Date(createdTo.seconds * 1000),
        },
      }
    }

    return {
      createdAt: {
        gte: new Date(createdFrom.seconds * 1000),
        lte: new Date(createdTo.seconds * 1000),
      },
    }
  }
}
