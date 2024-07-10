import { Version } from '.prisma/client'
import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { ProjectTypeEnum } from '@prisma/client'
import { versionIsDeletable, versionIsIncreasable, versionIsMutable } from 'src/domain/version'
import { VersionChainWithEdges } from 'src/domain/version-chain'
import { BasicProperties } from '../../shared/dtos/shared.dto'
import AuditMapper from '../audit/audit.mapper'
import { DeploymentWithNode } from '../deploy/deploy.dto'
import DeployMapper from '../deploy/deploy.mapper'
import ImageMapper, { ImageDetails } from '../image/image.mapper'
import { NodeConnectionStatus } from '../node/node.dto'
import { BasicVersionDto, VersionChainDto, VersionDetailsDto, VersionDto } from './version.dto'

@Injectable()
export default class VersionMapper {
  constructor(
    @Inject(forwardRef(() => DeployMapper))
    private deployMapper: DeployMapper,
    private imageMapper: ImageMapper,
    private auditMapper: AuditMapper,
  ) {}

  toDto(it: VersionWithChildren): VersionDto {
    return {
      id: it.id,
      audit: this.auditMapper.toDto(it),
      name: it.name,
      type: it.type,
      changelog: it.changelog,
      default: it.default,
      increasable: versionIsIncreasable(it),
    }
  }

  toBasicDto(it: Pick<Version, BasicProperties>): BasicVersionDto {
    return {
      id: it.id,
      name: it.name,
      type: it.type,
    }
  }

  detailsToDto(version: VersionDetails, nodeStatusLookup: Map<string, NodeConnectionStatus>): VersionDetailsDto {
    return {
      id: version.id,
      name: version.name,
      changelog: version.changelog,
      default: version.default,
      audit: this.auditMapper.toDto(version),
      type: version.type,
      mutable: versionIsMutable(version),
      deletable: versionIsDeletable(version),
      increasable: versionIsIncreasable(version),
      autoCopyDeployments: version.autoCopyDeployments,
      images: version.images.map(it => this.imageMapper.toDto(it)),
      deployments: version.deployments.map(it =>
        this.deployMapper.toDeploymentWithBasicNodeDto(it, nodeStatusLookup.get(it.nodeId)),
      ),
    }
  }

  chainToDto(chain: VersionChainWithEdges): VersionChainDto {
    return {
      id: chain.id,
      earliest: {
        ...chain.earliest,
        type: 'incremental',
      },
      latest: {
        ...chain.latest,
        type: 'incremental',
      },
    }
  }
}

export type VersionWithChildren = Version & {
  children: { versionId: string }[]
}

export type VersionDetails = VersionWithChildren & {
  project: {
    type: ProjectTypeEnum
  }
  images: ImageDetails[]
  deployments: DeploymentWithNode[]
}
