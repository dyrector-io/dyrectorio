import { Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { Identity } from '@ory/kratos-client'
import TeamRepository from '../team/team.repository'
import StorageMapper from './storage.mapper'
import { CreateStorageDto, StorageDetailsDto, StorageDto, StorageOptionDto, UpdateStorageDto } from './storage.dto'

@Injectable()
export default class StorageService {
  constructor(private teamRepository: TeamRepository, private prisma: PrismaService, private mapper: StorageMapper) {}

  async getStorages(identity: Identity): Promise<StorageDto[]> {
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

    return storages.map(it => this.mapper.listItemToDto(it))
  }

  async getStorageDetails(id: string): Promise<StorageDetailsDto> {
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
        id,
      },
    })

    return this.mapper.detailsToDto(storage)
  }

  async createStorage(req: CreateStorageDto, identity: Identity): Promise<StorageDetailsDto> {
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

    return this.mapper.detailsToDto({
      ...storage,
      _count: {
        containerConfigs: 0,
        instanceConfigs: 0,
      },
    })
  }

  async updateStorage(id: string, req: UpdateStorageDto, identity: Identity): Promise<void> {
    await this.prisma.storage.update({
      where: {
        id,
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
  }

  async deleteStorage(id: string): Promise<void> {
    await this.prisma.storage.delete({
      where: {
        id,
      },
    })
  }

  async getStorageOptions(identity: Identity): Promise<StorageOptionDto[]> {
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

    return storages
  }
}
