import { Injectable } from '@nestjs/common'
import { ContainerConfig, Image, Registry } from '@prisma/client'
import { JsonObject } from 'prisma'
import { toTimestamp } from 'src/domain/utils'
import { ContainerConfig as ProtoContainerConfig, ImageResponse } from 'src/grpc/protobuf/proto/crux'
import { UniqueKeyValue } from 'src/shared/model'

@Injectable()
export default class ImageMapper {
  toGrpc(image: ImageDetails): ImageResponse {
    return {
      ...image,
      registryName: image.registry.name,
      config: this.configToGrpc(image.config),
      createdAt: toTimestamp(image.createdAt),
    }
  }

  configToGrpc(config: ContainerConfig): ProtoContainerConfig {
    return {
      name: config.name,
      capabilities: config.capabilities as UniqueKeyValue[],
      environment: config.environment as UniqueKeyValue[],
      config: config.config as JsonObject,
      secrets: config.secrets as UniqueKeyValue[],
    }
  }
}

export type ImageDetails = Image & {
  config: ContainerConfig
  registry: Registry
}
