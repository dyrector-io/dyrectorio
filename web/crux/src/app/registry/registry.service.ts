import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { Observable, Subject } from 'rxjs'
import PrismaService from 'src/services/prisma.service'
import TeamRepository from '../team/team.repository'
import { CreateRegistryDto, RegistryDetailsDto, RegistryDto, UpdateRegistryDto } from './registry.dto'
import RegistryMapper from './registry.mapper'

@Injectable()
export default class RegistryService {
  private readonly registryChangedEvent = new Subject<string>()

  constructor(private teamRepository: TeamRepository, private prisma: PrismaService, private mapper: RegistryMapper) {}

  async checkRegistryIsInTeam(teamId: string, registryId: string): Promise<boolean> {
    const registries = await this.prisma.registry.count({
      where: {
        id: registryId,
        team: {
          id: teamId,
        },
      },
    })

    return registries > 0
  }

  async getRegistries(identity: Identity): Promise<RegistryDto[]> {
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

    return registries.map(it => this.mapper.toDto(it))
  }

  async getRegistryDetails(id: string): Promise<RegistryDetailsDto> {
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

  async createRegistry(req: CreateRegistryDto, identity: Identity): Promise<RegistryDetailsDto> {
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

  async updateRegistry(id: string, req: UpdateRegistryDto, identity: Identity): Promise<RegistryDetailsDto> {
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

    this.registryChangedEvent.next(registry.id)

    return this.mapper.detailsToDto(registry)
  }

  async deleteRegistry(id: string): Promise<void> {
    await this.prisma.registry.delete({
      where: {
        id,
      },
    })

    this.registryChangedEvent.next(id)
  }

  watchRegistryEvents(): Observable<string> {
    return this.registryChangedEvent.asObservable()
  }
}
