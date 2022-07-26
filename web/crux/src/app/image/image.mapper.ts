import { Injectable } from '@nestjs/common'
import { ContainerConfig, Image } from '@prisma/client'
import { JsonObject } from 'prisma'
import {
  ContainerConfig as ProtoContainerConfig,
  ExplicitContainerConfig,
  ExplicitContainerConfig_Expose,
  ExplicitContainerConfig_NetworkMode,
  explicitContainerConfig_NetworkModeFromJSON,
  explicitContainerConfig_NetworkModeToJSON,
  ExplicitContainerConfig_Port,
  ImageResponse,
} from 'src/grpc/protobuf/proto/crux'
import {
  ExplicitContainerConfigData,
  ExplicitContainerConfigPort,
  ExplicitContainerNetworkMode,
  UniqueKeyValue,
} from 'src/shared/model'

@Injectable()
export class ImageMapper {
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
      config: this.explicitConfigToGrpc(config.config as JsonObject),
    }
  }

  explicitConfigToGrpc(config?: ExplicitContainerConfigData): ExplicitContainerConfig {
    return {
      ...config,
      networkMode: this.explicitConfigNetworkModeToGrpc(config?.networkMode),
    }
  }

  explicitConfigToDb(config?: ExplicitContainerConfig): ExplicitContainerConfigData {
    return {
      ...config,
      networkMode: this.explicitConfigNetworkModeToDb(config?.networkMode),
    }
  }

  explicitConfigPortToDb(port: ExplicitContainerConfig_Port): ExplicitContainerConfigPort {
    return port
  }

  explicitConfigNetworkModeToDb(networkMode?: ExplicitContainerConfig_NetworkMode): ExplicitContainerNetworkMode {
    return !networkMode
      ? 'none'
      : (explicitContainerConfig_NetworkModeToJSON(networkMode).toLocaleLowerCase() as ExplicitContainerNetworkMode)
  }

  explicitConfigNetworkModeToGrpc(networkMode?: ExplicitContainerNetworkMode): ExplicitContainerConfig_NetworkMode {
    return !networkMode ? null : explicitContainerConfig_NetworkModeFromJSON(networkMode?.toUpperCase())
  }

  explicitConfigExposeToDb(expose: ExplicitContainerConfig_Expose) {
    return {
      ...expose,
    }
  }
}

export type ImageWithConfig = Image & {
  config: ContainerConfig
}
