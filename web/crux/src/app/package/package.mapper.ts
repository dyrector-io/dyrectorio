import { Injectable } from '@nestjs/common'
import { Deployment, Node, Package, PackageEnvironment, Project } from '@prisma/client'
import { VersionWithChains, versionChainOf } from 'src/domain/version'
import DeployMapper from '../deploy/deploy.mapper'
import NodeMapper from '../node/node.mapper'
import ProjectMapper from '../project/project.mapper'
import VersionMapper from '../version/version.mapper'
import { PackageDetailsDto, PackageDto, PackageEnvironmentDetailsDto, PackageEnvironmentDto } from './package.dto'

@Injectable()
class PackageMapper {
  constructor(
    private readonly projectMapper: ProjectMapper,
    private readonly versionMapper: VersionMapper,
    private readonly nodeMapper: NodeMapper,
    private readonly deployMapper: DeployMapper,
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
          project: this.projectMapper.toBasicDto(it.earliest.project),
        }
      }),
    }
  }

  detailsToDto(pack: PackageDetails): PackageDetailsDto {
    return {
      ...this.toDto(pack),
      environments: pack.environments.map(it => this.environmentToDto(it)),
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

  environmentDetailsToDto(env: PackageEnvironmentDetails): PackageEnvironmentDetailsDto {
    const { package: pack } = env

    return {
      id: env.id,
      name: env.name,
      package: {
        id: pack.id,
        name: pack.name,
      },
      node: this.nodeMapper.toDto(env.node),
      prefix: env.prefix,
      versionChains: pack.chains.map(chain => {
        const { earliest } = chain

        const earliestDeployment = earliest.deployments.at(0)

        return {
          chainId: earliest.id,
          project: this.projectMapper.toDto(earliest.project),
          versions: [
            {
              id: earliest.id,
              name: earliest.name,
              deployment: !earliestDeployment ? null : this.deployMapper.toBasicDto(earliestDeployment),
            },
            ...earliest.chainLinks.map(link => {
              const { child } = link

              const deployment = child.deployments.at(0)

              return {
                id: child.id,
                name: child.name,
                deployment: !deployment ? null : this.deployMapper.toBasicDto(deployment),
              }
            }),
          ],
        }
      }),
    }
  }
}

type PackageEnvironmentWithNode = PackageEnvironment & {
  node: Node
}

type VersionChainsWithDeployments = {
  child: {
    id: string
    name: string
    deployments: Deployment[]
  }
}

type VersionWithProjectAndChainsWithDeployments = {
  id: string
  name: string
  project: Project
  deployments: Deployment[]
  chainLinks: VersionChainsWithDeployments[]
}

type PackageEnvironmentDetails = PackageEnvironmentWithNode & {
  package: {
    id: string
    name: string
    chains: {
      earliest: VersionWithProjectAndChainsWithDeployments
    }[]
  }
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
