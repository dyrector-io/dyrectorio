import { Logger } from '@app/logger'
import { PatchVersionImage, RegistryImages, VersionImage } from '@app/models'
import {
  AddImagesToVersionRequest,
  CruxImageClient,
  Empty,
  IdRequest,
  ImageListResponse,
  ImageResponse,
  OrderVersionImagesRequest,
  PatchImageRequest,
} from '@app/models/grpc/protobuf/proto/crux'
import { Identity } from '@ory/kratos-client'
import { protomisify } from '@server/crux/grpc-connection'
import { ContainerConfigToProto, imageToDto } from './mappers/image-mappers'

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
      images: registryImages.map(it => ({
        registryId: it.registryId,
        imageNames: it.images,
      })),
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
    console.log('HETE')
    const req = {
      ...image,
      accessedBy: this.identity.id,
      id,
      config: ContainerConfigToProto(image.config),
    } as PatchImageRequest
    console.log('TEHE' + JSON.stringify(req))

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
