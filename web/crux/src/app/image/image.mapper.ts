import { Injectable } from '@nestjs/common'
import { ContainerConfig, Image } from '@prisma/client'
import { JsonObject } from 'prisma'
import { ContainerConfig as ProtoContainerConfig, ImageResponse } from 'src/grpc/protobuf/proto/crux'
import { UniqueKeyValue } from 'src/shared/model'

@Injectable()
export default class ImageMapper {
  toGrpc(image: ImageWithConfig): ImageResponse {
    return {
      ...image,
      config: this.configToGrpc(image.config),
    }
  }

  configToGrpc(config: ContainerConfig): ProtoContainerConfig {
    return {
      name: config.name,
      capabilities: config.capabilities as UniqueKeyValue[],
      environment: config.environment as UniqueKeyValue[],
      config: config.config as JsonObject,
    }
  }
}

export type ImageWithConfig = Image & {
  config: ContainerConfig
}
