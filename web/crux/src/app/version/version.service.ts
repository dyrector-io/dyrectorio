import { Injectable } from '@nestjs/common'
import { DeploymentStatusEnum, Version } from '@prisma/client'
import { VersionMessage } from 'src/domain/notification-templates'
import {
  CreateEntityResponse,
  CreateVersionRequest,
  IdRequest,
  IncreaseVersionRequest,
  UpdateEntityResponse,
  UpdateVersionRequest,
  VersionDetailsResponse,
  VersionListResponse,
} from 'src/grpc/protobuf/proto/crux'
import { Empty } from 'src/grpc/protobuf/proto/common'
import DomainNotificationService from 'src/services/domain.notification.service'
import PrismaService from 'src/services/prisma.service'
import VersionMapper from './version.mapper'
import ImageMapper from '../image/image.mapper'

@Injectable()
export default class VersionService {
  constructor(
    private prisma: PrismaService,
    private mapper: VersionMapper,
    private imageMapper: ImageMapper,
    private notificationService: DomainNotificationService,
  ) {}

  async getVersionsByProductId(req: IdRequest): Promise<VersionListResponse> {
    const versions = await this.prisma.version.findMany({
      include: {
        children: true,
        parent: true,
      },
      where: {
        productId: req.id,
        product: {
          id: req.id,
          team: {
            users: {
              some: {
                active: true,
                userId: req.accessedBy,
              },
            },
          },
        },
      },
    })

    return {
      data: versions.map(it => this.mapper.toGrpc(it)),
    }
  }

  async getVersionDetails(req: IdRequest): Promise<VersionDetailsResponse> {
    const version = await this.prisma.version.findUniqueOrThrow({
      where: {
        id: req.id,
      },
      include: {
        children: true,
        images: {
          include: {
            config: true,
            registry: true,
          },
        },
        deployments: {
          include: {
            node: true,
          },
        },
      },
    })

    return this.mapper.detailsToGrpc(version)
  }

  async createVersion(req: CreateVersionRequest): Promise<CreateEntityResponse> {
    const version = await this.prisma.$transaction(async prisma => {
      const defaultVersion = await prisma.version.findFirst({
        where: {
          productId: req.productId,
          default: true,
        },
        select: {
          id: true,
          images: {
            include: {
              config: true,
            },
          },
        },
      })

      const newVersion = await prisma.version.create({
        data: {
          productId: req.productId,
          name: req.name,
          changelog: req.changelog,
          type: this.mapper.typeToDb(req.type),
          default: !defaultVersion,
          createdBy: req.accessedBy,
        },
      })

      if (defaultVersion) {
        const images = defaultVersion.images.map(
          async image =>
            await prisma.image.create({
              select: {
                id: true,
              },
              data: {
                ...image,
                id: undefined,
                versionId: newVersion.id,
                config: {
                  create: {
                    ...this.imageMapper.configDetailsToDb(image.config),
                  },
                },
              },
            }),
        )

        await Promise.all(images)
      }

      return newVersion
    })

    const product = await this.prisma.product.findUnique({
      where: {
        id: req.productId,
      },
    })

    await this.notificationService.sendNotification({
      identityId: req.accessedBy,
      messageType: 'version',
      message: { subject: product.name, version: version.name } as VersionMessage,
    })

    return CreateEntityResponse.fromJSON(version)
  }

  async updateVersion(req: UpdateVersionRequest): Promise<UpdateEntityResponse> {
    const version = await this.prisma.version.update({
      where: {
        id: req.id,
      },
      data: {
        name: req.name,
        changelog: req.changelog,
        updatedBy: req.accessedBy,
      },
    })

    return UpdateEntityResponse.fromJSON(version)
  }

