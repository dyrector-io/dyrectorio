import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { JwtService } from '@nestjs/jwt'
import { Identity } from '@ory/kratos-client'
import { ContainerConfig, DeploymentStatusEnum, Prisma } from '@prisma/client'
import { EMPTY, Observable, filter, map } from 'rxjs'
import {
  ConcreteContainerConfigData,
  ContainerConfigData,
  UniqueSecretKeyValue,
  configIsEmpty,
} from 'src/domain/container'
import Deployment, { DeploymentWithConfig } from 'src/domain/deployment'
import { DeploymentTokenScriptGenerator } from 'src/domain/deployment-token'
import {
  DEPLOYMENT_EVENT_CONFIG_BUNDLES_UPDATE,
  DEPLOYMENT_EVENT_INSTACE_CREATE,
  DEPLOYMENT_EVENT_INSTACE_DELETE,
  DeploymentConfigBundlesUpdatedEvent,
  InstanceDeletedEvent,
  InstancesCreatedEvent,
} from 'src/domain/domain-events'
import {
  InvalidSecrets,
  collectInvalidSecrets,
  deploymentConfigOf,
  instanceConfigOf,
  mergePrefixNeighborSecrets,
} from 'src/domain/start-deployment'
import { DeploymentTokenPayload, tokenSignOptionsFor } from 'src/domain/token'
import { collectChildVersionIds, collectParentVersionIds, toPrismaJson } from 'src/domain/utils'
import { copyDeployment } from 'src/domain/version-increase'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import { DeployWorkloadRequest } from 'src/grpc/protobuf/proto/agent'
import EncryptionService from 'src/services/encryption.service'
import PrismaService from 'src/services/prisma.service'
import { DomainEvent } from 'src/shared/domain-event'
import { WsMessage } from 'src/websockets/common'
import { v4 as uuid } from 'uuid'
import AgentService from '../agent/agent.service'
import ContainerMapper from '../container/container.mapper'
import { EditorLeftMessage, EditorMessage } from '../editor/editor.message'
import EditorServiceProvider from '../editor/editor.service.provider'
import RegistryMapper from '../registry/registry.mapper'
import DeployDomainEventListener from './deploy.domain-event.listener'
import {
  CopyDeploymentDto,
  CreateDeploymentDto,
  CreateDeploymentTokenDto,
  DeploymentDetailsDto,
  DeploymentDto,
  DeploymentEventDto,
  DeploymentListDto,
  DeploymentLogListDto,
  DeploymentLogPaginationQuery,
  DeploymentQueryDto,
  DeploymentSecretsDto,
  DeploymentTokenCreatedDto,
  InstanceDetailsDto,
  InstanceSecretsDto,
  PatchInstanceDto,
  UpdateDeploymentDto,
} from './deploy.dto'
import DeployMapper from './deploy.mapper'
import {
  DeploymentEventListMessage,
  WS_TYPE_DEPLOYMENT_BUNDLES_UPDATED,
  WS_TYPE_INSTANCES_ADDED,
  WS_TYPE_INSTANCE_DELETED,
} from './deploy.message'

