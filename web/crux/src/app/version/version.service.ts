import { Injectable, Logger } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { DeploymentStatusEnum, Prisma } from '@prisma/client'
import { VersionMessage } from 'src/domain/notification-templates'
import DomainNotificationService from 'src/services/domain.notification.service'
import PrismaService from 'src/services/prisma.service'
import AgentService from '../agent/agent.service'
import { EditorLeftMessage, EditorMessage } from '../editor/editor.message'
import EditorServiceProvider from '../editor/editor.service.provider'
import ImageMapper from '../image/image.mapper'
import {
  CreateVersionDto,
  IncreaseVersionDto,
  UpdateVersionDto,
  VersionDetailsDto,
  VersionDto,
  VersionListQuery,
} from './version.dto'
import VersionMapper from './version.mapper'

@Injectable()
export default class VersionService {
  private readonly logger = new Logger(VersionService.name)

  constructor(
    private prisma: PrismaService,
    private mapper: VersionMapper,
    private imageMapper: ImageMapper,
    private notificationService: DomainNotificationService,
    private agentService: AgentService,
    private readonly editorServices: EditorServiceProvider,
  ) {}

  async checkProductOrVersionIsInTheActiveTeam(
    productId: string,
    versionId: string | null,
    identity: Identity,
  ): Promise<boolean> {
    const versions = await this.prisma.product.count({
      where: {
        id: productId,
        team: {
          users: {
            some: {
              userId: identity.id,
              active: true,
            },
          },
        },
        versions: !versionId
          ? undefined
          : {
              some: {
                id: versionId,
              },
            },
      },
    })

    return versions > 0
  }

