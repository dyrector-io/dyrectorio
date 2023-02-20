import { Injectable } from '@nestjs/common'
import { Subject } from 'rxjs'
import { containerNameFromImageName } from 'src/domain/deployment'
import { Empty } from 'src/grpc/protobuf/proto/common'
import {
  AddImagesToVersionRequest,
  IdRequest,
  ImageListResponse,
  ImageResponse,
  OrderVersionImagesRequest,
  PatchImageRequest,
} from 'src/grpc/protobuf/proto/crux'
import PrismaService from 'src/services/prisma.service'
import { ContainerConfigData } from 'src/shared/models'
import ImageMapper, { ImageDetails } from './image.mapper'

@Injectable()
export default class ImageService {
  readonly imageUpdatedEvent = new Subject<ImageDetails>()

  readonly imagesAddedToVersionEvent = new Subject<ImageDetails[]>()

  readonly imageDeletedFromVersionEvent = new Subject<string>()

  constructor(private prisma: PrismaService, private mapper: ImageMapper) {}

  async getImagesByVersionId(request: IdRequest): Promise<ImageListResponse> {
    const images = await this.prisma.image.findMany({
      where: {
        versionId: request.id,
      },
      include: {
        config: true,
        registry: true,
      },
    })

    return {
      data: images.map(it => this.mapper.detailsToProto(it)),
    }
  }

  async getImageDetails(request: IdRequest): Promise<ImageResponse> {
    const image = await this.prisma.image.findUniqueOrThrow({
      where: {
        id: request.id,
      },
      include: {
        config: true,
        registry: true,
      },
    })

    return this.mapper.detailsToProto(image)
  }

  async addImagesToVersion(request: AddImagesToVersionRequest): Promise<ImageListResponse> {
    const images = await this.prisma.$transaction(async prisma => {
      const lastImageOrder = await this.prisma.image.findFirst({
        select: {
          order: true,
        },
        where: {
          versionId: request.versionId,
        },
        orderBy: {
          order: 'desc',
        },
      })

      const lastOrder = lastImageOrder?.order ?? 0
      let order = lastOrder + 1

      // we need the generated uuids, so we can't use createMany
      const imgs = request.images.flatMap(registyImages =>
        registyImages.imageNames.map(async it => {
          const [imageName, imageTag] = this.splitImageAndTag(it)

          const image = await prisma.image.create({
            include: {
              config: true,
              registry: true,
            },
            data: {
              registryId: registyImages.registryId,
              versionId: request.versionId,
              createdBy: request.accessedBy,
              name: imageName,
              tag: imageTag,
              order: order++,
              config: {
                create: {
                  name: containerNameFromImageName(imageName),
                  deploymentStrategy: 'recreate',
                  expose: 'none',
                  networkMode: 'bridge',
                  proxyHeaders: false,
                  restartPolicy: 'no',
                  tty: false,
                  useLoadBalancer: false,
                },
              },
            },
          })

          return image
        }),
      )

      return await Promise.all(imgs)
    })

    this.imagesAddedToVersionEvent.next(images)

    return {
      data: images.map(it => this.mapper.detailsToProto(it)),
    }
  }

  async orderImages(request: OrderVersionImagesRequest): Promise<Empty> {
    const updates = request.imageIds.map((it, index) =>
      this.prisma.image.update({
        data: {
          order: index,
          updatedBy: request.accessedBy,
        },
        where: {
          id: it,
        },
      }),
    )

    await this.prisma.$transaction(updates)

    return Empty
  }

  async patchImage(request: PatchImageRequest): Promise<Empty> {
    let config: Partial<ContainerConfigData>

    if (request.config) {
      const currentConfig = await this.prisma.containerConfig.findUnique({
        where: {
          imageId: request.id,
        },
      })

      config = this.mapper.configProtoToContainerConfigData(currentConfig as any as ContainerConfigData, request.config)
    }

    if (request.resetSection) {
      config = this.mapper.configSectionResetToDb(config ?? {}, request.resetSection)
    }

    const image = await this.prisma.image.update({
      include: {
        config: true,
        registry: true,
      },
      data: {
        tag: request.tag ?? undefined,
        config: {
          update: config,
        },
        updatedBy: request.accessedBy,
      },
      where: {
        id: request.id,
      },
    })

    this.imageUpdatedEvent.next(image)

    return Empty
  }

  async deleteImage(request: IdRequest): Promise<Empty> {
    await this.prisma.image.delete({
      where: {
        id: request.id,
      },
    })

    this.imageDeletedFromVersionEvent.next(request.id)

    return Empty
  }

  private splitImageAndTag(nameTag: string): [string, string | undefined] {
    const [imageName, imageTag = undefined] = nameTag.split(':')
    return [imageName, imageTag]
  }
}
