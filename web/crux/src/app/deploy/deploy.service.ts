import { Injectable, Logger, PreconditionFailedException } from '@nestjs/common'
import { DeploymentStatusEnum } from '@prisma/client'
import { JsonArray } from 'prisma'
import { concatAll, filter, from, map, merge, Observable, Subject } from 'rxjs'
import Deployment from 'src/domain/deployment'
import { InternalException } from 'src/exception/errors'
import { DeployRequest } from 'src/grpc/protobuf/proto/agent'
import {
  AccessRequest,
  CreateDeploymentRequest,
  CreateEntityResponse,
  DeploymentDetailsResponse,
  DeploymentEditEventMessage,
  DeploymentEventListResponse,
  DeploymentListByVersionResponse,
  DeploymentListResponse,
  DeploymentProgressMessage,
  Empty,
  IdRequest,
  PatchDeploymentRequest,
  ServiceIdRequest,
  UpdateDeploymentRequest,
  UpdateEntityResponse,
} from 'src/grpc/protobuf/proto/crux'
import PrismaService from 'src/services/prisma.service'
import { InstanceContainerConfigData } from 'src/shared/model'
import AgentService from '../agent/agent.service'
import { ImageWithConfig } from '../image/image.mapper'
import ImageService from '../image/image.service'
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
      data: deployments.map(it => this.mapper.deploymentByVersionToGrpc(it)),
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
              },
            },
            config: true,
          },
        },
      },
    })

    const publicKey = this.agentService.getById(deployment.nodeId)?.publicKey

    return this.mapper.detailsToGrpc(deployment, publicKey)
  }

  async getDeploymentEvents(request: IdRequest): Promise<DeploymentEventListResponse> {
    const events = await this.prisma.deploymentEvent.findMany({
      where: {
        deploymentId: request.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      data: events.map(it => this.mapper.eventToGrpc(it)),
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
        description: request.description,
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

    return CreateEntityResponse.fromJSON(deployment)
  }

  async updateDeployment(request: UpdateDeploymentRequest): Promise<UpdateEntityResponse> {
    const deployment = await this.prisma.deployment.update({
      data: {
        description: request.description,
        prefix: request.prefix,
        updatedAt: new Date(),
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
    let instanceConfigPatchSet: InstanceContainerConfigData = null

    if (reqInstance) {
      const { capabilities: caps, environment: envs, secrets } = request.instance

      instanceConfigPatchSet = {
        capabilities: caps ? caps.data ?? [] : (undefined as JsonArray),
        environment: envs ? envs.data ?? [] : (undefined as JsonArray),
        config: request.instance.config,
        secrets: secrets ? secrets.data ?? [] : (undefined as JsonArray),
      }
    }

    const now = new Date()

    const deployment = await this.prisma.deployment.update({
      data: {
        environment: request.environment?.data as JsonArray,
        updatedAt: now,
        updatedBy: request.accessedBy,
        instances: !reqInstance
          ? undefined
          : {
              update: {
                where: {
                  id: reqInstance.id,
                },
                data: {
                  updatedAt: now,
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
    // TODO: delete it from the node if neccessary
    await this.prisma.deployment.delete({
      where: {
        id: request.id,
      },
    })

    return Empty
  }

  async startDeployment(request: IdRequest): Promise<Observable<DeploymentProgressMessage>> {
    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      where: {
        id: request.id,
      },
      include: {
        version: {
          select: {
            name: true,
            changelog: true,
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

    if (deployment.status !== DeploymentStatusEnum.preparing && deployment.status !== DeploymentStatusEnum.failed) {
      throw new PreconditionFailedException({
        message: 'Invalid deployment state',
        property: 'status',
        value: deployment.nodeId,
      })
    }

    const agent = this.agentService.getById(deployment.nodeId)
    if (!agent) {
      // Todo in the client is this just a simple internal server error
      // please show a proper error message
      throw new PreconditionFailedException({
        message: 'Node is unreachable',
        property: 'nodeId',
        value: deployment.nodeId,
      })
    }

    await this.prisma.deployment.update({
      where: {
        id: deployment.id,
      },
      data: {
        status: DeploymentStatusEnum.inProgress,
      },
    })

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
              : registry.type === 'v2' || registry.type === 'gitlab'
              ? registry.url
              : ''

          return {
            id: it.id,
            containerName: it.image.config.name,
            imageName: it.image.name,
            tag: it.image.tag,
            containerConfig: this.mapper.instanceToAgentContainerConfig(it),
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
        nodeName: deployment.node.name,
      },
    )

    this.logger.debug(`Starting deployment: ${deploy.id}`)

    return agent.deploy(deploy)
  }

  subscribeToDeploymentEditEvents(request: ServiceIdRequest): Observable<DeploymentEditEventMessage> {
    return merge(
      this.instancesCreatedEvent.pipe(
        filter(it => it.deploymentIds.includes(request.id)),
        map(
          event =>
            ({
              instancesCreated: {
                data: event.instances.map(it => this.mapper.instanceToGrpc(it)),
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
      data: deployments.map(it => this.mapper.listItemToGrpc(it)),
    }
  }

  private async onImagesAddedToVersion(images: ImageWithConfig[]): Promise<InstancesCreatedEvent> {
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
