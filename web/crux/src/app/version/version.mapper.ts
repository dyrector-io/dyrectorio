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
import { Version, VersionTypeEnum, Registry } from '.prisma/client'
import DeployMapper, { DeploymentWithNode } from '../deploy/deploy.mapper'
import ImageMapper, { ImageWithConfig } from '../image/image.mapper'

@Injectable()
export default class VersionMapper {
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
      images: version.images.map(it => this.imageMapper.toGrpc(it, it.registry.name)),
      deployments: version.deployments.map(it => this.deployMapper.deploymentByVersionToGrpc(it)),
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

export type ImageWithConfigAndRegistry = ImageWithConfig & {
  registry: Registry
}

export type VersionDetails = VersionWithChildren & {
  images: ImageWithConfigAndRegistry[]
  deployments: DeploymentWithNode[]
}
