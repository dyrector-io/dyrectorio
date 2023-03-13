import { Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import {
  CreateEntityResponse,
  CreateStorageRequest,
  IdRequest,
  StorageDetailsResponse,
  StorageListResponse,
  StorageOptionListResponse,
  UpdateEntityResponse,
  UpdateStorageRequest,
} from 'src/grpc/protobuf/proto/crux'
import { Identity } from '@ory/kratos-client'
import TeamRepository from '../team/team.repository'
import StorageMapper from './storage.mapper'

@Injectable()
export default class StorageService {
  constructor(private teamRepository: TeamRepository, private prisma: PrismaService, private mapper: StorageMapper) {}

  async getStorages(identity: Identity): Promise<StorageListResponse> {
    const storages = await this.prisma.storage.findMany({
      where: {
        team: {
          users: {
            some: {
              userId: identity.id,
              active: true,
            },
          },
        },
      },
    })

    return {
      data: storages.map(it => this.mapper.listItemToProto(it)),
    }
  }

  async createStorage(req: CreateStorageRequest, identity: Identity): Promise<CreateEntityResponse> {
    const team = await this.teamRepository.getActiveTeamByUserId(identity.id)

    const storage = await this.prisma.storage.create({
      data: {
        name: req.name,
        description: req.description,
        icon: req.icon ?? null,
        url: req.url,
        accessKey: req.accessKey,
        secretKey: req.secretKey,
        teamId: team.teamId,
        createdBy: identity.id,
      },
    })

    return CreateEntityResponse.fromJSON(storage)
  }

  async updateStorage(req: UpdateStorageRequest, identity: Identity): Promise<UpdateEntityResponse> {
    const storage = await this.prisma.storage.update({
      where: {
        id: req.id,
      },
      data: {
        name: req.name,
        description: req.description,
        icon: req.icon ?? null,
        url: req.url,
        accessKey: req.accessKey,
        secretKey: req.secretKey,
        updatedBy: identity.id,
      },
    })

    return UpdateEntityResponse.fromJSON(storage)
  }

  async deleteStorage(req: IdRequest): Promise<void> {
    await this.prisma.storage.delete({
      where: {
        id: req.id,
      },
    })
  }

  async getStorageDetails(req: IdRequest): Promise<StorageDetailsResponse> {
    const storage = await this.prisma.storage.findUniqueOrThrow({
      include: {
        _count: {
          select: {
            containerConfigs: true,
            instanceConfigs: true,
          },
        },
      },
      where: {
        id: req.id,
      },
    })

    return this.mapper.detailsToProto(storage)
  }

  async getStorageOptions(identity: Identity): Promise<StorageOptionListResponse> {
    const storages = await this.prisma.storage.findMany({
      where: {
        team: {
          users: {
            some: {
              userId: identity.id,
              active: true,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    })

    return {
      data: storages,
    }
  }
}
