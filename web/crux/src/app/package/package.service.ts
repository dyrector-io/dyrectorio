import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import PrismaService from 'src/services/prisma.service'
import TeamRepository from '../team/team.repository'
import {
  CreatePackageDto,
  CreatePackageEnvironmentDto,
  PackageDetailsDto,
  PackageDto,
  PackageEnvironmentDto,
  UpdatePackageDto,
  UpdatePackageEnvironmentDto,
} from './package.dto'
import PackageMapper from './package.mapper'

@Injectable()
class PackageService {
  constructor(
    private readonly mapper: PackageMapper,
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
    const pack = await this.prisma.package.findUnique({
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
          // deleteMany: {
          //   packageId: id,
          //   versionId: {
          //     notIn: req.chainIds,
          //   },
          // },
          set: req.chainIds.map(it => ({
            versionId_packageId: {
              packageId: id,
              versionId: it,
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
}

export default PackageService
