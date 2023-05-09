import { Injectable, Logger } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { DeploymentStatusEnum, Prisma } from '@prisma/client'
import { EMPTY, Observable, Subject, concatAll, concatMap, filter, from, lastValueFrom, map, of } from 'rxjs'
import {
  ContainerConfigData,
  InstanceContainerConfigData,
  MergedContainerConfigData,
  UniqueSecretKeyValue,
} from 'src/domain/container'
import Deployment from 'src/domain/deployment'
import { toPrismaJson } from 'src/domain/utils'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import { DeployRequest } from 'src/grpc/protobuf/proto/agent'
import PrismaService from 'src/services/prisma.service'
import AgentService from '../agent/agent.service'
import ContainerMapper from '../container/container.mapper'
import { EditorLeftMessage, EditorMessage } from '../editor/editor.message'
import EditorServiceProvider from '../editor/editor.service.provider'
import { ImageEvent } from '../image/image.event'
import ImageEventService from '../image/image.event.service'
import {
  CreateDeploymentDto,
  DeploymentDetailsDto,
  DeploymentDto,
  DeploymentEventDto,
  DeploymentImageEvent,
  DeploymentLogListDto,
  DeploymentLogPaginationQuery,
  InstanceDto,
  InstanceSecretsDto,
  PatchDeploymentDto,
  PatchInstanceDto,
} from './deploy.dto'
import DeployMapper from './deploy.mapper'
import { DeploymentEventListMessage } from './deploy.message'

@Injectable()
export default class DeployService {
  private readonly logger = new Logger(DeployService.name)

  private deploymentImageEvents = new Subject<DeploymentImageEvent>()

  constructor(
    private prisma: PrismaService,
    private agentService: AgentService,
    imageEventService: ImageEventService,
    private mapper: DeployMapper,
    private containerMapper: ContainerMapper,
    private readonly editorServices: EditorServiceProvider,
  ) {
    imageEventService
      .watchEvents()
      .pipe(
        concatMap(async it => {
          const event = await this.transformImageEvent(it)
          if (event.type === 'create') {
            return from(this.onImageAddedToVersion(event))
          }
          return of(event)
        }),
        concatAll(),
      )
      .subscribe(it => this.deploymentImageEvents.next(it))
  }

  async checkDeploymentIsInTheActiveTeam(deploymentId: string, identity: Identity): Promise<boolean> {
    const deployments = await this.prisma.deployment.count({
      where: {
        id: deploymentId,
        version: {
          product: {
            team: {
              users: {
                some: {
                  userId: identity.id,
                  active: true,
                },
              },
            },
          },
        },
      },
    })

    return deployments > 0
  }

