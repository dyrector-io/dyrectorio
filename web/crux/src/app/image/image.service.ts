import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { ContainerConfig } from '@prisma/client'
import { Subject } from 'rxjs'
import { containerNameFromImageName } from 'src/domain/deployment'
import PrismaService from 'src/services/prisma.service'
import { ContainerConfigData } from 'src/shared/models'
import { AddImagesDto, ImageDto, PatchImageDto } from './image.dto'
import ImageMapper, { ImageDetails } from './image.mapper'

@Injectable()
export default class ImageService {
  readonly imageUpdatedEvent = new Subject<ImageDetails>()

  readonly imagesAddedToVersionEvent = new Subject<ImageDetails[]>()

  readonly imageDeletedFromVersionEvent = new Subject<string>()

  constructor(private prisma: PrismaService, private mapper: ImageMapper) {}

  async getImagesByVersionId(versionId: string): Promise<ImageDto[]> {
    const images = await this.prisma.image.findMany({
      where: {
        versionId,
      },
      include: {
        config: true,
        registry: true,
      },
    })

    return images.map(it => this.mapper.toDto(it))
  }

  async getImageDetails(imageId: string): Promise<ImageDto> {
    const image = await this.prisma.image.findUniqueOrThrow({
      where: {
        id: imageId,
      },
      include: {
        config: true,
        registry: true,
      },
    })

    return this.mapper.toDto(image)
  }

  async addImagesToVersion(versionId: string, request: AddImagesDto[], identity: Identity): Promise<ImageDto[]> {
    const images = await this.prisma.$transaction(async prisma => {
      const lastImageOrder = await this.prisma.image.findFirst({
        select: {
          order: true,
        },
        where: {
          versionId,
        },
        orderBy: {
          order: 'desc',
        },
      })

      const lastOrder = lastImageOrder?.order ?? 0
      let order = lastOrder + 1

      // we need the generated uuids, so we can't use createMany
      const imgs = request.flatMap(registyImages =>
        registyImages.images.map(async it => {
          const [imageName, imageTag] = this.splitImageAndTag(it)

          const image = await prisma.image.create({
            include: {
              config: true,
              registry: true,
            },
            data: {
              registryId: registyImages.registryId,
              versionId,
              createdBy: identity.id,
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

    return images.map(it => this.mapper.toDto(it))
  }

  async patchImage(imageId: string, request: PatchImageDto, identity: Identity): Promise<void> {
    let config: Omit<ContainerConfig, 'id' | 'imageId'>

    if (request.config) {
      const currentConfig = await this.prisma.containerConfig.findUniqueOrThrow({
        where: {
          imageId,
        },
      })

      const configData = this.mapper.configDtoToContainerConfigData(
        currentConfig as any as ContainerConfigData,
        request.config,
      )
      config = this.mapper.containerConfigDataToDb(configData)
    }

    const image = await this.prisma.image.update({
      where: {
        id: imageId,
      },
      include: {
        config: true,
        registry: true,
      },
      data: {
        tag: request.tag ?? undefined,
        config: {
          update: config,
        },
        updatedBy: identity.id,
      },
    })

    this.imageUpdatedEvent.next(image)
  }

  async deleteImage(versionId: string): Promise<void> {
    await this.prisma.image.delete({
      where: {
        id: versionId,
      },
    })

    this.imageDeletedFromVersionEvent.next(versionId)
  }

  async orderImages(request: string[], identity: Identity): Promise<void> {
    const updates = request.map((it, index) =>
      this.prisma.image.update({
        data: {
          order: index,
          updatedBy: identity.id,
        },
        where: {
          id: it,
        },
      }),
    )

    await this.prisma.$transaction(updates)
  }

  private splitImageAndTag(nameTag: string): [string, string | undefined] {
    const [imageName, imageTag = undefined] = nameTag.split(':')
    return [imageName, imageTag]
  }
}
