import { Injectable } from '@nestjs/common'
import { versionIsDeletable, versionIsIncreasable, versionIsMutable } from 'src/domain/version'
import {
  AuditResponse,
  VersionDetailsResponse,
  VersionResponse,
  VersionType,
  versionTypeToJSON,
} from 'src/grpc/protobuf/proto/crux'
import { versionTypeToProto } from 'src/shared/mapper'
import { Version, VersionTypeEnum } from '.prisma/client'
import DeployMapper, { DeploymentWithNode } from '../deploy/deploy.mapper'
import ImageMapper, { ImageDetails } from '../image/image.mapper'
import { VersionDto } from './version.dto'

@Injectable()
export default class VersionMapper {
  constructor(private deployMapper: DeployMapper, private imageMapper: ImageMapper) {}

  listItemToDto(version: VersionWithChildren): VersionDto {
    return {
      ...version,
      type: VersionType[version.type],
      increasable: versionIsIncreasable(version),
    }
  }

  listItemToProto(version: VersionWithChildren): VersionResponse {
    return {
      ...version,
      audit: AuditResponse.fromJSON(version),
      type: versionTypeToProto(version.type),
      increasable: versionIsIncreasable(version),
    }
  }

  detailsToProto(version: VersionDetails): VersionDetailsResponse {
    return {
      ...version,
      audit: AuditResponse.fromJSON(version),
      type: versionTypeToProto(version.type),
      mutable: versionIsMutable(version),
      deletable: versionIsDeletable(version),
      increasable: versionIsIncreasable(version),
      images: version.images.map(it => this.imageMapper.detailsToProto(it)),
      deployments: version.deployments.map(it => this.deployMapper.deploymentByVersionToProto(it)),
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
  images: ImageDetails[]
  deployments: DeploymentWithNode[]
}
