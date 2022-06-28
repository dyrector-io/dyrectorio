import { Version, VersionTypeEnum } from '.prisma/client'
import { Injectable } from '@nestjs/common'
import { versionIsIncreasable, versionIsMutable } from 'src/domain/version'
import {
  AuditResponse,
  VersionDetailsResponse,
  VersionResponse,
  VersionType,
  versionTypeFromJSON,
  versionTypeToJSON,
} from 'src/grpc/protobuf/proto/crux'
import { DeployMapper, DeploymentWithNode } from '../deploy/deploy.mapper'
import { ImageMapper, ImageWithConfig } from '../image/image.mapper'

@Injectable()
export class VersionMapper {
  constructor(private deployMapper: DeployMapper, private imageMapper: ImageMapper) {}

  toGrpc(version: VersionWithChildren): VersionResponse {
    return {
      ...version,
      audit: AuditResponse.fromJSON(version),
      type: this.typeToGrpc(version.type),
      increasable: versionIsIncreasable(version),
    }
  }

  detailsToGrpc(version: VersionDetails): VersionDetailsResponse {
    return {
      ...version,
      audit: AuditResponse.fromJSON(version),
      type: this.typeToGrpc(version.type),
      mutable: versionIsMutable(version),
      increasable: versionIsIncreasable(version),
      images: version.images.map(it => this.imageMapper.toGrpc(it)),
      deployments: version.deployments.map(it => this.deployMapper.toGrpc(it)),
    }
  }

  typeToGrpc(type: VersionTypeEnum): VersionType {
    return versionTypeFromJSON(type.toUpperCase())
  }

  typeToDb(type: VersionType): VersionTypeEnum {
    return versionTypeToJSON(type).toLowerCase() as VersionTypeEnum
  }
}

export type VersionWithChildren = Version & {
  children: { versionId: string }[]
}

export type VersionDetails = VersionWithChildren & {
  images: ImageWithConfig[]
  deployments: DeploymentWithNode[]
}