  async setDefaultVersion(req: IdRequest): Promise<Empty> {
    await this.prisma.$transaction(async prisma => {
      const version = prisma.version.update({
        where: {
          id: req.id,
        },
        data: {
          default: true,
        },
        select: {
          productId: true,
        },
      })

      await prisma.version.updateMany({
        where: {
          NOT: {
            id: req.id,
          },
          productId: (await version).productId,
        },
        data: {
          default: false,
        },
      })
    })

    return Empty
  }

  async deleteVersion(req: IdRequest): Promise<Empty> {
    await this.prisma.version.delete({
      where: {
        id: req.id,
      },
    })

    return Empty
  }

  /**
   * Increasing an existing Version means copying the whole Version object
   * with Images and connected ImageConfigs and with Deployments and connected
   * Instances and InstanceConfigs. Need to be done in one Prisma transaction
   * to drop error if any of the creations is failing.
   *
   * @async
   * @method
   * @param {string} parentVersionId Parent version ID
   * @param {string} name New version name
   * @param {string} changelog The new version changelog text
   * @throws {AlreadyExistsException} When the version exists child version
   * @returns The processed prisma data - CreateEntityResponse
   */
  async increaseVersion(request: IncreaseVersionRequest) {
    // Query the parent Version which will be the version we will increase
    // and include all necessary objects like images and deployments
    const parentVersion = await this.prisma.version.findUniqueOrThrow({
      where: {
        id: request.id,
      },
      include: {
        images: {
          include: {
            config: true,
          },
        },
        deployments: {
          include: {
            node: false,
            events: false,
            instances: {
              include: {
                config: true,
              },
            },
          },
        },
      },
    })

    let version: Version = null

    await this.prisma.$transaction(async prisma => {
      version = await prisma.version.create({
        data: {
          productId: parentVersion.productId,
          name: request.name,
          changelog: request.changelog,
          default: false,
          createdBy: request.accessedBy,
          type: parentVersion.type,
        },
      })

      await Promise.all(
        // Iterate through the version images
        parentVersion.images.map(async image => {
          const createdImage = await prisma.image.create({
            data: {
              name: image.name,
              tag: image.tag,
              order: image.order,
              registryId: image.registryId,
              versionId: version.id,
              createdBy: request.accessedBy,
            },
          })

          await prisma.containerConfig.create({
            data: {
              id: undefined,
              imageId: createdImage.id,
              ...this.imageMapper.configDetailsToDb(image.config),
            },
          })
        }),
      )

      await Promise.all(
        // Iterate through the deployments images
        parentVersion.deployments.map(async deployment => {
          const createdDeploy = await prisma.deployment.create({
            data: {
              createdBy: request.accessedBy,
              note: deployment.note,
              prefix: deployment.prefix,
              // Default status for deployments is preparing
              status: DeploymentStatusEnum.preparing,
              environment: deployment.environment ?? [],
              nodeId: deployment.nodeId,
              versionId: version.id,
            },
          })

          await Promise.all(
            deployment.instances.map(async instance => {
              const createdInstance = await prisma.instance.create({
                data: {
                  state: instance.state,
                  deploymentId: createdDeploy.id,
                  imageId: instance.imageId,
                },
              })

              if (instance.config) {
                await prisma.instanceContainerConfig.create({
                  data: {
                    ...instance.config,
                    id: undefined,
                    instanceId: createdInstance.id,
                  },
                })
              }
            }),
          )
        }),
      )

      // Save the relationship between the new version and the base (increased) one
      await prisma.versionsOnParentVersion.create({
        data: {
          parentVersionId: parentVersion.id,
          versionId: version.id,
        },
      })
    }) // End of Prisma transaction

    const product = await this.prisma.product.findFirst({
      where: {
        id: parentVersion.productId,
      },
    })

    if (product) {
      await this.notificationService.sendNotification({
        identityId: request.accessedBy,
        messageType: 'version',
        message: { subject: product.name, version: version.name } as VersionMessage,
      })
    }

    return CreateEntityResponse.fromJSON(version)
  }
}
