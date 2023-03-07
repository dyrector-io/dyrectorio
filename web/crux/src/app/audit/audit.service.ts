import { Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import KratosService from 'src/services/kratos.service'
import { Prisma } from '@prisma/client'
import { Identity } from '@ory/kratos-client'
import AuditMapper from './audit.mapper'
import { AuditLogListCountResponseDto, AuditLogListResponseDto, AuditLogListRequestDto } from './audit.dto'
import {
  AuditLogListRequest,
  AuditLogListResponse,
  AuditLogListCountResponse,
  CruxAuditController,
  CruxAuditControllerMethods,
} from 'src/grpc/protobuf/proto/crux'

@Injectable()
export default class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: AuditMapper,
    private readonly kratos: KratosService,
  ) {}

  // Exclude keys from user
  private exclude<User, Key extends keyof User>(user: User, keys: Key[]): Omit<User, Key> {
    for (let key of keys) {
      delete user[key]
    }
    return user
  }

  async getAuditLog(
    request: AuditLogListRequestDto | AuditLogListRequest,
    identity: Identity,
  ): Promise<AuditLogListResponse | AuditLogListResponseDto> {
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
        const identity = await this.kratos.getIdentityById(it.userId)
        return {
          ...it,
          identityEmail: identity.traits.email,
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
  ): Promise<AuditLogListCountResponse | AuditLogListCountResponseDto> {
    const conditions = await this.getConditions(request, identity)

    const count = await this.prisma.auditLog.count(conditions as Prisma.AuditLogCountArgs)

    return {
      count,
    }
  }

  private async getConditions(
    request: AuditLogListRequestDto | AuditLogListRequest,
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
