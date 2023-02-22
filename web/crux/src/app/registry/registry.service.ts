import { Injectable, Logger } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import {
  CreateEntityResponse,
  CreateRegistryRequest,
  IdRequest,
  RegistryDetailsResponse,
  RegistryListResponse,
  UpdateEntityResponse,
  UpdateRegistryRequest,
} from 'src/grpc/protobuf/proto/crux'
import TeamRepository from '../team/team.repository'
import RegistryMapper from './registry.mapper'

@Injectable()
export default class RegistryService {
  constructor(private teamRepository: TeamRepository, private prisma: PrismaService, private mapper: RegistryMapper) {}

  private readonly logger = new Logger(RegistryService.name)

  async getRegistries(accessedBy: string): Promise<RegistryListResponse> {
    const registries = await this.prisma.registry.findMany({
      where: {
        team: {
          users: {
            some: {
              userId: accessedBy,
              active: true,
            },
          },
        },
      },
    })

    return {
      data: registries.map(it => this.mapper.listItemToProto(it)),
    }
  }

  async createRegistry(req: CreateRegistryRequest, accessedBy: string): Promise<CreateEntityResponse> {
    const team = await this.teamRepository.getActiveTeamByUserId(accessedBy)

    const registry = await this.prisma.registry.create({
      data: {
        name: req.name,
        description: req.description,
        icon: req.icon ?? null,
        teamId: team.teamId,
        createdBy: accessedBy,
        ...this.mapper.detailsToDb(req),
      },
    })

    return CreateEntityResponse.fromJSON(registry)
  }

  async updateRegistry(req: UpdateRegistryRequest, accessedBy: string): Promise<UpdateEntityResponse> {
    const registry = await this.prisma.registry.update({
      where: {
        id: req.id,
      },
      data: {
        name: req.name,
        description: req.description,
        icon: req.icon ?? null,
        updatedBy: accessedBy,
        ...this.mapper.detailsToDb(req),
      },
    })

    return UpdateEntityResponse.fromJSON(registry)
  }

  async deleteRegistry(req: IdRequest): Promise<void> {
    await this.prisma.registry.delete({
      where: {
        id: req.id,
      },
    })
  }

  async getRegistryDetails(req: IdRequest): Promise<RegistryDetailsResponse> {
    const registry = await this.prisma.registry.findUniqueOrThrow({
      include: {
        _count: {
          select: {
            images: true,
          },
        },
      },
      where: {
        id: req.id,
      },
    })

    return this.mapper.detailsToProto(registry)
  }
}
