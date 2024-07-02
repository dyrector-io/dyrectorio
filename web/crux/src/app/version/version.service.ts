import { Injectable, Logger } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { DeploymentStatusEnum, Prisma } from '@prisma/client'
import { VersionMessage } from 'src/domain/notification-templates'
import { versionChainMembersOf } from 'src/domain/version-chain'
import { increaseIncrementalVersion } from 'src/domain/version-increase'
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
  VersionChainDto,
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

  async checkProjectOrVersionIsInTeam(teamSlug: string, projectId: string, versionId: string | null): Promise<boolean> {
    const versions = await this.prisma.project.count({
      where: {
        id: projectId,
        team: {
          slug: teamSlug,
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

  async checkVersionIsInTeam(teamSlug: string, versionId: string, identity: Identity): Promise<boolean> {
    const versions = await this.prisma.version.count({
      where: {
        id: versionId,
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
    })

    return versions > 0
  }

  async getVersionsByProjectId(projectId: string, user: Identity, query?: VersionListQuery): Promise<VersionDto[]> {
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
        project: {
          id: projectId,
        },
        ...filter,
      },
    })

    return versions.map(it => this.mapper.toDto(it))
  }

  async getVersionChainsByProject(projectId: string): Promise<VersionChainDto[]> {
    // we have to select all members, until https://github.com/prisma/prisma/issues/8935 gets resolved

    const chains = await this.prisma.versionChain.findMany({
      where: {
        projectId,
      },
      select: {
        id: true,
        members: {
          select: {
            id: true,
            name: true,
            parent: {
              select: {
                versionId: true,
              },
            },
            _count: {
              select: {
                children: true,
              },
            },
          },
        },
      },
    })

    return chains.map(it => {
      const chain = versionChainMembersOf(it)

      return this.mapper.chainToDto(chain)
    })
  }

  async getVersionDetails(versionId: string): Promise<VersionDetailsDto> {
    const version = await this.prisma.version.findUniqueOrThrow({
      where: {
        id: versionId,
      },
      include: {
        project: {
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

  async createVersion(projectId: string, req: CreateVersionDto, identity: Identity): Promise<VersionDto> {
    const version = await this.prisma.$transaction(async prisma => {
      const defaultVersion = await prisma.version.findFirst({
        where: {
          projectId,
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
          projectId,
          name: req.name,
          changelog: req.changelog,
          type: req.type,
          autoCopyDeployments: req.type === 'incremental' && req.autoCopyDeployments,
          default: !defaultVersion,
          createdBy: identity.id,
        },
        include: {
          project: {
            select: {
              name: true,
              teamId: true,
            },
          },
          children: {
            select: {
              versionId: true,
            },
          },
        },
      })

      if (newVersion.type === 'incremental') {
        await prisma.versionChain.create({
          data: {
            id: newVersion.id,
            project: {
              connect: {
                id: newVersion.projectId,
              },
            },
            members: {
              connect: {
                id: newVersion.id,
              },
            },
          },
        })
      }

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
                protected: false,
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
      teamId: version.project.teamId,
      messageType: 'version',
      message: { subject: version.project.name, version: version.name, owner: identity } as VersionMessage,
    })

    return this.mapper.toDto(version)
  }

  async updateVersion(versionId: string, req: UpdateVersionDto, identity: Identity): Promise<void> {
    const version = await this.prisma.version.findUniqueOrThrow({
      where: {
        id: versionId,
      },
      select: {
        type: true,
      },
    })

    await this.prisma.version.update({
      where: {
        id: versionId,
      },
      data: {
        name: req.name,
        changelog: req.changelog,
        autoCopyDeployments: version.type === 'incremental' && req.autoCopyDeployments,
        updatedBy: identity.id,
      },
    })
  }

  async setDefaultVersion(projectId: string, versionId: string): Promise<void> {
    await this.prisma.$transaction(async prisma => {
      await prisma.version.update({
        where: {
          id: versionId,
        },
        data: {
          default: true,
        },
        select: {
          projectId: true,
        },
      })

      await prisma.version.updateMany({
        where: {
          NOT: {
            id: versionId,
          },
          projectId,
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
   * with Images and connected ImageConfigs,
   * and - when autoCopyDeployments is true - with Deployments
   * with their connected Instances and InstanceConfigs.
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
        chain: true,
        images: {
          include: {
            config: true,
          },
        },
        deployments: {
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

    const increased = increaseIncrementalVersion(parentVersion, request.name, request.changelog)

    const newVersionData: Prisma.VersionCreateInput = {
      ...increased,
      createdBy: identity.id,
      images: undefined,
      deployments: undefined,
      project: {
        connect: {
          id: parentVersion.projectId,
        },
      },
    }

    const newVersion = await this.prisma.$transaction(async prisma => {
      const version = await prisma.version.create({
        data: newVersionData,
        include: {
          children: {
            select: {
              versionId: true,
            },
          },
          project: {
            select: {
              name: true,
              teamId: true,
            },
          },
        },
      })

      if (!parentVersion.chain) {
        // we need to create the chain

        await prisma.versionChain.create({
          data: {
            id: version.id,
            projectId: version.projectId,
          },
        })
      }

      // Create images
      const imageIdEntries: [string, string][] = await Promise.all(
        increased.images.map(async image => {
          const { originalId } = image
          delete image.originalId

          const createdImage = await prisma.image.create({
            data: {
              ...image,
              versionId: version.id,
              createdBy: identity.id,
              config: {
                create: this.imageMapper.dbContainerConfigToCreateImageStatement({
                  ...image.config,
                  id: undefined,
                  imageId: undefined,
                }),
              },
            },
          })

          return [originalId, createdImage.id]
        }),
      )

      // Create deployments
      const imageIdMap = new Map(imageIdEntries)
      await Promise.all(
        increased.deployments.map(async deployment => {
          const newDeployment = await prisma.deployment.create({
            data: {
              ...deployment,
              createdBy: identity.id,
              versionId: version.id,
              instances: undefined,
            },
          })

          await Promise.all(
            deployment.instances.map(async instance => {
              const { originalImageId } = instance
              delete instance.originalImageId

              const newImageId = imageIdMap.get(originalImageId)

              await prisma.instance.create({
                data: {
                  ...instance,
                  deployment: {
                    connect: {
                      id: newDeployment.id,
                    },
                  },
                  image: {
                    connect: {
                      id: newImageId,
                    },
                  },
                  config: !instance.config
                    ? undefined
                    : {
                        create: this.imageMapper.dbContainerConfigToCreateImageStatement({
                          ...instance.config,
                          id: undefined,
                          instanceId: undefined,
                        }),
                      },
                },
              })
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
      teamId: newVersion.project.teamId,
      messageType: 'version',
      message: {
        subject: newVersion.project.name,
        version: newVersion.name,
        owner: identity,
      } as VersionMessage,
    })

    return this.mapper.toDto(newVersion)
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
