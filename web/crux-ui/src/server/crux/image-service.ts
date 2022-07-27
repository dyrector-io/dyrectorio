import { Logger } from '@app/logger'
import {
  ContainerConfig,
  ExplicitContainerConfig,
  ExplicitContainerNetworkMode,
  PatchVersionImage,
  RegistryImages,
  VersionImage,
} from '@app/models'
import {
  AddImagesToVersionRequest,
  ContainerConfig as ProtoContainerConfig,
  CruxImageClient,
  Empty,
  ExplicitContainerConfig as ProtoExplicitContainerConfig,
  ExplicitContainerConfig_NetworkMode as ProtoNetworkMode,
  explicitContainerConfig_NetworkModeFromJSON,
  explicitContainerConfig_NetworkModeToJSON,
  IdRequest,
  ImageListResponse,
  ImageResponse,
  OrderVersionImagesRequest,
  PatchImageRequest,
} from '@app/models/grpc/protobuf/proto/crux'
import { Identity } from '@ory/kratos-client'
import { protomisify } from '@server/crux/grpc-connection'

class DyoImageService {
  private logger = new Logger(DyoImageService.name)

  constructor(private client: CruxImageClient, private identity: Identity) {}

  async getAllByVersionId(verisonId: string): Promise<VersionImage[]> {
    const req: IdRequest = {
      id: verisonId,
      accessedBy: this.identity.id,
    }

    const images = await protomisify<IdRequest, ImageListResponse>(this.client, this.client.getImagesByVersionId)(
      IdRequest,
      req,
    )

    return images.data.map(it => imageToDto(it))
  }

  async getById(id: string): Promise<VersionImage> {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    const image = await protomisify<IdRequest, ImageResponse>(this.client, this.client.getImageDetails)(IdRequest, req)

    return imageToDto(image)
  }

  async addImagesToVersion(versionId: string, registryImages: RegistryImages[]): Promise<VersionImage[]> {
    const req: AddImagesToVersionRequest = {
      versionId,
      images: registryImages.map(it => {
        return {
          registryId: it.registryId,
          imageNames: it.images,
        }
      }),
      accessedBy: this.identity.id,
    }

    const res = await protomisify<AddImagesToVersionRequest, ImageListResponse>(
      this.client,
      this.client.addImagesToVersion,
    )(AddImagesToVersionRequest, req)

    return res.data.map(it => imageToDto(it))
  }

  async orderImages(versionId: string, imageIds: string[]) {
    const req: OrderVersionImagesRequest = {
      versionId,
      imageIds,
      accessedBy: this.identity.id,
    }

    await protomisify<OrderVersionImagesRequest, Empty>(this.client, this.client.orderImages)(
      OrderVersionImagesRequest,
      req,
    )
  }

  async patchImage(id: string, image: PatchVersionImage) {
    const req = {
      ...image,
      accessedBy: this.identity.id,
      id,
      config: !image.config
        ? null
        : {
            config: explicitContainerConfigToProto(image.config?.config),
            name: image.config?.name,
            capabilities: !image.config?.capabilities
              ? undefined
              : {
                  data: image.config.capabilities,
                },
            environment: !image.config?.environment
              ? undefined
              : {
                  data: image.config.environment,
                },
          },
    } as PatchImageRequest

    await protomisify<PatchImageRequest, Empty>(this.client, this.client.patchImage)(PatchImageRequest, req)
  }

  async deleteImage(id: string) {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteImage)(IdRequest, req)
  }
}

export default DyoImageService

export const networkModeToDto = (networkMode?: ProtoNetworkMode): ExplicitContainerNetworkMode =>
  !networkMode
    ? 'none'
    : (explicitContainerConfig_NetworkModeToJSON(networkMode).toLocaleLowerCase() as ExplicitContainerNetworkMode)

export const networkModeToProto = (networkMode?: ExplicitContainerNetworkMode): ProtoNetworkMode =>
  !networkMode ? undefined : explicitContainerConfig_NetworkModeFromJSON(networkMode.toUpperCase())

export const explicitContainerConfigToDto = (config?: ProtoExplicitContainerConfig): ExplicitContainerConfig => {
  return !config
    ? null
    : {
        ...config,
        networkMode: networkModeToDto(config.networkMode),
      }
}

export const explicitContainerConfigToProto = (config?: ExplicitContainerConfig): ProtoExplicitContainerConfig => {
  return !config
    ? undefined
    : {
        user: config?.user ?? undefined,
        expose: config?.expose ?? undefined,
        mounts: config?.mounts ?? [],
        ports: config?.ports ?? [],
        networkMode: networkModeToProto(config.networkMode),
      }
}

export const containerConfigToDto = (config?: ProtoContainerConfig): ContainerConfig => {
  return !config
    ? null
    : {
        ...config,
        config: explicitContainerConfigToDto(config.config),
      }
}

export const imageToDto = (image: ImageResponse): VersionImage => {
  return {
    ...image,
    config: containerConfigToDto(image.config),
  }
}
