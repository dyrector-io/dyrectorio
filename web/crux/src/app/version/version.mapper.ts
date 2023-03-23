import { Version, VersionTypeEnum } from '.prisma/client'
import { Injectable } from '@nestjs/common'
import { ProductTypeEnum } from '@prisma/client'
import { versionIsDeletable, versionIsIncreasable, versionIsMutable } from 'src/domain/version'
import { VersionType, versionTypeToJSON } from 'src/grpc/protobuf/proto/crux'
import { toAuditDto } from 'src/shared/dtos/audit'
import { DeploymentStatusDto } from '../deploy/deploy.dto'
import DeployMapper, { DeploymentWithNode } from '../deploy/deploy.mapper'
import ImageMapper, { ImageDetails } from '../image/image.mapper'
import { VersionDetailsDto, VersionDto } from './version.dto'

@Injectable()
export default class VersionMapper {
  constructor(private deployMapper: DeployMapper, private imageMapper: ImageMapper) {}

  toDto(it: VersionWithChildren): VersionDto {
    return {
      id: it.id,
      audit: toAuditDto(it),
      name: it.name,
      type: it.type,
      changelog: it.changelog,
      default: it.default,
      increasable: versionIsIncreasable(it),
    }
  }

  detailsToDto(version: VersionDetails): VersionDetailsDto {
    // TODO(@m8vago): move  deployment mapping to its mapper

    return {
      id: version.id,
      name: version.name,
      changelog: version.changelog,
      default: version.default,
      audit: toAuditDto(version),
      type: version.type,
      mutable: versionIsMutable(version),
      deletable: versionIsDeletable(version),
      increasable: versionIsIncreasable(version),
      images: version.images.map(it => this.imageMapper.toDto(it)),
      deployments: version.deployments.map(it => ({
        id: it.id,
        prefix: it.prefix,
        status: DeploymentStatusDto[it.status],
        updatedAt: it.updatedAt ?? it.createdAt,
        node: {
          id: it.node.id,
          name: it.node.name,
          type: it.node.type,
        },
      })),
    }
  }

  typeToDb(type: VersionType): VersionTypeEnum {
    return versionTypeToJSON(type).toLowerCase() as VersionTypeEnum
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
