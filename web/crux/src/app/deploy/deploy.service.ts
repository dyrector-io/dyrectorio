import { Injectable, Logger } from '@nestjs/common'
import { DeploymentStatusEnum, Prisma } from '@prisma/client'
import { JsonArray } from 'prisma'
import { concatAll, EMPTY, filter, from, lastValueFrom, map, merge, Observable, Subject } from 'rxjs'
import Deployment from 'src/domain/deployment'
import { InternalException, PreconditionFailedException } from 'src/exception/errors'
import { DeployRequest } from 'src/grpc/protobuf/proto/agent'
import { Empty, ListSecretsResponse } from 'src/grpc/protobuf/proto/common'
import {
  AccessRequest,
  CreateDeploymentRequest,
  CreateEntityResponse,
  DeploymentDetailsResponse,
  DeploymentEditEventMessage,
  DeploymentEventListResponse,
  DeploymentListByVersionResponse,
  DeploymentListResponse,
  DeploymentListSecretsRequest,
  DeploymentProgressMessage,
  IdRequest,
  PatchDeploymentRequest,
  ServiceIdRequest,
  UpdateDeploymentRequest,
  UpdateEntityResponse,
} from 'src/grpc/protobuf/proto/crux'
import PrismaService from 'src/services/prisma.service'
import { toPrismaJson } from 'src/shared/mapper'
import {
  ContainerConfigData,
  InstanceContainerConfigData,
  MergedContainerConfigData,
  UniqueSecretKeyValue,
} from 'src/shared/models'
import AgentService from '../agent/agent.service'
import { ImageDetails } from '../image/image.mapper'
import ImageService from '../image/image.service'
import ContainerMapper from '../shared/container.mapper'
import DeployMapper, { InstanceDetails } from './deploy.mapper'

@Injectable()
export default class DeployService {
  private readonly logger = new Logger(DeployService.name)

  readonly instancesCreatedEvent = new Subject<InstancesCreatedEvent>()

  readonly imageDeletedEvent: Observable<string>

  constructor(
    private prisma: PrismaService,
    private agentService: AgentService,
    imageService: ImageService,
    private mapper: DeployMapper,
    private containerMapper: ContainerMapper,
  ) {
    imageService.imagesAddedToVersionEvent
      .pipe(
        map(it => from(this.onImagesAddedToVersion(it))),
        concatAll(),
      )
      .subscribe(it => this.instancesCreatedEvent.next(it))

    this.imageDeletedEvent = imageService.imageDeletedFromVersionEvent
  }

  async getDeploymentsByVersionId(request: IdRequest): Promise<DeploymentListByVersionResponse> {
    const deployments = await this.prisma.deployment.findMany({
      where: {
        versionId: request.id,
      },
      include: {
        node: true,
      },
    })

    return {
      data: deployments.map(it => this.mapper.deploymentByVersionToProto(it)),
    }
  }

