import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { ContainerConfig, DeploymentStatusEnum } from '@prisma/client'
import { containerNameOfImage } from 'src/domain/container'
import { ImageWithConfig, copyDeployment } from 'src/domain/version-increase'
import PrismaService from 'src/services/prisma.service'
import ContainerMapper from '../container/container.mapper'
import { DeploymentDto } from '../deploy/deploy.dto'
import DeployMapper from '../deploy/deploy.mapper'
import DeployService from '../deploy/deploy.service'
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
    private readonly containerMapper: ContainerMapper,
    private readonly teamRepository: TeamRepository,
    private readonly deployService: DeployService,
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
        chains: PackageService.packageChainsQuery,
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
        chains: PackageService.packageChainsQuery,
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
              chainId: it,
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
        chains: PackageService.packageChainsQuery,
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
            chainId: {
              notIn: req.chainIds,
            },
          },
          connectOrCreate: req.chainIds.map(chainId => ({
            where: {
              chainId_packageId: {
                packageId: id,
                chainId,
              },
            },
            create: {
              chainId,
            },
          })),
        },
        updatedBy: identity.id,
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
            chain: {
              include: {
                project: true,
                members: {
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
        updatedBy: identity.id,
        environments: {
          delete: {
            id: environmentId,
          },
        },
      },
    })
  }

  async createPackageDeployment(
    environmentId: string,
    req: CreatePackageDeploymentDto,
    identity: Identity,
  ): Promise<DeploymentDto> {
    const targetVersion = await this.prisma.version.findUniqueOrThrow({
      where: {
        id: req.versionId,
      },
      include: {
        images: {
          include: {
            config: true,
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
        chain: {
          members: {
            some: {
              id: req.versionId,
            },
          },
        },
      },
      select: {
        chain: {
          select: {
            members: {
              include: {
                parent: {
                  select: {
                    parentVersionId: true,
                  },
                },
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
    })

    const versions = packageChain.chain.members
    const versionsById = new Map(versions.map(it => [it.id, it]))

    let sourceVersion = versionsById.get(req.versionId)
    const findSourceParent = () => {
      const parentId = sourceVersion.parent?.parentVersionId
      if (!parentId) {
        return null
      }

      return versionsById.get(parentId) ?? null
    }

    // find the latest version with deployments for the prefix
    sourceVersion = findSourceParent()
    while (sourceVersion && sourceVersion.deployments.length < 1) {
      sourceVersion = findSourceParent()
    }

    const sourceVersionId = sourceVersion?.id ?? targetVersion.id

    const source = await this.prisma.version.findUniqueOrThrow({
      where: {
        id: sourceVersionId,
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
            config: true,
            instances: {
              include: {
                config: true,
              },
            },
            configBundles: {
              select: {
                configBundleId: true,
              },
            },
          },
        },
      },
    })

    if (source.deployments.length < 1) {
      // no existing deployment
      return this.deployService.createDeployment(
        {
          nodeId: env.nodeId,
          prefix: env.prefix,
          protected: false,
          versionId: targetVersion.id,
        },
        identity,
      )
    }

    // copy deployment from source
    // find the most suitable deployment
    const sourceDeployment =
      source.deployments.find(it => it.status === 'successful') ??
      source.deployments.find(it => it.status === 'preparing') ??
      source.deployments.find(it => it.status === 'failed') ??
      source.deployments.at(0)

    const copiedDeployment = copyDeployment(sourceDeployment)
    const deploymentData = this.deployMapper.copiedDeploymentToCreateDeploymentStatement(copiedDeployment)

    const findSourceImageFor = (image: ImageWithConfig): ImageWithConfig | null => {
      const targetName = containerNameOfImage(image)

      return (
        source.images.find(sourceImage => {
          const sourceName = containerNameOfImage(sourceImage)
          return sourceName === targetName
        }) ?? null
      )
    }

    const instanceConfigBySourceImageId = new Map(copiedDeployment.instances.map(it => [it.originalImageId, it.config]))

    const instanceConfigs: [string, Omit<ContainerConfig, 'id'>][] = targetVersion.images.map(image => {
      const sourceImage = findSourceImageFor(image)
      if (!sourceImage) {
        return [image.id, null]
      }

      const config = instanceConfigBySourceImageId.get(sourceImage.id)
      if (!config) {
        return [image.id, null]
      }

      return [image.id, config]
    })

    const newDeployment = await this.prisma.$transaction(async prisma => {
      const deployment = await prisma.deployment.create({
        data: {
          ...deploymentData,
          createdBy: identity.id,
          version: {
            connect: {
              id: targetVersion.id,
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
          configBundles: {
            createMany: {
              data: copiedDeployment.configBundles,
            },
          },
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

      await Promise.all(
        instanceConfigs.map(async entry => {
          const [targetImageId, instanceConf] = entry

          return await prisma.instance.create({
            data: {
              deployment: { connect: { id: deployment.id } },
              image: { connect: { id: targetImageId } },
              config: {
                create: !instanceConf
                  ? { type: 'instance' }
                  : {
                      ...this.containerMapper.dbConfigToCreateConfigStatement(instanceConf),
                      type: 'instance',
                    },
              },
            },
          })
        }),
      )

      return deployment
    })

    return this.deployMapper.toDto(newDeployment)
  }

  private static packageChainsQuery = {
    select: {
      chain: {
        select: {
          id: true,
          project: true,
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
      },
    },
  }
}

export default PackageService
