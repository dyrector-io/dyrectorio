import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Identity } from '@ory/kratos-client'
import { ConfigBundle, DeploymentStatusEnum, Prisma } from '@prisma/client'
import { EMPTY, Observable, Subject, concatAll, concatMap, filter, from, map, of } from 'rxjs'
import {
  ContainerConfigData,
  InstanceContainerConfigData,
  MergedContainerConfigData,
  UniqueKeyValue,
  UniqueSecretKeyValue,
} from 'src/domain/container'
import Deployment from 'src/domain/deployment'
import { DeploymentTokenScriptGenerator } from 'src/domain/deployment-token'
import { DeploymentTokenPayload, tokenSignOptionsFor } from 'src/domain/token'
import { collectChildVersionIds, collectParentVersionIds, toPrismaJson } from 'src/domain/utils'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import { DeployRequest } from 'src/grpc/protobuf/proto/agent'
import EncryptionService from 'src/services/encryption.service'
import PrismaService from 'src/services/prisma.service'
import { v4 as uuid } from 'uuid'
import AgentService from '../agent/agent.service'
import ContainerMapper from '../container/container.mapper'
import { EditorLeftMessage, EditorMessage } from '../editor/editor.message'
import EditorServiceProvider from '../editor/editor.service.provider'
import { ImageEvent } from '../image/image.event'
import ImageEventService from '../image/image.event.service'
import RegistryMapper from '../registry/registry.mapper'
import {
  CopyDeploymentDto,
  CreateDeploymentDto,
  CreateDeploymentTokenDto,
  DeploymentDetailsDto,
  DeploymentDto,
  DeploymentEventDto,
  DeploymentImageEvent,
  DeploymentListDto,
  DeploymentLogListDto,
  DeploymentLogPaginationQuery,
  DeploymentQueryDto,
  DeploymentTokenCreatedDto,
  EnvironmentToConfigBundleNameMap,
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
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => AgentService)) private readonly agentService: AgentService,
    readonly imageEventService: ImageEventService,
    private readonly mapper: DeployMapper,
    private readonly registryMapper: RegistryMapper,
    private readonly containerMapper: ContainerMapper,
    private readonly editorServices: EditorServiceProvider,
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
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

  async checkDeploymentIsInTeam(teamSlug: string, deploymentId: string, identity: Identity): Promise<boolean> {
    const deployments = await this.prisma.deployment.count({
      where: {
        id: deploymentId,
        version: {
          project: {
            team: {
              slug: teamSlug,
              users: {
                some: {
                  userId: identity.id,
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
        configBundles: {
          include: {
            configBundle: true,
          },
        },
        version: {
          include: {
            project: true,
          },
        },
        tokens: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            expiresAt: true,
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
          orderBy: {
            image: {
              order: 'asc',
            },
          },
        },
      },
    })

    const publicKey = this.agentService.getById(deployment.nodeId)?.publicKey
    const configBundleEnvironment = this.getConfigBundleEnvironmentKeys(
      deployment.configBundles.map(it => it.configBundle),
    )

    return this.mapper.toDetailsDto(deployment, publicKey, configBundleEnvironment)
  }

  async getDeploymentEvents(deploymentId: string, tryCount?: number): Promise<DeploymentEventDto[]> {
    const events = await this.prisma.deploymentEvent.findMany({
      where: {
        deploymentId,
        tryCount,
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
        config: true,
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
        project: true,
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
        protected: request.protected,
        instances: {
          createMany: {
            data: version.images.map(it => ({
              imageId: it.id,
            })),
          },
        },
      },
      include: {
        node: true,
        version: {
          include: {
            project: true,
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
    if (req.configBundleIds) {
      const connections = await this.prisma.deployment.findFirst({
        where: {
          id: deploymentId,
        },
        include: {
          configBundles: true,
        },
      })

      const connectedBundles = connections.configBundles.map(it => it.configBundleId)
      const toConnect = req.configBundleIds.filter(it => !connectedBundles.includes(it))
      const toDisconnect = connectedBundles.filter(it => !req.configBundleIds.includes(it))

      if (toConnect.length > 0 || toDisconnect.length > 0) {
        await this.prisma.$transaction(async prisma => {
          await prisma.configBundleOnDeployments.createMany({
            data: toConnect.map(it => ({
              deploymentId,
              configBundleId: it,
            })),
          })

          await prisma.configBundleOnDeployments.deleteMany({
            where: {
              deploymentId,
              configBundleId: {
                in: toDisconnect,
              },
            },
          })
        })
      }
    }

    await this.prisma.deployment.update({
      where: {
        id: deploymentId,
      },
      data: {
        note: req.note ?? undefined,
        prefix: req.prefix ?? undefined,
        protected: req.protected ?? undefined,
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
    const instance = await this.prisma.instance.findUniqueOrThrow({
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

    // We should overwrite the user in the ConfigData. This is an edge case, which is why we haven't
    // implemented a new mapper for configDataToDb. However, in the long run, if there are more similar
    // situations, we will have to create a different mapper for InstanceConfig.
    config.user = configData.user

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
        status: true,
      },
    })

    if (deployment.status === 'successful') {
      const agent = this.agentService.getById(deployment.nodeId)
      if (!agent) {
        return
      }

      await agent.deleteContainers({
        prefix: deployment.prefix,
        container: null,
      })
    }
  }

  async startDeployment(deploymentId: string, identity: Identity, instances?: string[]): Promise<void> {
    const instanceWhere = instances
      ? {
          where: {
            id: {
              in: instances,
            },
          },
        }
      : null

    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      where: {
        id: deploymentId,
      },
      include: {
        configBundles: {
          include: {
            configBundle: true,
          },
        },
        version: {
          include: {
            project: {
              select: {
                name: true,
                teamId: true,
              },
            },
          },
        },
        instances: {
          ...instanceWhere,
          include: {
            image: {
              include: {
                config: true,
                registry: true,
              },
            },
            config: true,
          },
          orderBy: {
            image: {
              order: 'asc',
            },
          },
        },
        node: {
          select: {
            name: true,
          },
        },
        tokens: {
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

    const mergedEnvironment = this.mergeEnvironments(
      (deployment.environment as UniqueKeyValue[]) ?? [],
      deployment.configBundles.map(it => it.configBundle),
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
            const registryUrl = this.registryMapper.pullUrlOf(registry)

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
              instanceConfig: this.mapper.deploymentToAgentInstanceConfig(deployment, mergedEnvironment),
              registry: registryUrl,
              registryAuth: !registry.user
                ? undefined
                : {
                    name: registry.name,
                    url: registryUrl,
                    user: registry.user,
                    password: this.encryptionService.decrypt(registry.token),
                  },
            } as DeployRequest
          }),
        ),
      },
      {
        teamId: deployment.version.project.teamId,
        actor: identity ?? (deployment.tokens.length > 0 ? deployment.tokens[0].name : null),
        projectName: deployment.version.project.name,
        versionName: deployment.version.name,
        nodeName: deployment.node.name,
      },
      mergedConfigs,
      mergedEnvironment,
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

  async finishDeployment(nodeId: string, finishedDeployment: Deployment, status: DeploymentStatusEnum) {
    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      select: {
        status: true,
        prefix: true,
        environment: true,
        configBundles: {
          include: {
            configBundle: true,
          },
        },
        version: {
          select: {
            id: true,
            type: true,
            deployments: {
              select: {
                id: true,
              },
              where: {
                nodeId,
              },
            },
          },
        },
      },
      where: {
        id: finishedDeployment.id,
      },
    })

    const finalStatus = status === 'successful' ? 'successful' : 'failed'

    if (deployment.status !== finalStatus) {
      // update status for sure

      await this.prisma.deployment.update({
        where: {
          id: finishedDeployment.id,
        },
        data: {
          status: finalStatus,
        },
      })

      deployment.status = finalStatus
    }

    if (finalStatus !== 'successful') {
      return
    }

    await this.prisma.$transaction(async prisma => {
      await prisma.deployment.updateMany({
        data: {
          status: DeploymentStatusEnum.obsolete,
        },
        where: {
          id: {
            not: finishedDeployment.id,
          },
          versionId: deployment.version.id,
          nodeId,
          prefix: deployment.prefix,
          status: {
            not: DeploymentStatusEnum.preparing,
          },
        },
      })

      const parentVersionIds = await collectParentVersionIds(prisma, deployment.version.id)
      await prisma.deployment.updateMany({
        data: {
          status: DeploymentStatusEnum.obsolete,
        },
        where: {
          versionId: {
            in: parentVersionIds,
          },
          nodeId,
          prefix: deployment.prefix,
          status: {
            not: DeploymentStatusEnum.preparing,
          },
        },
      })

      const childVersionIds = await collectChildVersionIds(prisma, deployment.version.id)
      await prisma.deployment.updateMany({
        data: {
          status: DeploymentStatusEnum.downgraded,
        },
        where: {
          versionId: {
            in: childVersionIds,
          },
          nodeId,
          prefix: deployment.prefix,
        },
      })

      if (deployment.version.type === 'rolling') {
        return
      }

      if (finishedDeployment.sharedEnvironment.length > 0) {
        await prisma.deployment.update({
          where: {
            id: finishedDeployment.id,
          },
          data: {
            environment: toPrismaJson(finishedDeployment.sharedEnvironment),
          },
        })

        await prisma.configBundleOnDeployments.deleteMany({
          where: {
            deploymentId: finishedDeployment.id,
          },
        })
      }

      const configUpserts = Array.from(finishedDeployment.mergedConfigs).map(it => {
        const [key, config] = it
        const dbConfig = this.containerMapper.configDataToDb(config)

        return prisma.instanceContainerConfig.upsert({
          where: {
            instanceId: key,
          },
          update: {
            ...dbConfig,
          },
          create: {
            ...dbConfig,
            id: undefined,
            instanceId: key,
          },
        })
      })

      await Promise.all(configUpserts)
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

  async getDeployments(teamSlug: string, query?: DeploymentQueryDto): Promise<DeploymentListDto> {
    let where: Prisma.DeploymentWhereInput = {
      version: {
        project: {
          team: {
            slug: teamSlug,
          },
        },
      },
      nodeId: query?.nodeId,
      status: query?.status ? this.mapper.statusDtoToDb(query.status) : undefined,
    }

    if (query.filter) {
      const { filter: filterKeyword } = query
      where = {
        ...where,
        OR: [
          {
            prefix: {
              contains: filterKeyword,
              mode: 'insensitive',
            },
          },
          {
            node: {
              name: {
                contains: filterKeyword,
                mode: 'insensitive',
              },
            },
          },
          {
            version: {
              name: {
                contains: filterKeyword,
                mode: 'insensitive',
              },
            },
          },
          {
            version: {
              project: {
                name: {
                  contains: filterKeyword,
                  mode: 'insensitive',
                },
              },
            },
          },
        ],
      }
    }

    const [deployments, total] = await this.prisma.$transaction([
      this.prisma.deployment.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: query?.skip,
        take: query?.take,
        include: {
          version: {
            select: {
              id: true,
              name: true,
              type: true,
              project: {
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
      }),
      this.prisma.deployment.count({ where }),
    ])

    return {
      items: deployments.map(it => this.mapper.toDto(it)),
      total,
    }
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

    const secrets = await agent.listSecrets({
      container: {
        prefix: deployment.prefix,
        name: containerName,
      },
    })

    return this.mapper.secretsResponseToInstanceSecretsDto(secrets)
  }

  async copyDeployment(deploymentId: string, request: CopyDeploymentDto, identity: Identity): Promise<DeploymentDto> {
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

    const newDeployment = await this.prisma.deployment.create({
      data: {
        versionId: oldDeployment.versionId,
        nodeId: request.nodeId,
        prefix: request.prefix,
        note: request.note,
        status: DeploymentStatusEnum.preparing,
        createdBy: identity.id,
        environment: oldDeployment.environment ?? [],
      },
      include: {
        node: true,
        version: {
          include: {
            project: true,
          },
        },
      },
    })

    const differentNode = oldDeployment.nodeId !== newDeployment.nodeId

    await this.prisma.$transaction(
      oldDeployment.instances.map(it =>
        this.prisma.instance.create({
          data: {
            deploymentId: newDeployment.id,
            imageId: it.imageId,
            config: it.config
              ? {
                  create: {
                    name: it.config.name,
                    expose: it.config.expose,
                    routing: toPrismaJson(it.config.routing),
                    configContainer: toPrismaJson(it.config.configContainer),
                    user: it.config.user,
                    tty: it.config.tty,
                    ports: toPrismaJson(it.config.ports),
                    portRanges: toPrismaJson(it.config.portRanges),
                    volumes: toPrismaJson(it.config.volumes),
                    commands: toPrismaJson(it.config.commands),
                    args: toPrismaJson(it.config.args),
                    environment: toPrismaJson(it.config.environment),
                    secrets: differentNode ? null : toPrismaJson(it.config.secrets),
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

  async createDeploymentToken(
    teamSlug: string,
    deploymentId: string,
    req: CreateDeploymentTokenDto,
    identity: Identity,
  ): Promise<DeploymentTokenCreatedDto> {
    const nonce = uuid()
    let expiresAt: Date | null = null

    if (req.expirationInDays) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + req.expirationInDays)
    }

    this.logger.verbose(`DeploymentToken expires at ${expiresAt?.toISOString()}`)

    const payload: DeploymentTokenPayload = {
      deploymentId,
      nonce,
    }

    const jwt = this.jwtService.sign(payload, tokenSignOptionsFor(identity, expiresAt))

    const tokenGenerator = new DeploymentTokenScriptGenerator(this.configService)

    const curl = tokenGenerator
      .getCurlCommand({
        deploymentId,
        teamSlug,
        token: jwt,
      })
      .trim()

    const deploymentToken = await this.prisma.deploymentToken.create({
      data: {
        name: req.name,
        deploymentId,
        nonce,
        expiresAt,
        createdBy: identity.id,
      },
    })

    return {
      id: deploymentToken.id,
      name: deploymentToken.name,
      createdAt: deploymentToken.createdAt,
      expiresAt,
      token: jwt,
      curl,
    }
  }

  async deleteDeploymentToken(deploymentId: string): Promise<void> {
    await this.prisma.deploymentToken.delete({
      where: {
        deploymentId,
      },
    })
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

  async getConfigBundleEnvironmentById(deploymentId: string): Promise<EnvironmentToConfigBundleNameMap> {
    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      where: {
        id: deploymentId,
      },
      include: {
        configBundles: {
          include: {
            configBundle: true,
          },
        },
      },
    })

    return this.getConfigBundleEnvironmentKeys(deployment.configBundles.map(it => it.configBundle))
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

  private mergeEnvironments(deployment: UniqueKeyValue[], configBundles: ConfigBundle[]): UniqueKeyValue[] {
    const mergedEnvironment: Record<string, UniqueKeyValue> = {}

    configBundles.forEach(bundle => {
      const bundleEnv = (bundle.data as UniqueKeyValue[]) ?? []
      bundleEnv.forEach(it => {
        mergedEnvironment[it.key] = it
      })
    })

    deployment.forEach(it => {
      mergedEnvironment[it.key] = it
    })

    return Object.values(mergedEnvironment)
  }

  private getConfigBundleEnvironmentKeys(configBundles: ConfigBundle[]): EnvironmentToConfigBundleNameMap {
    const envToBundle: EnvironmentToConfigBundleNameMap = {}

    configBundles.forEach(bundle => {
      const bundleEnv = (bundle.data as UniqueKeyValue[]) ?? []
      bundleEnv.forEach(it => {
        envToBundle[it.key] = bundle.name
      })
    })

    return envToBundle
  }
}
