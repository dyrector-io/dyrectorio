import { Injectable } from '@nestjs/common'
import { Package, PackageEnvironment, Project, Node } from '@prisma/client'
import { VersionWithChains, versionChainOf } from 'src/domain/version'
import NodeMapper from '../node/node.mapper'
import VersionMapper from '../version/version.mapper'
import { PackageDetailsDto, PackageDto, PackageEnvironmentDto } from './package.dto'
import ProjectMapper from '../project/project.mapper'

@Injectable()
class PackageMapper {
  constructor(
    private readonly projectMapper: ProjectMapper,
    private readonly versionMapper: VersionMapper,
    private readonly nodeMapper: NodeMapper,
  ) {}

  toDto(pack: PackageWithChainsAndEnvironmentNames): PackageDto {
    return {
      id: pack.id,
      name: pack.name,
      description: pack.description,
      icon: pack.icon,
      environments: pack.environments.map(it => it.name),
      versionChains: pack.chains.map(it => {
        const chain = versionChainOf(it.earliest)

        return {
          ...this.versionMapper.chainToDto(chain),
          project: this.projectMapper.toBasicDto(it.earliest.project)
        }
      }),
    }
  }

  detailsToDto(pack: PackageDetails): PackageDetailsDto {
    return {
      ...this.toDto(pack),
      environments: pack.environments.map(it => this.environmentToDto(it))
    }
  }

  environmentToDto(env: PackageEnvironmentWithNode): PackageEnvironmentDto {
    return {
      id: env.id,
      name: env.name,
      node: this.nodeMapper.toDto(env.node),
      prefix: env.prefix,
    }
  }
}

type PackageEnvironmentWithNode = PackageEnvironment & {
  node: Node
}

type VersionWithChainsAndProject = VersionWithChains & {
  project: Project
}

type PackageChain = {
  earliest: VersionWithChainsAndProject
}

type PackageWithChainsAndEnvironmentNames = Package & {
  environments: {
    name: string
  }[]
  chains: PackageChain[]
}

type PackageDetails = Package & {
  environments: PackageEnvironmentWithNode[]
  chains: PackageChain[]
}

export default PackageMapper
