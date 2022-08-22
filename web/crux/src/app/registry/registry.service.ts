import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/services/prisma.service'
import {
  AccessRequest,
  CreateEntityResponse,
  CreateRegistryRequest,
  IdRequest,
  RegistryDetailsResponse,
  RegistryListResponse,
  UpdateEntityResponse,
  UpdateRegistryRequest,
} from 'src/grpc/protobuf/proto/crux'
import { TeamRepository } from '../team/team.repository'
import { RegistryMapper } from './registry.mapper'

@Injectable()
export class RegistryService {
  constructor(private teamRepository: TeamRepository, private prisma: PrismaService, private mapper: RegistryMapper) {}

  private readonly logger = new Logger(RegistryService.name)

  async getRegistries(request: AccessRequest): Promise<RegistryListResponse> {
    const registries = await this.prisma.registry.findMany({
      where: {
        team: {
          users: {
            some: {
              userId: request.accessedBy,
              active: true,
            },
          },
        },
      },
    })

    return {
      data: registries.map(it => this.mapper.toGrpc(it)),
    }
  }

  async createRegistry(req: CreateRegistryRequest): Promise<CreateEntityResponse> {
    const team = await this.teamRepository.getActiveTeamByUserId(req.accessedBy)

    const registry = await this.prisma.registry.create({
      data: {
        name: req.name,
        description: req.description,
        icon: req.icon ?? null,
        teamId: team.teamId,
        createdBy: req.accessedBy,
        ...this.mapper.detailsToDb(req),
      },
    })

    return CreateEntityResponse.fromJSON(registry)
  }

  async updateRegistry(req: UpdateRegistryRequest): Promise<UpdateEntityResponse> {
    const registry = await this.prisma.registry.update({
      where: {
        id: req.id,
      },
      data: {
        name: req.name,
        description: req.description,
        icon: req.icon ?? null,
        updatedBy: req.accessedBy,
        updatedAt: new Date(),
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
      where: {
        id: req.id,
      },
    })

    return this.mapper.detailsToGrpc(registry)
  }
}
