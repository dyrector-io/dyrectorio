import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { Observable, Subject } from 'rxjs'
import { RegistryConnectionInfo } from 'src/domain/registry'
import EncryptionService from 'src/services/encryption.service'
import PrismaService from 'src/services/prisma.service'
import RegistryMetrics from 'src/shared/metrics/registry.metrics'
import TeamRepository from '../team/team.repository'
import { CreateRegistryDto, RegistryDetailsDto, RegistryDto, UpdateRegistryDto } from './registry.dto'
import RegistryMapper from './registry.mapper'

@Injectable()
export default class RegistryService {
  private readonly registryChangedEvent = new Subject<string>()

  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly encryptionService: EncryptionService,
    private readonly prisma: PrismaService,
    private readonly mapper: RegistryMapper,
  ) {}

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

  async getRegistries(teamSlug: string): Promise<RegistryDto[]> {
    const registries = await this.prisma.registry.findMany({
      where: {
        team: {
          slug: teamSlug,
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

  async createRegistry(teamSlug: string, req: CreateRegistryDto, identity: Identity): Promise<RegistryDetailsDto> {
    const teamId = await this.teamRepository.getTeamIdBySlug(teamSlug)

    const registry = await this.prisma.registry.create({
      data: {
        name: req.name,
        description: req.description,
        icon: req.icon ?? null,
        teamId,
        createdBy: identity.id,
        ...this.mapper.detailsToDb(req),
      },
    })

    RegistryMetrics.count(registry.type).inc()

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
    const deleted = await this.prisma.registry.delete({
      where: {
        id,
      },
      select: {
        type: true,
      },
    })

    this.registryChangedEvent.next(id)

    RegistryMetrics.count(deleted.type).dec()
  }

  watchRegistryEvents(): Observable<string> {
    return this.registryChangedEvent.asObservable()
  }

  async getRegistryConnectionInfoById(id: string): Promise<RegistryConnectionInfo> {
    const registry = await this.prisma.registry.findUnique({
      where: {
        id,
      },
    })

    // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
    const _public = !registry.user

    return {
      ...registry,
      public: _public,
      token: _public ? null : this.encryptionService.decrypt(registry.token),
    }
  }
}