@Injectable()
export default class DeployService {
  private readonly logger = new Logger(DeployService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => AgentService))
    private readonly agentService: AgentService,
    private readonly domainEvents: DeployDomainEventListener,
    @Inject(forwardRef(() => DeployMapper))
    private readonly mapper: DeployMapper,
    private readonly events: EventEmitter2,
    private readonly registryMapper: RegistryMapper,
    @Inject(forwardRef(() => ContainerMapper))
    private readonly containerMapper: ContainerMapper,
    private readonly editorServices: EditorServiceProvider,
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
  ) {}

  subscribeToDomainEvents(deploymentId: string): Observable<WsMessage> {
    return this.domainEvents.watchEvents(deploymentId).pipe(
      map(it => this.transformDomainEventToWsMessage(it)),
      filter(it => !!it),
    )
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
        config: true,
        configBundles: {
          include: {
            configBundle: {
              include: {
                config: true,
              },
            },
          },
        },
        version: {
          include: {
            project: true,
          },
        },
        token: {
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

    return this.mapper.toDetailsDto(deployment)
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

  async getInstance(instanceId: string): Promise<InstanceDetailsDto> {
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

    const previousDeployment = await this.prisma.deployment.findFirst({
      where: {
        prefix: request.prefix,
        nodeId: request.nodeId,
        versionId: request.versionId,
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

    const deploy = await this.prisma.$transaction(async prisma => {
      const deployment = await this.prisma.deployment.create({
        data: {
          version: { connect: { id: request.versionId } },
          node: { connect: { id: request.nodeId } },
          status: DeploymentStatusEnum.preparing,
          note: request.note,
          createdBy: identity.id,
          prefix: request.prefix,
          protected: request.protected,
          config: { create: { type: 'deployment' } },
        },
        include: {
          node: true,
          version: {
            include: {
              project: true,
            },
          },
          instances: {
            select: {
              id: true,
              imageId: true,
              image: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })

      const instances = await Promise.all(
        version.images.map(
          async image =>
            await prisma.instance.create({
              data: {
                deployment: { connect: { id: deployment.id } },
                image: { connect: { id: image.id } },
                config: { create: { type: 'instance' } },
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
            }),
        ),
      )

      deployment.instances = instances

      const previousSecrets: Map<string, UniqueSecretKeyValue[]> = new Map(
        previousDeployment?.instances
          ?.filter(it => {
            const secrets = it.config.secrets as UniqueSecretKeyValue[]
            return !!it.config.secrets || secrets.length > 0
          })
          ?.map(it => [it.imageId, it.config.secrets as UniqueSecretKeyValue[]]) ?? [],
      )

      await Promise.all(
        deployment.instances.map(async it => {
          const secrets = previousSecrets[it.imageId]

          await prisma.instance.update({
            where: {
              id: it.id,
            },
            data: {
              config: {
                create: {
                  type: 'instance',
                  updatedBy: identity.id,
                  secrets,
                },
              },
            },
          })
        }),
      )

      return deployment
    })

    return this.mapper.toDto(deploy)
  }

  async updateDeployment(deploymentId: string, req: UpdateDeploymentDto, identity: Identity): Promise<void> {
    const deployment = await this.prisma.deployment.update({
      where: {
        id: deploymentId,
      },
      data: {
        note: req.note,
        prefix: req.prefix,
        protected: req.protected,
        configBundles: {
          deleteMany: {
            deploymentId,
          },
          create: req.configBundles.map(configBundleId => ({ configBundle: { connect: { id: configBundleId } } })),
        },
        updatedBy: identity.id,
      },
      select: {
        configBundles: {
          select: {
            configBundle: {
              include: {
                config: true,
              },
            },
          },
        },
      },
    })

    const event: DeploymentConfigBundlesUpdatedEvent = {
      deploymentId,
      bundles: deployment.configBundles.map(it => it.configBundle),
    }

    await this.events.emitAsync(DEPLOYMENT_EVENT_CONFIG_BUNDLES_UPDATE, event)
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

    const configData = this.mapper.concreteConfigDtoToConcreteContainerConfigData(
      instance.image.config as any as ContainerConfigData,
      (instance.config ?? {}) as any as ConcreteContainerConfigData,
      req.config,
    )

    const config: Omit<ContainerConfig, 'id'> = {
      ...this.containerMapper.configDataToDbPatch(configData),
      type: 'deployment',
      updatedAt: new Date(),
      updatedBy: identity.id,
    }

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
                update: config,
              },
            },
          },
        },
      },
    })
  }

  async deleteDeployment(deploymentId: string): Promise<void> {
    await this.prisma.deployment.delete({
      where: {
        id: deploymentId,
      },
      select: {
        prefix: true,
        nodeId: true,
        status: true,
      },
    })
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
        config: true,
        configBundles: {
          include: {
            configBundle: {
              include: {
                config: true,
              },
            },
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
        token: {
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

    const invalidSecrets: InvalidSecrets[] = []

    // deployment config
    const deploymentConfig = deploymentConfigOf(deployment)

    if (deploymentConfig.secrets) {
      const invalidDeploymentSecrets = collectInvalidSecrets(deployment.configId, deploymentConfig, publicKey)

      if (invalidDeploymentSecrets) {
        invalidSecrets.push(invalidDeploymentSecrets)
      }
    }

    // instance config
    // instanceId to instanceConfig
    const instanceConfigs: Map<string, ConcreteContainerConfigData> = new Map(
      deployment.instances.map(instance => {
        const instanceConfig = instanceConfigOf(deployment, deploymentConfig, instance)

        return [instance.id, instanceConfig]
      }),
    )

    const invalidInstanceSecrets = deployment.instances
      .map(it => collectInvalidSecrets(it.configId, instanceConfigs.get(it.id), publicKey))
      .filter(it => !!it)

    invalidSecrets.push(...invalidInstanceSecrets)

    // check for invalid secrets
    if (invalidSecrets.length > 0) {
      await this.updateInvalidSecretsAndThrow(invalidSecrets)
    }

    const prefixNeighbors = await this.collectLatestSuccessfulDeploymentsForPrefix(deployment.nodeId, deployment.prefix)
    const sharedSecrets = mergePrefixNeighborSecrets(prefixNeighbors, publicKey)

    const tries = deployment.tries + 1
    await this.prisma.deployment.update({
      where: {
        id: deployment.id,
      },
      data: {
        tries,
      },
    })

    const deploy = new Deployment({
      request: {
        id: deployment.id,
        releaseNotes: deployment.version.changelog,
        versionName: deployment.version.name,
        prefix: deployment.prefix,
        secrets: sharedSecrets,
        requests: await Promise.all(
          deployment.instances.map(async it => {
            const { registry } = it.image
            const registryUrl = this.registryMapper.pullUrlOf(registry)

            const config = instanceConfigs.get(it.id)
            const storage = config.storageSet
              ? await this.prisma.storage.findFirstOrThrow({
                  where: {
                    id: config.storageId,
                  },
                })
              : undefined

            return {
              common: this.mapper.commonConfigToAgentProto(config, storage),
              crane: this.mapper.craneConfigToAgentProto(config),
              dagent: this.mapper.dagentConfigToAgentProto(config),
              id: it.id,
              containerName: it.image.config.name,
              imageName: it.image.name,
              tag: it.image.tag,
              registry: registryUrl,
              registryAuth: !registry.user
                ? undefined
                : {
                    name: registry.name,
                    url: registryUrl,
                    user: registry.user,
                    password: this.encryptionService.decrypt(registry.token),
                  },
            } as DeployWorkloadRequest
          }),
        ),
      },
      instanceConfigs,
      notification: {
        teamId: deployment.version.project.teamId,
        actor: identity ?? deployment.token?.name ?? null,
        projectName: deployment.version.project.name,
        versionName: deployment.version.name,
        nodeName: deployment.node.name,
      },
      deploymentConfig: !configIsEmpty(deploymentConfig) ? deploymentConfig : null,
      tries,
    })

    this.logger.debug(`Starting deployment: ${deploy.id}`)

    agent.deploy(deploy)

    await this.prisma.deployment.update({
      where: {
        id: deployment.id,
      },
      data: {
        status: DeploymentStatusEnum.inProgress,
        deployedAt: new Date(),
        deployedBy: identity.id,
      },
    })
  }

  async finishDeployment(nodeId: string, finishedDeployment: Deployment, status: DeploymentStatusEnum) {
    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      select: {
        status: true,
        prefix: true,
        config: true,
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
          deployedAt: new Date(),
        },
      })

      deployment.status = finalStatus
    }

    if (finalStatus !== 'successful') {
      return
    }

    await this.prisma.$transaction(async prisma => {
      // set other deployments to obsolate in this version

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

      if (deployment.version.type === 'rolling') {
        // we don't care about version parents and children
        // also we don't save the concrete configs

        return
      }

      // set other deployments obsolate in the parent version
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

      // set other diployments in children to downgraded
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

      if (finishedDeployment.deploymentConfig) {
        await prisma.deployment.update({
          where: {
            id: finishedDeployment.id,
          },
          data: {
            config: {
              update: this.containerMapper.configDataToDbPatch(finishedDeployment.deploymentConfig),
            },
          },
        })

        await prisma.configBundleOnDeployments.deleteMany({
          where: {
            deploymentId: finishedDeployment.id,
          },
        })
      }

      const configUpserts = Array.from(finishedDeployment.instanceConfigs).map(it => {
        const [key, config] = it
        const data = this.containerMapper.configDataToDbPatch(config)

        return prisma.instance.update({
          where: {
            id: key,
          },
          data: {
            config: {
              update: data,
            },
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

    if (!!query.configBundleId) {
      where = {
        ...where,
        configBundles: {
          some: {
            configBundleId: query.configBundleId,
          }
        }
      }
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

  async getDeploymentSecrets(deploymentId: string): Promise<DeploymentSecretsDto> {
    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      where: {
        id: deploymentId,
      },
    })

    const agent = this.agentService.getById(deployment.nodeId)
    if (!agent) {
      throw new CruxPreconditionFailedException({
        message: 'Node is unreachable',
        property: 'nodeId',
        value: deployment.nodeId,
      })
    }

    const secrets = await agent.listSecrets({
      target: {
        prefix: deployment.prefix,
      },
    })

    return this.mapper.secretsResponseToDeploymentSecretsDto(secrets)
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
      target: {
        container: {
          prefix: deployment.prefix,
          name: containerName,
        },
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
        config: true,
        instances: {
          include: {
            config: true,
          },
        },
      },
    })

    const copiedDeployment = copyDeployment(oldDeployment)

    const newDeployment = await this.prisma.deployment.create({
      data: {
        prefix: request.prefix,
        note: request.note,
        status: DeploymentStatusEnum.preparing,
        createdBy: identity.id,
        version: {
          connect: {
            id: copiedDeployment.versionId,
          },
        },
        node: {
          connect: {
            id: copiedDeployment.nodeId,
          },
        },
        config: !copiedDeployment.config
          ? undefined
          : {
              create: this.containerMapper.dbConfigToCreateConfigStatement(copiedDeployment.config),
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

    const differentNode = oldDeployment.nodeId !== newDeployment.nodeId

    await this.prisma.$transaction(
      oldDeployment.instances.map(it =>
        this.prisma.instance.create({
          data: {
            deployment: {
              connect: {
                id: newDeployment.id,
              },
            },
            image: {
              connect: {
                id: it.imageId,
              },
            },
            config: !it.config
              ? undefined
              : {
                  create: {
                    ...this.containerMapper.dbConfigToCreateConfigStatement(it.config),
                    secrets: differentNode ? null : toPrismaJson(it.config.secrets),
                  },
                },
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

  private transformDomainEventToWsMessage(ev: DomainEvent<object>): WsMessage | null {
    switch (ev.type) {
      case DEPLOYMENT_EVENT_INSTACE_CREATE:
        return {
          type: WS_TYPE_INSTANCES_ADDED,
          data: this.mapper.instancesCreatedEventToMessage(ev.event as InstancesCreatedEvent),
        }
      case DEPLOYMENT_EVENT_INSTACE_DELETE:
        return {
          type: WS_TYPE_INSTANCE_DELETED,
          data: this.mapper.instanceDeletedEventToMessage(ev.event as InstanceDeletedEvent),
        }
      case DEPLOYMENT_EVENT_CONFIG_BUNDLES_UPDATE:
        return {
          type: WS_TYPE_DEPLOYMENT_BUNDLES_UPDATED,
          data: this.mapper.bundlesUpdatedEventToMessage(ev.event as DeploymentConfigBundlesUpdatedEvent),
        }
      default: {
        this.logger.error(`Unhandled domain event ${ev.type}`)
        return null
      }
    }
  }

  private async updateInvalidSecretsAndThrow(secrets: InvalidSecrets[]) {
    await this.prisma.$transaction(
      secrets.map(it =>
        this.prisma.containerConfig.update({
          where: {
            id: it.configId,
          },
          data: {
            secrets: it.secrets,
          },
        }),
      ),
    )

    throw new CruxPreconditionFailedException({
      message: 'Some secrets are invalid',
      property: 'secrets',
      value: secrets.map(it => ({ ...it, secrets: undefined })),
    })
  }

  private async collectLatestSuccessfulDeploymentsForPrefix(
    nodeId: string,
    prefix: string,
  ): Promise<DeploymentWithConfig[]> {
    const versions = await this.prisma.version.findMany({
      where: {
        deployments: {
          some: {
            prefix,
            nodeId,
            status: 'successful',
          },
        },
      },
      include: {
        deployments: {
          where: {
            prefix,
            nodeId,
            status: 'successful',
          },
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            config: true,
          },
        },
      },
    })

    return versions.flatMap(it => it.deployments)
  }
}
