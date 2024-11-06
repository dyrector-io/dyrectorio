import { Injectable, Logger } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Identity } from '@ory/kratos-client'
import { Prisma } from '@prisma/client'
import { Observable, filter, map } from 'rxjs'
import { ContainerConfigData } from 'src/domain/container'
import { checkDeploymentMutability } from 'src/domain/deployment'
import { CONTAINER_CONFIG_EVENT_UPDATE, ContainerConfigUpdatedEvent } from 'src/domain/domain-events'
import { checkVersionMutability } from 'src/domain/version'
import { CruxBadRequestException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'
import { DomainEvent } from 'src/shared/domain-event'
import { WsMessage } from 'src/websockets/common'
import { EditorLeftMessage, EditorMessage } from '../editor/editor.message'
import EditorServiceProvider from '../editor/editor.service.provider'
import ContainerConfigDomainEventListener from './container-config.domain-event.listener'
import { ConfigUpdatedMessage, PatchConfigMessage, WS_TYPE_CONFIG_UPDATED } from './container-config.message'
import ContainerMapper from './container.mapper'

@Injectable()
export default class ContainerConfigService {
  private readonly logger = new Logger(ContainerConfigService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: ContainerMapper,
    private readonly editorServices: EditorServiceProvider,
    private readonly domainEventListener: ContainerConfigDomainEventListener,
    private readonly events: EventEmitter2,
  ) {}

  async checkConfigIsInTeam(teamSlug: string, configId: string, identity: Identity): Promise<boolean> {
    const teamWhere: Prisma.TeamWhereInput = {
      slug: teamSlug,
      users: {
        some: {
          userId: identity.id,
        },
      },
    }

    const versionWhere: Prisma.VersionWhereInput = {
      project: {
        team: teamWhere,
      },
    }

    const deploymentWhere: Prisma.DeploymentWhereInput = {
      version: versionWhere,
    }

    const configs = await this.prisma.containerConfig.count({
      where: {
        id: configId,
        OR: [
          {
            image: {
              version: versionWhere,
            },
          },
          {
            instance: {
              deployment: deploymentWhere,
            },
          },
          {
            deployment: deploymentWhere,
          },
          {
            configBundle: {
              team: teamWhere,
            },
          },
        ],
      },
    })

    return configs > 0
  }

  subscribeToDomainEvents(configId: string): Observable<WsMessage> {
    return this.domainEventListener.watchEvents(configId).pipe(
      map(it => this.transformDomainEventToWsMessage(it)),
      filter(it => !!it),
    )
  }

  async patchConfig(configId: string, message: PatchConfigMessage, identity: Identity): Promise<ConfigUpdatedMessage> {
    const mutable = await this.checkMutability(configId)
    if (!mutable) {
      throw new CruxBadRequestException({
        message: 'Container config is immutable',
        property: 'configId',
        value: configId,
      })
    }

    const data: ContainerConfigData = message.config ?? {}
    if (message.resetSection) {
      data[message.resetSection] = null
    }

    await this.prisma.containerConfig.update({
      where: {
        id: configId,
      },
      data: {
        ...this.mapper.configDataToDbPatch(data),
        updatedAt: new Date(),
        updatedBy: identity.id,
      },
    })

    await this.events.emitAsync(CONTAINER_CONFIG_EVENT_UPDATE, {
      id: configId,
      patch: data,
    } as ContainerConfigUpdatedEvent)

    return {
      id: configId,
      ...data,
    }
  }

  async onEditorJoined(
    configId: string,
    clientToken: string,
    identity: Identity,
  ): Promise<[EditorMessage, EditorMessage[]]> {
    const editors = await this.editorServices.getOrCreateService(configId)

    const me = editors.onClientJoin(clientToken, identity)

    return [me, editors.getEditors()]
  }

  async onEditorLeft(configId: string, clientToken: string): Promise<EditorLeftMessage> {
    const editors = await this.editorServices.getOrCreateService(configId)
    const message = editors.onClientLeft(clientToken)

    if (editors.editorCount < 1) {
      this.logger.verbose(`All editors left removing ${configId}`)
      this.editorServices.free(configId)
    }

    return message
  }

  private async checkMutability(configId: string): Promise<boolean> {
    const deploymentSelect: Prisma.DeploymentSelect = {
      status: true,
      version: {
        select: {
          type: true,
        },
      },
    }

    const config = await this.prisma.containerConfig.findUnique({
      where: {
        id: configId,
      },
      select: {
        type: true,
        image: {
          select: {
            version: {
              select: {
                id: true,
                type: true,
                children: {
                  select: {
                    versionId: true,
                  },
                },
                deployments: {
                  select: {
                    status: true,
                  },
                },
              },
            },
          },
        },
        instance: { select: { deployment: { select: deploymentSelect } } },
        deployment: { select: deploymentSelect },
        configBundle: {},
      },
    })

    switch (config.type) {
      case 'image':
        return checkVersionMutability(config.image.version)
      case 'deployment':
        return checkDeploymentMutability(config.deployment.status, config.deployment.version.type)
      case 'instance':
        return checkDeploymentMutability(config.instance.deployment.status, config.instance.deployment.version.type)
      case 'configBundle':
        return true
      default:
        return false
    }
  }

  private transformDomainEventToWsMessage(ev: DomainEvent<object>): WsMessage {
    switch (ev.type) {
      case CONTAINER_CONFIG_EVENT_UPDATE:
        return {
          type: WS_TYPE_CONFIG_UPDATED,
          data: this.mapper.configUpdatedEventToMessage(ev.event as ContainerConfigUpdatedEvent),
        }
      default: {
        this.logger.error(`Unhandled domain event ${ev.type}`)
        return null
      }
    }
  }
}