  async checkVersionIsInTheActiveTeam(versionId: string, identity: Identity): Promise<boolean> {
    const versions = await this.prisma.version.count({
      where: {
        id: versionId,
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
    })

    return versions > 0
  }

  async getVersionsByProductId(productId: string, user: Identity, query?: VersionListQuery): Promise<VersionDto[]> {
    const filter: Prisma.VersionWhereInput = {
      name: query?.nameContains
        ? {
            contains: query.nameContains,
          }
        : undefined,
    }

    const versions = await this.prisma.version.findMany({
      include: {
        children: true,
        parent: true,
      },
      where: {
        product: {
          id: productId,
          team: {
            users: {
              some: {
                active: true,
                userId: user.id,
              },
            },
          },
        },
        ...filter,
      },
    })

    return versions.map(it => this.mapper.toDto(it))
  }

  async getVersionDetails(versionId: string): Promise<VersionDetailsDto> {
    const version = await this.prisma.version.findUniqueOrThrow({
      where: {
        id: versionId,
      },
      include: {
        product: {
          select: {
            type: true,
          },
        },
        children: {
          select: {
            versionId: true,
          },
        },
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

    const nodes = new Set(version.deployments.map(it => it.nodeId))
    const statusLookup = new Map(
      [...nodes].map(it => {
        const node = this.agentService.getById(it)
        const status = node?.getConnectionStatus() ?? 'unreachable'
        return [it, status]
      }),
    )

    return this.mapper.detailsToDto(version, statusLookup)
  }

  async createVersion(productId: string, req: CreateVersionDto, identity: Identity): Promise<VersionDto> {
    const version = await this.prisma.$transaction(async prisma => {
      const defaultVersion = await prisma.version.findFirst({
        where: {
          productId,
          default: true,
        },
        select: {
          id: true,
          images: {
            include: {
              config: true,
            },
          },
          deployments: {
            include: {
              instances: {
                include: {
                  config: true,
                },
              },
            },
          },
        },
      })

      const newVersion = await prisma.version.create({
        data: {
          productId,
          name: req.name,
          changelog: req.changelog,
          type: req.type,
          default: !defaultVersion,
          createdBy: identity.id,
        },
        include: {
          product: {
            select: {
              name: true,
            },
          },
          children: {
            select: {
              versionId: true,
            },
          },
        },
      })

      if (defaultVersion) {
        const newImages = await Promise.all(
          defaultVersion.images.map(async image => {
            const newImage = await prisma.image.create({
              select: {
                id: true,
              },
              data: {
                ...image,
                id: undefined,
                versionId: newVersion.id,
                config: {
                  create: {
                    ...this.imageMapper.dbContainerConfigToCreateImageStatement(image.config),
                    id: undefined,
                  },
                },
              },
            })

            return [image.id, newImage.id]
          }),
        )

        const imageMap = newImages.reduce((prev, current) => {
          const [imageId, newImageId] = current

          return {
            ...prev,
            [imageId]: newImageId,
          }
        }, {})

        const deployments = await Promise.all(
          defaultVersion.deployments.map(async deployment => {
            const newDeployment = await prisma.deployment.create({
              select: {
                id: true,
              },
              data: {
                ...deployment,
                id: undefined,
                status: DeploymentStatusEnum.preparing,
                versionId: newVersion.id,
                environment: deployment.environment ?? [],
                events: undefined,
                instances: undefined,
              },
            })

            await Promise.all(
              deployment.instances.map(it =>
                prisma.instance.create({
                  select: {
                    id: true,
                  },
                  data: {
                    ...it,
                    id: undefined,
                    deploymentId: newDeployment.id,
                    imageId: imageMap[it.imageId],
                    config: it.config
                      ? {
                          create: {
                            ...this.imageMapper.dbContainerConfigToCreateImageStatement(it.config),
                            id: undefined,
                          },
                        }
                      : undefined,
                  },
                }),
              ),
            )
          }),
        )

        await Promise.all(deployments)
      }

      return newVersion
    })

    await this.notificationService.sendNotification({
      identityId: identity.id,
      messageType: 'version',
      message: { subject: version.product.name, version: version.name } as VersionMessage,
    })

    return this.mapper.toDto(version)
  }

  async updateVersion(versionId: string, req: UpdateVersionDto, identity: Identity): Promise<void> {
    await this.prisma.version.update({
      where: {
        id: versionId,
      },
      data: {
        name: req.name,
        changelog: req.changelog,
        updatedBy: identity.id,
      },
    })
  }

  async setDefaultVersion(productId: string, versionId: string): Promise<void> {
    await this.prisma.$transaction(async prisma => {
      await prisma.version.update({
        where: {
          id: versionId,
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
            id: versionId,
          },
          productId,
        },
        data: {
          default: false,
        },
      })
    })
  }

  async deleteVersion(versionId: string): Promise<void> {
    await this.prisma.version.delete({
      where: {
        id: versionId,
      },
    })
  }

  /**
   * Increasing an existing Version means copying the whole Version object
   * with Images and connected ImageConfigs and with Deployments and connected
   * Instances and InstanceConfigs.
   *
   * @async
   * @method
   * @param {string} versionId Parent version ID
   * @param {string} name New version name
   * @param {string} changelog The new version changelog text
   * @returns The processed prisma data - VersionDto
   */
  async increaseVersion(versionId: string, request: IncreaseVersionDto, identity: Identity): Promise<VersionDto> {
    // Query the parent Version which will be the version we will increase
    // and include all necessary objects like images and deployments
    const parentVersion = await this.prisma.version.findUniqueOrThrow({
      where: {
        id: versionId,
      },
      include: {
        images: {
          include: {
            config: true,
          },
        },
        deployments: {
          distinct: ['nodeId', 'prefix'],
          where: {
            OR: [
              { status: DeploymentStatusEnum.successful },
              { status: DeploymentStatusEnum.preparing },
              { status: DeploymentStatusEnum.failed },
            ],
          },
          include: {
            instances: {
              include: {
                config: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    })

    const increasedVersion = await this.prisma.$transaction(async prisma => {
      const version = await prisma.version.create({
        data: {
          productId: parentVersion.productId,
          name: request.name,
          changelog: request.changelog,
          default: false,
          createdBy: identity.id,
          type: parentVersion.type,
        },
        include: {
          children: {
            select: {
              versionId: true,
            },
          },
          product: {
            select: {
              name: true,
            },
          },
        },
      })

      const images: [string, string][] = await Promise.all(
        // Iterate through the version images
        parentVersion.images.map(async image => {
          const createdImage = await prisma.image.create({
            data: {
              name: image.name,
              tag: image.tag,
              order: image.order,
              registryId: image.registryId,
              versionId: version.id,
              createdBy: identity.id,
            },
          })

          await prisma.containerConfig.create({
            data: {
              ...this.imageMapper.dbContainerConfigToCreateImageStatement(image.config),
              id: undefined,
              imageId: createdImage.id,
            },
          })

          return [image.id, createdImage.id]
        }),
      )

      const imageMap = new Map(images)
      await Promise.all(
        // Iterate through the deployments images
        parentVersion.deployments.map(async deployment => {
          const createdDeploy = await prisma.deployment.create({
            data: {
              createdBy: identity.id,
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
              const imageId = imageMap.get(instance.imageId)

              const createdInstance = await prisma.instance.create({
                data: {
                  state: instance.state,
                  deploymentId: createdDeploy.id,
                  imageId,
                },
              })

              if (instance.config) {
                await prisma.instanceContainerConfig.create({
                  data: {
                    ...this.imageMapper.dbContainerConfigToCreateImageStatement(instance.config),
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

      return version
    }) // End of Prisma transaction

    await this.notificationService.sendNotification({
      identityId: identity.id,
      messageType: 'version',
      message: { subject: increasedVersion.product.name, version: increasedVersion.name } as VersionMessage,
    })

    return this.mapper.toDto(increasedVersion)
  }

  async onEditorJoined(
    versionId: string,
    clientToken: string,
    identity: Identity,
  ): Promise<[EditorMessage, EditorMessage[]]> {
    const editors = await this.editorServices.getOrCreateService(versionId)

    const me = editors.onClientJoin(clientToken, identity)

    return [me, editors.getEditors()]
  }

  async onEditorLeft(versionId: string, clientToken: string): Promise<EditorLeftMessage> {
    const editors = await this.editorServices.getOrCreateService(versionId)
    const message = editors.onClientLeft(clientToken)

    if (editors.editorCount < 1) {
      this.logger.verbose(`All editors left removing ${versionId}`)
      this.editorServices.free(versionId)
    }

    return message
  }
}
