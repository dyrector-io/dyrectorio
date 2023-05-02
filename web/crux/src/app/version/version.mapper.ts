import { Version } from '.prisma/client'
import { Injectable } from '@nestjs/common'
import { ProductTypeEnum } from '@prisma/client'
import { versionIsDeletable, versionIsIncreasable, versionIsMutable } from 'src/domain/version'
import { DeploymentWithNode } from '../deploy/deploy.dto'
import DeployMapper from '../deploy/deploy.mapper'
import ImageMapper, { ImageDetails } from '../image/image.mapper'
import { NodeConnectionStatus } from '../shared/shared.dto'
import SharedMapper from '../shared/shared.mapper'
import { VersionDetailsDto, VersionDto } from './version.dto'

@Injectable()
export default class VersionMapper {
  constructor(
    private sharedMapper: SharedMapper,
    private deployMapper: DeployMapper,
    private imageMapper: ImageMapper,
  ) {}

  toDto(it: VersionWithChildren): VersionDto {
    return {
      id: it.id,
      audit: this.sharedMapper.auditToDto(it),
      name: it.name,
      type: it.type,
      changelog: it.changelog,
      default: it.default,
      increasable: versionIsIncreasable(it),
    }
  }

  detailsToDto(version: VersionDetails, nodeStatusLookup: Map<string, NodeConnectionStatus>): VersionDetailsDto {
    return {
      id: version.id,
      name: version.name,
      changelog: version.changelog,
      default: version.default,
      audit: this.sharedMapper.auditToDto(version),
      type: version.type,
      mutable: versionIsMutable(version),
      deletable: versionIsDeletable(version),
      increasable: versionIsIncreasable(version),
      images: version.images.map(it => this.imageMapper.toDto(it)),
      deployments: version.deployments.map(it =>
        this.deployMapper.toDeploymentWithBasicNodeDto(it, nodeStatusLookup.get(it.nodeId)),
      ),
    }
  }
}

export type VersionWithChildren = Version & {
  children: { versionId: string }[]
}

export type VersionDetails = VersionWithChildren & {
  product: {
    type: ProductTypeEnum
  }
  images: ImageDetails[]
  deployments: DeploymentWithNode[]
}
