import { Version } from '.prisma/client'
import { Injectable } from '@nestjs/common'
import { DeploymentStatusEnum } from '@prisma/client'
import { PrismaService } from 'src/services/prisma.service'
import { containerNameFromImageName } from 'src/domain/deployment'
import { AlreadyExistsException } from 'src/exception/errors'
import {
  CreateEntityResponse,
  CreateVersionRequest,
  Empty,
  IdRequest,
  IncreaseVersionRequest,
  UpdateEntityResponse,
  UpdateVersionRequest,
  VersionDetailsResponse,
  VersionListResponse,
} from 'src/grpc/protobuf/proto/crux'
import { VersionMapper } from './version.mapper'
import { DomainNotificationService } from 'src/services/domain.notification.service'
import { VersionMessage } from 'src/domain/notification-templates'

@Injectable()
export class VersionService {
  constructor(
    private prisma: PrismaService,
    private mapper: VersionMapper,
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
    const version = await this.prisma.version.findUnique({
      where: {
        id: req.id,
      },
      include: {
        children: true,
        images: {
          include: {
            config: true,
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
    let version: Version = null

    await this.prisma.$transaction(async prisma => {
      const defaultVersion = await prisma.version.findFirst({
        rejectOnNotFound: false,
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

      version = await prisma.version.create({
        data: {
          productId: req.productId,
          name: req.name,
          changelog: req.changelog,
          type: this.mapper.typeToDb(req.type),
          default: req.default,
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
                versionId: version.id,
                config: {
                  create: {
                    name: containerNameFromImageName(image.name),
                    environment: image.config.environment,
                    capabilities: image.config.capabilities,
                    config: image.config.config,
                  },
                },
              },
            }),
        )

        await Promise.all(images)

        if (req.default) {
          await prisma.version.update({
            where: {
              id: defaultVersion.id,
            },
            data: {
              default: false,
            },
          })
        }
      }
    })

    const product = await this.prisma.product.findFirst({
      where: {
        id: req.productId,
      },
    })

    if (product) {
      await this.notificationService.sendNotification({
        identityId: req.accessedBy,
        messageType: 'version',
        message: { subject: product.name, version: version.name } as VersionMessage,
      })
    }

    return CreateEntityResponse.fromJSON(version)
  }

  async updateVersion(req: UpdateVersionRequest): Promise<UpdateEntityResponse> {
    let version: Version = null

    await this.prisma.$transaction(async prisma => {
      version = await prisma.version.update({
        where: {
          id: req.id,
        },
        data: {
          name: req.name,
          changelog: req.changelog,
          default: req.default,
          updatedAt: new Date(),
          updatedBy: req.accessedBy,
        },
      })

      if (req.default) {
        await prisma.version.updateMany({
          where: {
            productId: version.productId,
            NOT: {
              id: version.id,
            },
          },
          data: {
            default: false,
          },
        })
      }
    })

    return UpdateEntityResponse.fromJSON(version)
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
    const parentVersion = await this.prisma.version.findUnique({
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
      try {
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
      } catch (error) {
        throw new AlreadyExistsException({
          message: 'This version already has a child version',
          property: 'productId',
          value: parentVersion.id,
        })
      }

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
            },
          })

          await prisma.containerConfig.create({
            data: {
              ...image.config,
              id: undefined,
              imageId: createdImage.id,
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
              name: `Increased ${deployment.name}`,
              description: deployment.description,
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

    return CreateEntityResponse.fromJSON(version)
  }
}
