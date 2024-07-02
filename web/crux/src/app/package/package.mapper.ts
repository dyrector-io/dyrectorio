import { Injectable } from '@nestjs/common'
import { Deployment, Node, Package, PackageEnvironment, Project } from '@prisma/client'
import { VersionWithName } from 'src/domain/version'
import { VersionChainWithMembers, versionChainMembersOf } from 'src/domain/version-chain'
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
        const chain = versionChainMembersOf(it.chain)

        return {
          ...this.versionMapper.chainToDto(chain),
          project: this.projectMapper.toBasicDto(it.chain.project),
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
      versionChains: pack.chains.map(packageChain => {
        const { chain } = packageChain

        return {
          chainId: chain.id,
          project: this.projectMapper.toDto(chain.project),
          versions: chain.members.map(it => {
            const deployment = it.deployments.at(0)

            return {
              id: it.id,
              name: it.name,
              deployment: !deployment ? null : this.deployMapper.toBasicDto(deployment),
            }
          }),
        }
      }),
    }
  }
}

type PackageEnvironmentWithNode = PackageEnvironment & {
  node: Node
}

type BasicVersionWithDeployments = VersionWithName & {
  deployments: Deployment[]
}

type VersionChainDetails = {
  id: string
  project: Project
  members: BasicVersionWithDeployments[]
}

type PackageEnvironmentVersionChain = {
  chain: VersionChainDetails
}

type PackageEnvironmentDetails = PackageEnvironmentWithNode & {
  package: {
    id: string
    name: string
    chains: PackageEnvironmentVersionChain[]
  }
}

type VersionChainWithMembersAndProject = VersionChainWithMembers & {
  project: Project
}

type PackageChain = {
  chain: VersionChainWithMembersAndProject
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
