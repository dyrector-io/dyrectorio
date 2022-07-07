import { Injectable } from '@nestjs/common'
import { JsonArray } from 'prisma'
import { Subject } from 'rxjs'
import { PrismaService } from 'src/config/prisma.service'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import {
  AddImagesToVersionRequest,
  Empty,
  IdRequest,
  ImageListResponse,
  ImageResponse,
  OrderVersionImagesRequest,
  PatchImageRequest,
} from 'src/grpc/protobuf/proto/crux'
import { ContainerConfigData } from 'src/shared/model'
import { ImageMapper, ImageWithConfig } from './image.mapper'

@Injectable()
export class ImageService {
  readonly imageUpdatedEvent = new Subject<ImageWithConfig>()
  readonly imagesAddedToVersionEvent = new Subject<ImageWithConfig[]>()
  readonly imageDeletedFromVersionEvent = new Subject<string>()

  constructor(private prisma: PrismaService, private mapper: ImageMapper) {}

  async getImagesByVersionId(request: IdRequest): Promise<ImageListResponse> {
    const images = await this.prisma.image.findMany({
      where: {
        versionId: request.id,
      },
      include: {
        config: true,
      },
    })

    return {
      data: images.map(it => this.mapper.toGrpc(it)),
    }
  }

  async getImageDetails(request: IdRequest): Promise<ImageResponse> {
    const image = await this.prisma.image.findUnique({
      where: {
        id: request.id,
      },
      include: {
        config: true,
      },
    })

    return this.mapper.toGrpc(image)
  }

  async addImagesToVersion(request: AddImagesToVersionRequest): Promise<ImageListResponse> {
    const images = await this.prisma.$transaction(async prisma => {
      const lastImageOrder = await this.prisma.image.findFirst({
        rejectOnNotFound: false,
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
      const images = request.images.flatMap(registyImages =>
        registyImages.imageNames.map(async it => {
          const image = await prisma.image.create({
            include: {
              config: true,
            },
            data: {
              registryId: registyImages.registryId,
              versionId: request.versionId,
              name: it,
              order: order++,
              config: {
                create: {
                  environment: [],
                  capabilities: [],
                  config: {},
                },
              },
            },
          })

          return image
        }),
      )

      return await Promise.all(images)
    })

    this.imagesAddedToVersionEvent.next(images)

    return {
      data: images.map(it => this.mapper.toGrpc(it)),
    }
  }

  async orderImages(request: OrderVersionImagesRequest): Promise<Empty> {
    const updates = request.imageIds.map((it, index) => {
      return this.prisma.image.update({
        data: {
          order: index,
        },
        where: {
          id: it,
        },
      })
    })

    await this.prisma.$transaction(updates)

    return Empty
  }

  @AuditLogLevel('no-data')
  async patchImage(request: PatchImageRequest): Promise<Empty> {
    let config: ContainerConfigData = undefined
    if (request.config) {
      const caps = request.config.capabilities
      const envs = request.config.environment

      config = {
        capabilities: caps ? caps.data ?? [] : (undefined as JsonArray),
        environment: envs ? envs.data ?? [] : (undefined as JsonArray),
        config: this.mapper.explicitConfigToDb(request.config?.config),
      }
    }

    const image = await this.prisma.image.update({
      include: {
        config: true,
      },
      data: {
        name: request.name,
        tag: request.tag,
        config: {
          update: config,
        },
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
}
