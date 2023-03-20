import { Injectable, Logger } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { Identity } from '@ory/kratos-client'
import TeamRepository from '../team/team.repository'
import RegistryMapper from './registry.mapper'
import { CreateRegistry, RegistryDetails, RegistryList, UpdateRegistry } from './registry.dto'

@Injectable()
export default class RegistryService {
  constructor(private teamRepository: TeamRepository, private prisma: PrismaService, private mapper: RegistryMapper) {}

  private readonly logger = new Logger(RegistryService.name)

  async getRegistries(identity: Identity): Promise<RegistryList> {
    const registries = await this.prisma.registry.findMany({
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
      data: registries.map(it => this.mapper.listItemToDto(it)),
    }
  }

  async getRegistryDetails(id: string): Promise<RegistryDetails> {
    const registry = await this.prisma.registry.findUniqueOrThrow({
      include: {
        _count: {
          select: {
            images: true,
          },
        },
      },
      where: {
        id,
      },
    })

    return this.mapper.detailsToDto(registry)
  }

  async createRegistry(req: CreateRegistry, identity: Identity): Promise<RegistryDetails> {
    const team = await this.teamRepository.getActiveTeamByUserId(identity.id)

    const registry = await this.prisma.registry.create({
      data: {
        name: req.name,
        description: req.description,
        icon: req.icon ?? null,
        teamId: team.teamId,
        createdBy: identity.id,
        ...this.mapper.detailsToDb(req),
      },
    })

    return this.mapper.detailsToDto(registry)
  }

  async updateRegistry(id: string, req: UpdateRegistry, identity: Identity): Promise<RegistryDetails> {
    const registry = await this.prisma.registry.update({
      where: {
        id,
      },
      data: {
        name: req.name,
        description: req.description,
        icon: req.icon ?? null,
        updatedBy: identity.id,
        ...this.mapper.detailsToDb(req),
      },
    })

    return this.mapper.detailsToDto(registry)
  }

  async deleteRegistry(id: string): Promise<void> {
    await this.prisma.registry.delete({
      where: {
        id,
      },
    })
  }
}