  async getDeploymentDetails(request: IdRequest): Promise<DeploymentDetailsResponse> {
    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      where: {
        id: request.id,
      },
      include: {
        node: true,
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

    return this.mapper.detailsToProto(deployment, publicKey)
  }

  async getDeploymentEvents(request: IdRequest): Promise<DeploymentEventListResponse> {
    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      where: {
        id: request.id,
      },
      select: {
        status: true,
        events: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    return {
      status: this.mapper.statusToProto(deployment.status),
      data: deployment.events.map(it => this.mapper.eventToProto(it)),
    }
  }

  async createDeployment(request: CreateDeploymentRequest): Promise<CreateEntityResponse> {
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
        createdBy: request.accessedBy,
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

    return CreateEntityResponse.fromJSON(deployment)
  }

  async updateDeployment(request: UpdateDeploymentRequest): Promise<UpdateEntityResponse> {
    const deployment = await this.prisma.deployment.update({
      data: {
        note: request.note,
        prefix: request.prefix,
        updatedBy: request.accessedBy,
      },
      where: {
        id: request.id,
      },
    })

    return UpdateEntityResponse.fromJSON({
      ...deployment,
    })
  }

  async patchDeployment(request: PatchDeploymentRequest): Promise<UpdateEntityResponse> {
    const reqInstance = request.instance
    let instanceConfigPatchSet: Partial<InstanceContainerConfigData> = null

    if (reqInstance?.config) {
      const instance = await this.prisma.instance.findUnique({
        where: {
          id: reqInstance.id,
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

      const config = this.mapper.instanceConfigToInstanceContainerConfigData(
        instance.image.config as any as ContainerConfigData,
        (instance.config ?? {}) as any as InstanceContainerConfigData,
        reqInstance.config,
      )
      instanceConfigPatchSet = config
    }

    if (reqInstance?.resetSection) {
      instanceConfigPatchSet = this.mapper.configSectionResetToDb(
        instanceConfigPatchSet ?? {},
        reqInstance.resetSection,
      )
    }

    const deployment = await this.prisma.deployment.update({
      data: {
        environment: request.environment?.data as JsonArray,
        updatedBy: request.accessedBy,
        instances: !reqInstance
          ? undefined
          : {
              update: {
                where: {
                  id: reqInstance.id,
                },
                data: {
                  config: {
                    upsert: {
                      update: instanceConfigPatchSet,
                      create: instanceConfigPatchSet,
                    },
                  },
                },
              },
            },
      },
      where: {
        id: request.id,
      },
    })

    return UpdateEntityResponse.fromJSON({
      ...deployment,
    })
  }

  async deleteDeployment(request: IdRequest): Promise<Empty> {
    const deployment = await this.prisma.deployment.delete({
      where: {
        id: request.id,
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
        containerId: undefined,
        prefixName: undefined,
      })
    }

    return Empty
  }

  async startDeployment(request: IdRequest): Promise<Empty> {
    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      where: {
        id: request.id,
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
      throw new PreconditionFailedException({
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

      throw new PreconditionFailedException({
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

    const deploy = new Deployment(
      {
        id: deployment.id,
        releaseNotes: deployment.version.changelog,
        versionName: deployment.version.name,
        requests: deployment.instances.map(it => {
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

          return {
            common: this.mapper.commonConfigToAgentProto(mergedConfig),
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
      },
      {
        accessedBy: request.accessedBy,
        productName: deployment.version.product.name,
        versionName: deployment.version.name,
        nodeName: deployment.node.name,
      },
      mergedConfigs,
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

    return Empty
  }

  async subscribeToDeploymentEvents(request: IdRequest): Promise<Observable<DeploymentProgressMessage>> {
    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      where: {
        id: request.id,
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

    return runningDeployment.watchStatus()
  }

  subscribeToDeploymentEditEvents(request: ServiceIdRequest): Observable<DeploymentEditEventMessage> {
    return merge(
      this.instancesCreatedEvent.pipe(
        filter(it => it.deploymentIds.includes(request.id)),
        map(
          event =>
            ({
              instancesCreated: {
                data: event.instances.map(it => this.mapper.instanceToProto(it)),
              },
            } as DeploymentEditEventMessage),
        ),
      ),
      this.imageDeletedEvent.pipe(
        map(
          str =>
            ({
              imageIdDeleted: str,
            } as DeploymentEditEventMessage),
        ),
      ),
    )
  }

  async getDeploymentList(request: AccessRequest): Promise<DeploymentListResponse> {
    const deployments = await this.prisma.deployment.findMany({
      where: {
        version: {
          product: {
            team: {
              users: {
                some: {
                  userId: request.accessedBy,
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
              },
            },
          },
        },
        node: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return {
      data: deployments.map(it => this.mapper.listItemToProto(it)),
    }
  }

  async getDeploymentSecrets(request: DeploymentListSecretsRequest): Promise<ListSecretsResponse> {
    const deployment = await this.prisma.deployment.findFirstOrThrow({
      where: {
        id: request.id,
      },
    })

    const instanceWithImageAndConfig = await this.prisma.instance.findFirstOrThrow({
      where: {
        id: request.instanceId,
      },
      include: {
        image: {
          include: {
            config: true,
          },
        },
      },
    })

    const containerName = instanceWithImageAndConfig.image.config.name

    const agent = this.agentService.getById(deployment.nodeId)
    if (!agent) {
      throw new PreconditionFailedException({
        message: 'Node is unreachable',
        property: 'nodeId',
        value: deployment.nodeId,
      })
    }

    const watcher = agent.getContainerSecrets(deployment.prefix, containerName)

    return lastValueFrom(watcher)
  }

  async copyDeployment(request: IdRequest): Promise<CreateEntityResponse> {
    const oldDeployment = await this.prisma.deployment.findFirstOrThrow({
      where: {
        id: request.id,
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
        createdBy: request.accessedBy,
        prefix: oldDeployment.prefix,
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
                    importContainer: toPrismaJson(it.config.importContainer),
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
                  },
                }
              : undefined,
          },
        }),
      ),
    )

    if (preparingDeployment) {
      await this.deleteDeployment({
        accessedBy: request.accessedBy,
        id: preparingDeployment.id,
      })
    }

    return CreateEntityResponse.fromJSON(newDeployment)
  }

  private async onImagesAddedToVersion(images: ImageDetails[]): Promise<InstancesCreatedEvent> {
    const versionId = images?.length > 0 ? images[0].versionId : null
    if (!versionId) {
      throw new InternalException({
        message: 'ImagesAddedToVersionEvent generated with empty array',
      })
    }

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
        images.map(it =>
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
      deploymentIds: deployments.map(it => it.id),
      instances,
    }
  }
}

type InstancesCreatedEvent = {
  deploymentIds: string[]
  instances: InstanceDetails[]
}
