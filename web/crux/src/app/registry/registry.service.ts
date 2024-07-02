import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { JwtService } from '@nestjs/jwt'
import { Identity } from '@ory/kratos-client'
import {
  REGISTRY_EVENT_UPDATE,
  RegistryConnectionInfo,
  RegistryUpdatedEvent,
  RegistryV2Event,
} from 'src/domain/registry'
import { RegistryTokenPayload, RegistryTokenScriptGenerator } from 'src/domain/registry-token'
import EncryptionService from 'src/services/encryption.service'
import PrismaService from 'src/services/prisma.service'
import { USER_AGENT_CRUX } from 'src/shared/const'
import RegistryMetrics from 'src/shared/metrics/registry.metrics'
import { v4 as uuid } from 'uuid'
import TeamRepository from '../team/team.repository'
import RegistryClientProvider from './registry-client.provider'
import {
  CreateRegistryDto,
  CreateRegistryTokenDto,
  RegistryDetailsDto,
  RegistryDto,
  RegistryTokenCreatedDto,
  RegistryV2HookEnvelopeDto,
  UpdateRegistryDto,
} from './registry.dto'
import RegistryMapper from './registry.mapper'

@Injectable()
export default class RegistryService {
  private readonly logger = new Logger(RegistryService.name)

  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly encryptionService: EncryptionService,
    private readonly prisma: PrismaService,
    private readonly mapper: RegistryMapper,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => RegistryClientProvider))
    private readonly clientProvider: RegistryClientProvider,
    private readonly events: EventEmitter2,
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
        registryToken: true,
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
      include: {
        registryToken: true,
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
      include: {
        registryToken: true,
      },
    })

    this.events.emit(REGISTRY_EVENT_UPDATE, {
      id: registry.id,
    } as RegistryUpdatedEvent)

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

    this.events.emit(REGISTRY_EVENT_UPDATE, {
      id,
    } as RegistryUpdatedEvent)

    RegistryMetrics.count(deleted.type).dec()
  }

  async createRegistryToken(
    teamSlug: string,
    registryId: string,
    req: CreateRegistryTokenDto,
    identity: Identity,
  ): Promise<RegistryTokenCreatedDto> {
    const nonce = uuid()

    let expiresAt: Date | null = null

    if (req.expirationInDays) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + req.expirationInDays)
    }

    this.logger.verbose(`DeploymentToken expires at ${expiresAt?.toISOString()}`)

    const payload: RegistryTokenPayload = {
      sub: identity.id,
      registryId,
      nonce,
    }

    const tokenProperties: Record<string, any> = {
      data: payload,
    }

    if (expiresAt) {
      tokenProperties.exp = expiresAt.getTime() / 1000
    }

    const jwt = this.jwtService.sign(tokenProperties)

    const tokenGenerator = new RegistryTokenScriptGenerator(this.configService)

    const config = tokenGenerator
      .getV2ConfigYaml({
        registryId,
        teamSlug,
        token: jwt,
      })
      .trim()

    const token = await this.prisma.registryToken.create({
      data: {
        registryId,
        createdBy: identity.id,
        expiresAt,
        nonce,
      },
    })

    return {
      id: token.id,
      createdAt: token.createdAt,
      expiresAt,
      token: jwt,
      config,
    }
  }

  async deleteRegistryToken(registryId: string): Promise<void> {
    await this.prisma.registryToken.delete({
      where: {
        registryId,
      },
    })
  }

  async registryV2Event(id: string, req: RegistryV2HookEnvelopeDto): Promise<void> {
    req.events = req.events.filter(it => it.request.useragent !== USER_AGENT_CRUX)

    const registry = await this.prisma.registry.findUniqueOrThrow({
      where: {
        id,
      },
    })

    const { client } = await this.clientProvider.getByRegistryId(registry.teamId, registry.id)

    await Promise.all(
      req.events.map(async ev => {
        const { target } = ev
        const imageName = target.repository
        const imageTag = target.tag

        const labels = await client.labels(imageName, imageTag)

        const event: RegistryV2Event = {
          registry,
          imageName,
          imageTag: target.tag,
          labels,
        }

        await this.events.emitAsync(this.mapper.v2HookActionTypeToEvent(ev.action), event)
      }),
    )
  }

  async getRegistryConnectionInfoById(id: string): Promise<RegistryConnectionInfo> {
    const registry = await this.prisma.registry.findUniqueOrThrow({
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
