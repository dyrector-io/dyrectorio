import { Logger } from '@app/logger'
import { PatchVersionImage, RegistryImages, VersionImage } from '@app/models'
import { Empty } from '@app/models/grpc/protobuf/proto/common'
import {
  AddImagesToVersionRequest,
  CruxImageClient,
  IdRequest,
  ImageListResponse,
  ImageResponse,
  OrderVersionImagesRequest,
  PatchImageRequest,
} from '@app/models/grpc/protobuf/proto/crux'
import { protomisify } from '@server/crux/grpc-connection'
import { containerConfigToProto, imageToDto } from './mappers/image-mappers'

class DyoImageService {
  private logger = new Logger(DyoImageService.name)

  constructor(private client: CruxImageClient, private cookie: string) {}

  async getAllByVersionId(verisonId: string): Promise<VersionImage[]> {
    const req: IdRequest = {
      id: verisonId,
    }

    const images = await protomisify<IdRequest, ImageListResponse>(
      this.client,
      this.client.getImagesByVersionId,
      this.cookie,
    )(IdRequest, req)

    return images.data.map(it => imageToDto(it))
  }

  async getById(id: string): Promise<VersionImage> {
    const req: IdRequest = {
      id,
    }

    const image = await protomisify<IdRequest, ImageResponse>(
      this.client,
      this.client.getImageDetails,
      this.cookie,
    )(IdRequest, req)

    return imageToDto(image)
  }

  async addImagesToVersion(versionId: string, registryImages: RegistryImages[]): Promise<VersionImage[]> {
    const req: AddImagesToVersionRequest = {
      versionId,
      images: registryImages.map(it => ({
        registryId: it.registryId,
        imageNames: it.images,
      })),
    }

    const res = await protomisify<AddImagesToVersionRequest, ImageListResponse>(
      this.client,
      this.client.addImagesToVersion,
      this.cookie,
    )(AddImagesToVersionRequest, req)

    return res.data.map(it => imageToDto(it))
  }

  async orderImages(versionId: string, imageIds: string[]) {
    const req: OrderVersionImagesRequest = {
      versionId,
      imageIds,
    }

    await protomisify<OrderVersionImagesRequest, Empty>(
      this.client,
      this.client.orderImages,
      this.cookie,
    )(OrderVersionImagesRequest, req)
  }

  async patchImage(id: string, image: PatchVersionImage) {
    const req = {
      ...image,
      id,
      config: containerConfigToProto(image.config),
    } as PatchImageRequest

    await protomisify<PatchImageRequest, Empty>(
      this.client,
      this.client.patchImage,
      this.cookie,
    )(PatchImageRequest, req)
  }

  async deleteImage(id: string) {
    const req: IdRequest = {
      id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteImage, this.cookie)(IdRequest, req)
  }
}

export default DyoImageService
