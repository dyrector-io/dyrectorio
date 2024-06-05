import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { DeploymentStatusEnum } from '@prisma/client'
import { VersionWithDeployments } from 'src/domain/version'
import { ImageWithConfig, copyDeployment } from 'src/domain/version-increase'
import PrismaService from 'src/services/prisma.service'
import { DeploymentDto } from '../deploy/deploy.dto'
import DeployMapper from '../deploy/deploy.mapper'
import ImageMapper from '../image/image.mapper'
import TeamRepository from '../team/team.repository'
import {
  CreatePackageDeploymentDto,
  CreatePackageDto,
  CreatePackageEnvironmentDto,
  PackageDetailsDto,
  PackageDto,
  PackageEnvironmentDetailsDto,
  PackageEnvironmentDto,
  UpdatePackageDto,
  UpdatePackageEnvironmentDto,
} from './package.dto'
import PackageMapper from './package.mapper'

@Injectable()
class PackageService {
  constructor(
    private readonly mapper: PackageMapper,
    private readonly deployMapper: DeployMapper,
    private readonly imageMapper: ImageMapper,
    private readonly teamRepository: TeamRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getPackages(teamSlug: string): Promise<PackageDto[]> {
    const teamId = await this.teamRepository.getTeamIdBySlug(teamSlug)

    const packages = await this.prisma.package.findMany({
      where: {
        teamId,
      },
      include: {
        environments: {
          select: {
            name: true,
          },
        },
        chains: PackageService.packageChainQuery,
      },
    })

    return packages.map(it => this.mapper.toDto(it))
  }

  async getPackageById(id: string): Promise<PackageDetailsDto> {
    const pack = await this.prisma.package.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        environments: {
          include: {
            node: true,
          },
        },
        chains: PackageService.packageChainQuery,
      },
    })

    return this.mapper.detailsToDto(pack)
  }

  async createPackage(teamSlug: string, req: CreatePackageDto, identity: Identity): Promise<PackageDto> {
    const teamId = await this.teamRepository.getTeamIdBySlug(teamSlug)

    const pack = await this.prisma.package.create({
      data: {
        name: req.name,
        description: req.description,
        icon: req.icon,
        chains: {
          createMany: {
            data: req.chainIds.map(it => ({
              versionId: it,
            })),
          },
        },
        createdBy: identity.id,
        teamId,
      },
      include: {
        environments: {
          select: {
            name: true,
          },
        },
        chains: PackageService.packageChainQuery,
      },
    })

    return this.mapper.toDto(pack)
  }

  async updatePackage(id: string, req: UpdatePackageDto, identity: Identity): Promise<void> {
    await this.prisma.package.update({
      where: {
        id,
      },
      data: {
        name: req.name,
        description: req.description,
        icon: req.icon,
        chains: {
          deleteMany: {
            packageId: id,
            versionId: {
              notIn: req.chainIds,
            },
          },
          connectOrCreate: req.chainIds.map(chainId => ({
            where: {
              versionId_packageId: {
                packageId: id,
                versionId: chainId,
              },
            },
            create: {
              versionId: chainId,
            },
          })),
        },
        updatedBy: identity.id,
        updatedAt: new Date(),
      },
    })
  }

  async deletePackage(id: string): Promise<void> {
    await this.prisma.package.delete({
      where: {
        id,
      },
    })
  }

  async getEnvironmentById(environmentId: string): Promise<PackageEnvironmentDetailsDto> {
    const env = await this.prisma.packageEnvironment.findUniqueOrThrow({
      where: {
        id: environmentId,
      },
      include: {
        node: true,
      },
    })

    const pack = await this.prisma.package.findUniqueOrThrow({
      where: {
        id: env.packageId,
      },
      select: {
        id: true,
        name: true,
        chains: {
          select: {
            earliest: {
              include: {
                project: true,
                deployments: {
                  where: {
                    nodeId: env.nodeId,
                    prefix: env.prefix,
                  },
                },
                chainLinks: {
                  include: {
                    child: {
                      include: {
                        deployments: {
                          where: {
                            nodeId: env.nodeId,
                            prefix: env.prefix,
                          },
                          orderBy: {
                            updatedAt: 'desc',
                          },
                          take: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    return this.mapper.environmentDetailsToDto({
      ...env,
      package: pack,
    })
  }

  async createEnvironment(
    packageId: string,
    req: CreatePackageEnvironmentDto,
    identity: Identity,
  ): Promise<PackageEnvironmentDto> {
    const env = await this.prisma.packageEnvironment.create({
      data: {
        packageId,
        name: req.name,
        nodeId: req.nodeId,
        prefix: req.prefix,
      },
      include: {
        node: true,
      },
    })

    await this.prisma.package.update({
      where: {
        id: packageId,
      },
      data: {
        updatedAt: new Date(),
        updatedBy: identity.id,
      },
    })

    return this.mapper.environmentToDto(env)
  }

  async updateEnviornment(
    packageId: string,
    environmentId: string,
    req: UpdatePackageEnvironmentDto,
    identity: Identity,
  ) {
    await this.prisma.package.update({
      where: {
        id: packageId,
      },
      data: {
        updatedAt: new Date(),
        updatedBy: identity.id,
        environments: {
          update: {
            where: {
              id: environmentId,
            },
            data: {
              name: req.name,
              nodeId: req.nodeId,
              prefix: req.prefix,
            },
          },
        },
      },
    })
  }

  async deleteEnvironment(packageId: string, environmentId: string, identity: Identity) {
    await this.prisma.package.update({
      where: {
        id: packageId,
      },
      data: {
        updatedAt: new Date(),
        updatedBy: identity.id,
        environments: {
          delete: {
            id: environmentId,
          },
        },
      },
    })
  }

  private static packageChainQuery = {
    select: {
      earliest: {
        select: {
          id: true,
          name: true,
          project: true,
          chainLinks: {
            select: {
              child: {
                select: {
                  id: true,
                  name: true,
                  _count: {
                    select: {
                      children: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }

  async createPackageDeployment(
    environmentId: string,
    req: CreatePackageDeploymentDto,
    identity: Identity,
  ): Promise<DeploymentDto> {
    const target = await this.prisma.version.findUniqueOrThrow({
      where: {
        id: req.versionId,
      },
      include: {
        images: {
          select: {
            id: true,
          },
        },
      },
    })

    const env = await this.prisma.packageEnvironment.findUniqueOrThrow({
      where: {
        id: environmentId,
      },
    })

    const packageChain = await this.prisma.versionChainsOnPackage.findFirst({
      where: {
        packageId: env.packageId,
        earliest: {
          OR: [
            {
              id: req.versionId,
            },
            {
              chainLinks: {
                some: {
                  versionId: req.versionId,
                },
              },
            },
          ],
        },
      },
      select: {
        earliest: {
          include: {
            deployments: {
              where: {
                nodeId: env.nodeId,
                prefix: env.prefix,
              },
            },
            chainLinks: {
              select: {
                child: {
                  include: {
                    deployments: {
                      where: {
                        nodeId: env.nodeId,
                        prefix: env.prefix,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    const versions: VersionWithDeployments[] = [
      packageChain.earliest,
      ...packageChain.earliest.chainLinks.map(it => it.child),
    ]

    const sourceIndex = versions.findIndex(it => it.id === req.versionId)
    let source = versions[sourceIndex]

    if (source.deployments.length < 1) {
      // look for the nearest parent within deployments

      for (let i = sourceIndex - 1; i > -1; i--) {
        const current = versions[i]
        if (current.deployments.length > 0) {
          source = current
          break
        }
      }
    }

    const sourceVersion = await this.prisma.version.findUniqueOrThrow({
      where: {
        id: source.id,
      },
      include: {
        images: {
          include: {
            config: true,
          },
        },
        deployments: {
          where: {
            AND: [
              {
                nodeId: env.nodeId,
                prefix: env.prefix,
              },
              {
                status: {
                  in: [
                    DeploymentStatusEnum.successful,
                    DeploymentStatusEnum.failed,
                    DeploymentStatusEnum.preparing,
                    DeploymentStatusEnum.inProgress,
                  ],
                },
              },
            ],
          },
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

    if (sourceVersion.deployments.length < 1) {
      // create a new empty deployment

      const deployment = await this.prisma.deployment.create({
        data: {
          nodeId: env.nodeId,
          prefix: env.prefix,
          versionId: target.id,
          status: DeploymentStatusEnum.preparing,
          createdBy: identity.id,
          instances: {
            createMany: {
              data: sourceVersion.images.map(it => ({
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

      return this.deployMapper.toDto(deployment)
    }

    // copy deployment from target

    const sourceDeployment =
      sourceVersion.deployments.find(it => it.status === 'successful') ??
      sourceVersion.deployments.find(it => it.status === 'preparing') ??
      sourceVersion.deployments.find(it => it.status === 'failed') ??
      sourceVersion.deployments.at(0)

    const copiedDeployment = copyDeployment(sourceDeployment)

    const newDeployment = await this.prisma.deployment.create({
      data: {
        ...copiedDeployment,
        createdBy: identity.id,
        versionId: target.id,
        instances: undefined,
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

    const originalImageIds = copiedDeployment.instances.map(it => it.originalImageId)
    const originalImages = sourceVersion.images.filter(it => originalImageIds.includes(it.id))
    const originalImagesById = new Map(originalImages.map(it => [it.id, it]))

    const findCopiedInstance = (newImage: ImageWithConfig) => {
      const matchingInstances = copiedDeployment.instances.filter(instance => {
        const original = originalImagesById.get(instance.originalImageId)
        if (!original) {
          return false
        }

        return newImage.registryId === original.registryId && newImage.name === original.name
      })

      if (matchingInstances.length < 1) {
        return null
      }

      if (matchingInstances.length === 1) {
        return matchingInstances[0]
      }

      // multiple candidates

      const matchingByContainerName = matchingInstances.find(instance => {
        const original = originalImagesById.get(instance.originalImageId)

        return original.config.name === newImage.config.name || instance.config?.name === newImage.config.name
      })

      if (!matchingByContainerName) {
        // no distinct instance found
        return null
      }

      return matchingByContainerName
    }

    await Promise.all(
      sourceVersion.images.map(async image => {
        const instance = findCopiedInstance(image)
        if (!instance) {
          await this.prisma.instance.create({
            data: {
              deploymentId: newDeployment.id,
              imageId: image.id,
            },
          })
        }

        delete instance.originalImageId

        await this.prisma.instance.create({
          data: {
            ...instance,
            deployment: {
              connect: {
                id: newDeployment.id,
              },
            },
            image: {
              connect: {
                id: image.id,
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

    return this.deployMapper.toDto(newDeployment)
  }
}

export default PackageService