  async getDeploymentDetails(deploymentId: string): Promise<DeploymentDetailsDto> {
    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      where: {
        id: deploymentId,
      },
      include: {
        node: true,
        version: {
          include: {
            product: true,
          },
        },
        instances: {
          include: {
            image: {
              include: {
                config: true,
                registry: true,
              },
            },
            config: true,
          },
        },
      },
    })

    const publicKey = this.agentService.getById(deployment.nodeId)?.publicKey

    return this.mapper.toDetailsDto(deployment, publicKey)
  }

  async getDeploymentEvents(deploymentId: string): Promise<DeploymentEventDto[]> {
    const events = await this.prisma.deploymentEvent.findMany({
      where: {
        deploymentId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return events.map(it => this.mapper.eventToDto(it))
  }

  async getInstance(instanceId: string): Promise<InstanceDto> {
    const instance = await this.prisma.instance.findUniqueOrThrow({
      where: {
        id: instanceId,
      },
      include: {
        image: {
          include: {
            config: true,
            registry: true,
          },
        },
      },
    })

    return this.mapper.instanceToDto(instance)
  }

  async createDeployment(request: CreateDeploymentDto, identity: Identity): Promise<DeploymentDto> {
    const version = await this.prisma.version.findUniqueOrThrow({
      where: {
        id: request.versionId,
      },
      include: {
        product: true,
        parent: true,
        images: true,
      },
    })

    const deployment = await this.prisma.deployment.create({
      data: {
        versionId: request.versionId,
        nodeId: request.nodeId,
        status: DeploymentStatusEnum.preparing,
        note: request.note,
        createdBy: identity.id,
        prefix: request.prefix,
        instances: {
          createMany: {
            data: version.images.map(it => ({
              imageId: it.id,
              state: null,
            })),
          },
        },
      },
      include: {
        node: true,
        version: {
          include: {
            product: true,
          },
        },
      },
    })

    const instanceIds = await this.prisma.instance.findMany({
      where: {
        deploymentId: deployment.id,
      },
      select: {
        id: true,
        imageId: true,
        image: {
          select: {
            name: true,
          },
        },
      },
    })

    const previousInstances = await this.prisma.deployment.findFirst({
      where: {
        prefix: request.prefix,
        nodeId: request.nodeId,
        versionId: request.versionId,
        id: {
          not: deployment.id,
        },
      },
      include: {
        instances: {
          select: {
            imageId: true,
            config: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (previousInstances && previousInstances.instances) {
      instanceIds.forEach(async it => {
        await this.prisma.instance.update({
          where: {
            id: it.id,
          },
          data: {
            config: {
              create: {
                secrets:
                  previousInstances.instances.find(instance => instance.imageId === it.imageId).config?.secrets ??
                  Prisma.JsonNull,
              },
            },
          },
        })
      })
    }

    return this.mapper.toDto(deployment)
  }

  async patchDeployment(deploymentId: string, req: PatchDeploymentDto, identity: Identity): Promise<void> {
    await this.prisma.deployment.update({
      where: {
        id: deploymentId,
      },
      data: {
        note: req.note ?? undefined,
        prefix: req.prefix ?? undefined,
        environment: req.environment
          ? req.environment.map(it => this.containerMapper.uniqueKeyValueDtoToDb(it))
          : undefined,
        updatedBy: identity.id,
      },
    })
  }

  async patchInstance(
    deploymentId: string,
    instanceId: string,
    req: PatchInstanceDto,
    identity: Identity,
  ): Promise<void> {
    const instance = await this.prisma.instance.findUnique({
      where: {
        id: instanceId,
      },
      select: {
        config: true,
        image: {
          select: {
            config: true,
          },
        },
      },
    })

    const configData = this.mapper.instanceConfigDtoToInstanceContainerConfigData(
      instance.image.config as any as ContainerConfigData,
      (instance.config ?? {}) as any as InstanceContainerConfigData,
      req.config,
    )

    const config = this.containerMapper.configDataToDb(configData)

    await this.prisma.deployment.update({
      where: {
        id: deploymentId,
      },
      data: {
        updatedBy: identity.id,
        instances: {
          update: {
            where: {
              id: instanceId,
            },
            data: {
              config: {
                upsert: {
                  update: config,
                  create: config,
                },
              },
            },
          },
        },
      },
    })
  }

  async deleteDeployment(deploymentId: string): Promise<void> {
    const deployment = await this.prisma.deployment.delete({
      where: {
        id: deploymentId,
      },
      select: {
        prefix: true,
        nodeId: true,
      },
    })

    const agent = this.agentService.getById(deployment.nodeId)
    if (agent) {
      agent.deleteContainers({
        prefix: deployment.prefix,
        container: null,
      })
    }
  }

  async startDeployment(deploymentId: string, identity: Identity): Promise<void> {
    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      where: {
        id: deploymentId,
      },
      include: {
        version: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        instances: {
          include: {
            image: {
              include: {
                config: true,
                registry: true,
              },
            },
            config: true,
          },
        },
        node: {
          select: {
            name: true,
          },
        },
      },
    })

    const agent = this.agentService.getById(deployment.nodeId)
    const publicKey = agent?.publicKey

    if (!publicKey) {
      throw new CruxPreconditionFailedException({
        message: 'Agent has no public key',
        property: 'publicKey',
        value: deployment.nodeId,
      })
    }

    const invalidSecrets = deployment.instances
      .map(it => {
        if (!it.config) {
          return null
        }

        const secrets = it.config.secrets as UniqueSecretKeyValue[]

        if (!secrets || secrets.every(secret => secret.publicKey === publicKey)) {
          return null
        }

        return {
          instanceId: it.id,
          invalid: secrets.filter(secret => secret.publicKey !== publicKey).map(secret => secret.id),
          secrets: secrets.map(secret => {
            if (secret.publicKey === publicKey) {
              return secret
            }

            return {
              ...secret,
              value: '',
              encrypted: false,
              publicKey,
            }
          }),
        }
      })
      .filter(it => it !== null)

    const invalidSecretsUpdates = invalidSecrets
      .map(it =>
        this.prisma.instance.update({
          where: {
            id: it.instanceId,
          },
          data: {
            config: {
              update: {
                secrets: it.secrets,
              },
            },
          },
        }),
      )
      .filter(it => it !== null)

    if (invalidSecretsUpdates.length > 0) {
      await this.prisma.$transaction(invalidSecretsUpdates)

      throw new CruxPreconditionFailedException({
        message: 'Some secrets are invalid',
        property: 'secrets',
        value: invalidSecrets.map(it => ({ ...it, secrets: undefined })),
      })
    }

    const mergedConfigs: Map<string, MergedContainerConfigData> = new Map(
      deployment.instances.map(it => {
        /*
         * If a deployment succeeds the merged config is saved as the instance config,
         * so downgrading is possible even if the image config is modified.
         */

        if (
          deployment.version.type !== 'rolling' &&
          (deployment.status === 'successful' || deployment.status === 'obsolete')
        ) {
          return [
            it.id,
            this.containerMapper.mergeConfigs(
              {} as ContainerConfigData,
              (it.config ?? {}) as InstanceContainerConfigData,
            ),
          ]
        }

        return [
          it.id,
          this.containerMapper.mergeConfigs(
            (it.image.config ?? {}) as ContainerConfigData,
            (it.config ?? {}) as InstanceContainerConfigData,
          ),
        ]
      }),
    )

    const tries = deployment.tries + 1
    await this.prisma.deployment.update({
      where: {
        id: deployment.id,
      },
      data: {
        tries,
      },
    })

    const deploy = new Deployment(
      {
        id: deployment.id,
        releaseNotes: deployment.version.changelog,
        versionName: deployment.version.name,
        requests: await Promise.all(
          deployment.instances.map(async it => {
            const { registry } = it.image
            const registryUrl =
              registry.type === 'google' || registry.type === 'github'
                ? `${registry.url}/${registry.imageNamePrefix}`
                : registry.type === 'v2' || registry.type === 'gitlab' || registry.type === 'unchecked'
                ? registry.url
                : registry.type === 'hub'
                ? registry.imageNamePrefix
                : ''

            const mergedConfig = mergedConfigs.get(it.id)
            const storage = mergedConfig.storageId
              ? await this.prisma.storage.findFirstOrThrow({
                  where: {
                    id: mergedConfig.storageId,
                  },
                })
              : undefined

            return {
              common: this.mapper.commonConfigToAgentProto(mergedConfig, storage),
              crane: this.mapper.craneConfigToAgentProto(mergedConfig),
              dagent: this.mapper.dagentConfigToAgentProto(mergedConfig),
              id: it.id,
              containerName: it.image.config.name,
              imageName: it.image.name,
              tag: it.image.tag,
              instanceConfig: this.mapper.deploymentToAgentInstanceConfig(deployment),
              registry: registryUrl,
              registryAuth: !registry.token
                ? undefined
                : {
                    name: registry.name,
                    url: registryUrl,
                    user: registry.user,
                    password: registry.token,
                  },
            } as DeployRequest
          }),
        ),
      },
      {
        accessedBy: identity.id,
        productName: deployment.version.product.name,
        versionName: deployment.version.name,
        nodeName: deployment.node.name,
      },
      mergedConfigs,
      tries,
    )

    this.logger.debug(`Starting deployment: ${deploy.id}`)

    agent.deploy(deploy)

    await this.prisma.deployment.update({
      where: {
        id: deployment.id,
      },
      data: {
        status: DeploymentStatusEnum.inProgress,
      },
    })
  }

  async subscribeToDeploymentEvents(id: string): Promise<Observable<DeploymentEventListMessage>> {
    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      where: {
        id,
      },
      select: {
        id: true,
        nodeId: true,
      },
    })

    const agent = this.agentService.getById(deployment.nodeId)
    if (!agent) {
      return EMPTY
    }

    const runningDeployment = agent.getDeployment(deployment.id)
    if (!runningDeployment) {
      return EMPTY
    }

    return runningDeployment.watchStatus().pipe(map(it => this.mapper.progressEventToEventDto(it)))
  }

  subscribeToDeploymentEditEvents(deploymentId: string): Observable<DeploymentImageEvent> {
    return this.deploymentImageEvents.pipe(filter(it => it.deploymentIds.includes(deploymentId)))
  }

  async getDeployments(identity: Identity): Promise<DeploymentDto[]> {
    const deployments = await this.prisma.deployment.findMany({
      where: {
        version: {
          product: {
            team: {
              users: {
                some: {
                  userId: identity.id,
                  active: true,
                },
              },
            },
          },
        },
      },
      include: {
        version: {
          select: {
            id: true,
            name: true,
            type: true,
            product: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
        node: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    })

    return deployments.map(it => this.mapper.toDto(it))
  }

  async getInstanceSecrets(instanceId: string): Promise<InstanceSecretsDto> {
    const instance = await this.prisma.instance.findUniqueOrThrow({
      where: {
        id: instanceId,
      },
      include: {
        image: {
          include: {
            config: true,
          },
        },
        deployment: true,
      },
    })

    const { deployment } = instance
    const containerName = instance.image.config.name

    const agent = this.agentService.getById(deployment.nodeId)
    if (!agent) {
      throw new CruxPreconditionFailedException({
        message: 'Node is unreachable',
        property: 'nodeId',
        value: deployment.nodeId,
      })
    }

    const watcher = agent.getContainerSecrets(deployment.prefix, containerName)

    const secrets = await lastValueFrom(watcher)

    return this.mapper.secretsResponseToInstanceSecretsDto(secrets)
  }

  async copyDeployment(deploymentId: string, identity: Identity): Promise<DeploymentDto> {
    const oldDeployment = await this.prisma.deployment.findFirstOrThrow({
      where: {
        id: deploymentId,
      },
      include: {
        instances: {
          include: {
            config: true,
          },
        },
      },
    })

    const preparingDeployment = await this.prisma.deployment.findFirst({
      where: {
        nodeId: oldDeployment.nodeId,
        versionId: oldDeployment.versionId,
        prefix: oldDeployment.prefix,
        status: 'preparing',
      },
      select: {
        id: true,
      },
    })

    const newDeployment = await this.prisma.deployment.create({
      data: {
        versionId: oldDeployment.versionId,
        nodeId: oldDeployment.nodeId,
        status: DeploymentStatusEnum.preparing,
        note: oldDeployment.note,
        createdBy: identity.id,
        prefix: oldDeployment.prefix,
      },
      include: {
        node: true,
        version: {
          include: {
            product: true,
          },
        },
      },
    })

    await this.prisma.$transaction(
      oldDeployment.instances.map(it =>
        this.prisma.instance.create({
          data: {
            deploymentId: newDeployment.id,
            imageId: it.imageId,
            state: null,
            config: it.config
              ? {
                  create: {
                    name: it.config.name,
                    expose: it.config.expose,
                    ingress: toPrismaJson(it.config.ingress),
                    configContainer: toPrismaJson(it.config.configContainer),
                    user: it.config.user,
                    tty: it.config.tty,
                    ports: toPrismaJson(it.config.ports),
                    portRanges: toPrismaJson(it.config.portRanges),
                    volumes: toPrismaJson(it.config.volumes),
                    commands: toPrismaJson(it.config.commands),
                    args: toPrismaJson(it.config.args),
                    environment: toPrismaJson(it.config.environment),
                    secrets: toPrismaJson(it.config.secrets),
                    initContainers: toPrismaJson(it.config.initContainers),
                    logConfig: toPrismaJson(it.config.logConfig),
                    restartPolicy: it.config.restartPolicy,
                    networkMode: it.config.networkMode,
                    networks: toPrismaJson(it.config.networks),
                    deploymentStrategy: it.config.deploymentStrategy,
                    healthCheckConfig: toPrismaJson(it.config.healthCheckConfig),
                    resourceConfig: toPrismaJson(it.config.resourceConfig),
                    proxyHeaders: it.config.proxyHeaders ?? false,
                    useLoadBalancer: it.config.useLoadBalancer ?? false,
                    customHeaders: toPrismaJson(it.config.customHeaders),
                    extraLBAnnotations: toPrismaJson(it.config.extraLBAnnotations),
                    capabilities: toPrismaJson(it.config.capabilities),
                    annotations: toPrismaJson(it.config.annotations),
                    labels: toPrismaJson(it.config.labels),
                    dockerLabels: toPrismaJson(it.config.dockerLabels),
                    storageId: it.config.storageId,
                    storageConfig: toPrismaJson(it.config.storageConfig),
                  },
                }
              : undefined,
          },
        }),
      ),
    )

    if (preparingDeployment) {
      await this.deleteDeployment(preparingDeployment.id)
    }

    return this.mapper.toDto(newDeployment)
  }

  async getDeploymentLog(deploymentId: string, query: DeploymentLogPaginationQuery): Promise<DeploymentLogListDto> {
    const { skip, take, try: tryCount } = query

    const where: Prisma.DeploymentEventWhereInput = {
      deploymentId,
      tryCount,
    }

    const [events, total] = await this.prisma.$transaction([
      this.prisma.deploymentEvent.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.deploymentEvent.count({ where }),
    ])

    return {
      items: events.reverse().map(it => this.mapper.eventToDto(it)),
      total,
    }
  }

  private async transformImageEvent(event: ImageEvent): Promise<DeploymentImageEvent> {
    const deployments = await this.prisma.deployment.findMany({
      select: {
        id: true,
      },
      where: {
        versionId: event.versionId,
      },
    })

    return {
      ...event,
      deploymentIds: deployments.map(it => it.id),
    }
  }

  private async onImageAddedToVersion(event: DeploymentImageEvent): Promise<DeploymentImageEvent> {
    const versionId = event.images?.length > 0 ? event.versionId : null
    const deployments = await this.prisma.deployment.findMany({
      select: {
        id: true,
      },
      where: {
        versionId,
      },
    })

    const instances = await Promise.all(
      deployments.flatMap(deployment =>
        event.images.map(it =>
          this.prisma.instance.create({
            include: {
              config: true,
              image: {
                include: {
                  config: true,
                  registry: true,
                },
              },
            },
            data: {
              deploymentId: deployment.id,
              imageId: it.id,
              state: null,
            },
          }),
        ),
      ),
    )

    return {
      ...event,
      instances,
    }
  }

  async onEditorJoined(
    deploymentId: string,
    clientToken: string,
    identity: Identity,
  ): Promise<[EditorMessage, EditorMessage[]]> {
    const editors = await this.editorServices.getOrCreateService(deploymentId)

    const me = editors.onClientJoin(clientToken, identity)

    return [me, editors.getEditors()]
  }

  async onEditorLeft(deploymentId: string, clientToken: string): Promise<EditorLeftMessage> {
    const editors = await this.editorServices.getOrCreateService(deploymentId)
    const message = editors.onClientLeft(clientToken)

    if (editors.editorCount < 1) {
      this.logger.verbose(`All editors left removing ${deploymentId}`)
      this.editorServices.free(deploymentId)
    }

    return message
  }
}
