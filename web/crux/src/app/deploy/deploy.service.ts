import { Injectable, Logger, PreconditionFailedException } from '@nestjs/common'
import { DeploymentStatusEnum } from '@prisma/client'
import { JsonArray } from 'prisma'
import { concatAll, filter, from, map, merge, Observable, Subject } from 'rxjs'
import { PrismaService } from 'src/config/prisma.service'
import {
  defaultDeploymentName,
  Deployment,
  deploymentPrefixFromName,
  previousDeployPrefix,
} from 'src/domain/deployment'
import { InternalException } from 'src/exception/errors'
import { DeployRequest } from 'src/grpc/protobuf/proto/agent'
import {
  CreateDeploymentRequest,
  CreateEntityResponse,
  DeploymentDetailsResponse,
  DeploymentEditEventMessage,
  DeploymentEventListResponse,
  DeploymentListResponse,
  DeploymentProgressMessage,
  Empty,
  IdRequest,
  PatchDeploymentRequest,
  ServiceIdRequest,
  UpdateDeploymentRequest,
  UpdateEntityResponse,
} from 'src/grpc/protobuf/proto/crux'
import { InstanceContainerConfigData } from 'src/shared/model'
import { AgentService } from '../agent/agent.service'
import { ImageWithConfig } from '../image/image.mapper'
import { ImageService } from '../image/image.service'
import { DeployMapper, InstanceDetails } from './deploy.mapper'

@Injectable()
export class DeployService {
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

  async getDeploymentsByVersionId(request: IdRequest): Promise<DeploymentListResponse> {
    const deployments = await this.prisma.deployment.findMany({
      where: {
        versionId: request.id,
      },
      include: {
        node: true,
      },
    })

    return {
      data: deployments.map(it => this.mapper.toGrpc(it)),
    }
  }

  async getDeploymentDetails(request: IdRequest): Promise<DeploymentDetailsResponse> {
    const deployment = await this.prisma.deployment.findUnique({
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

    return this.mapper.detailsToGrpc(deployment)
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
    const version = await this.prisma.version.findUnique({
      where: {
        id: request.versionId,
      },
      include: {
        product: true,
        parent: true,
        images: true,
      },
    })

    const versionIds = version.parent ? [version.parent.parentVersionId, version.id] : [version.id]

    const previousDeploys = await this.prisma.deployment.findMany({
      where: {
        nodeId: request.nodeId,
        version: {
          OR: versionIds.map(it => {
            return {
              id: it,
            }
          }),
        },
      },
      orderBy: {
        prefix: 'asc',
      },
    })

    const node = await this.prisma.node.findUnique({
      where: {
        id: request.nodeId,
      },
    })

    let name = defaultDeploymentName(version.product.name, version.name, node.name)

    const nextIncrement = await this.prisma.deployment.count({
      where: {
        versionId: request.versionId,
        name: {
          startsWith: name,
        },
      },
    })

    if (nextIncrement > 0) {
      name = `${name} ${nextIncrement + 1}`
    }

    const deployment = await this.prisma.deployment.create({
      data: {
        versionId: request.versionId,
        nodeId: request.nodeId,
        status: DeploymentStatusEnum.preparing,
        name,
        createdBy: request.accessedBy,
        prefix:
          previousDeployPrefix(previousDeploys, version.id, version.parent?.parentVersionId) ??
          deploymentPrefixFromName(version.product.name),
        instances: {
          createMany: {
            data: version.images.map(it => {
              return {
                imageId: it.id,
                status: null,
              }
            }),
          },
        },
      },
    })

    return CreateEntityResponse.fromJSON(deployment)
  }

  async updateDeployment(request: UpdateDeploymentRequest): Promise<UpdateEntityResponse> {
    const deployment = await this.prisma.deployment.update({
      data: {
        name: request.name,
        description: request.descripion,
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
      const caps = request.instance.capabilities
      const envs = request.instance.environment

      instanceConfigPatchSet = {
        capabilities: caps ? caps.data ?? [] : (undefined as JsonArray),
        environment: envs ? envs.data ?? [] : (undefined as JsonArray),
        config: this.mapper.explicitConfigToDb(request.instance.config),
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
    const deployment = await this.prisma.deployment.findUnique({
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
      },
    })

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

    const deploy = new Deployment({
      id: deployment.id,
      releaseNotes: deployment.version.changelog,
      versionName: deployment.version.name,
      requests: deployment.instances.map(it => {
        const registry = it.image.registry
        const registryUrl = registry.type === 'v2' ? registry.url : ''

        return {
          id: it.id,
          imageName: it.image.name,
          tag: it.image.tag,
          containerConfig: this.mapper.instanceToAgentContainerConfig(deployment.prefix, it),
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
    })

    this.logger.debug(`Starting deployment: ${deploy.id}`)
    return agent.deploy(deploy)
  }

  subscribeToDeploymentEditEvents(request: ServiceIdRequest): Observable<DeploymentEditEventMessage> {
    return merge(
      this.instancesCreatedEvent.pipe(
        filter(it => it.deploymentIds.includes(request.id)),
        map(it => {
          return {
            instancesCreated: {
              data: it.instances.map(it => this.mapper.instanceToGrpc(it)),
            },
          } as DeploymentEditEventMessage
        }),
      ),
      this.imageDeletedEvent.pipe(
        map(it => {
          return {
            imageIdDeleted: it,
          } as DeploymentEditEventMessage
        }),
      ),
    )
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
              status: null,
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
