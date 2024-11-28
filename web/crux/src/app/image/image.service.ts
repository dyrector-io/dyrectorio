import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { ContainerConfig } from '@prisma/client'
import { ContainerConfigData, UniqueKeyValue } from 'src/domain/container'
import { containerNameFromImageName } from 'src/domain/deployment'
import { EnvironmentRule, parseDyrectorioEnvRules } from 'src/domain/image'
import PrismaService from 'src/services/prisma.service'
import { v4 } from 'uuid'
import ContainerMapper from '../container/container.mapper'
import EditorServiceProvider from '../editor/editor.service.provider'
import RegistryClientProvider from '../registry/registry-client.provider'
import TeamRepository from '../team/team.repository'
import { AddImagesDto, ImageDto, PatchImageDto } from './image.dto'
import ImageEventService from './image.event.service'
import ImageMapper from './image.mapper'

type LabelMap = Record<string, string>
type ImageLabelMap = Record<string, LabelMap>
type RegistryLabelMap = Record<string, ImageLabelMap>

@Injectable()
export default class ImageService {
  constructor(
    private prisma: PrismaService,
    private mapper: ImageMapper,
    private containerMapper: ContainerMapper,
    private editorServices: EditorServiceProvider,
    private eventService: ImageEventService,
    private readonly teamRepository: TeamRepository,
    private readonly registryClients: RegistryClientProvider,
  ) {}

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

  async addImagesToVersion(
    teamSlug: string,
    versionId: string,
    request: AddImagesDto[],
    identity: Identity,
  ): Promise<ImageDto[]> {
    const teamId = await this.teamRepository.getTeamIdBySlug(teamSlug)

    const labelLookupPromises = request.map(async it => {
      const api = await this.registryClients.getByRegistryId(teamId, it.registryId)

      const imagePromises = it.images.map(async image => {
        const [imageName, imageTag] = this.splitImageAndTag(image)

        const labels = await api.client.labels(imageName, imageTag)

        return {
          name: image,
          labels,
        }
      })

      const imageLabels = await Promise.all(imagePromises)

      return {
        registryId: it.registryId,
        labels: imageLabels,
      }
    })

    const registryLabels = await Promise.all(labelLookupPromises)
    const labelLookup: RegistryLabelMap = registryLabels.reduce((map, it) => {
      map[it.registryId] = it.labels.reduce((imageMap, image) => {
        imageMap[image.name] = image.labels
        return imageMap
      }, {} as ImageLabelMap)
      return map
    }, {} as RegistryLabelMap)

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

      const lastOrder = lastImageOrder?.order ?? -1
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

    await this.prisma.$transaction(prisma =>
      Promise.all(
        images.map(it => {
          const labelKey = it.tag != null ? `${it.name}:${it.tag}` : it.name
          const labels = labelLookup[it.registryId][labelKey]
          const envRules = parseDyrectorioEnvRules(labels)

          const defaultEnvs = Object.entries(envRules)
            .filter(([, rule]) => rule.required || !!rule.default)
            .map(([key, rule]) => ({
              id: v4(),
              key,
              value: rule.default ?? '',
            }))

          return prisma.image.update({
            where: {
              id: it.id,
            },
            data: {
              labels,
              config: {
                update: {
                  environment: defaultEnvs,
                },
              },
            },
          })
        }),
      ),
    )

    const dtos = images.map(it => this.mapper.toDto(it))

    this.eventService.imagesAddedToVersion(versionId, dtos)

    return dtos
  }

  async patchImage(teamSlug: string, imageId: string, request: PatchImageDto, identity: Identity): Promise<void> {
    const currentConfig = await this.prisma.containerConfig.findUniqueOrThrow({
      where: {
        imageId,
      },
    })

    const configData = this.containerMapper.configDtoToConfigData(
      currentConfig as any as ContainerConfigData,
      request.config ?? {},
    )

    let labels: Record<string, string> = null

    if (request.tag) {
      const image = await this.prisma.image.findFirst({
        where: {
          id: imageId,
        },
        select: {
          name: true,
          registryId: true,
        },
      })

      const teamId = await this.teamRepository.getTeamIdBySlug(teamSlug)
      const api = await this.registryClients.getByRegistryId(teamId, image.registryId)

      labels = await api.client.labels(image.name, request.tag)
      const rules = parseDyrectorioEnvRules(labels)

      configData.environment = ImageService.mergeEnvironmentsRules(configData.environment, rules)
    }

    const config: Omit<ContainerConfig, 'id' | 'imageId'> = this.containerMapper.configDataToDb(configData)

    const image = await this.prisma.image.update({
      where: {
        id: imageId,
      },
      include: {
        config: true,
        registry: true,
      },
      data: {
        labels: labels ?? undefined,
        tag: request.tag ?? undefined,
        config: {
          update: {
            data: config,
          },
        },
        updatedBy: identity.id,
      },
    })

    const dto = this.mapper.toDto(image)
    this.eventService.imageUpdated(image.versionId, dto)
  }

  async deleteImage(imageId: string): Promise<void> {
    const image = await this.prisma.image.delete({
      where: {
        id: imageId,
      },
      select: {
        versionId: true,
      },
    })

    const editors = await this.editorServices.getService(image.versionId)
    editors?.onDeleteItem(imageId)

    this.eventService.imageDeletedFromVersion(image.versionId, imageId)
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

  private static mergeEnvironmentsRules(
    environment: UniqueKeyValue[],
    rules: Record<string, EnvironmentRule>,
  ): UniqueKeyValue[] | null {
    const currentEnv =
      environment?.reduce((map, it) => {
        map[it.key] = it
        return map
      }, {}) ?? {}

    const mergedEnv = Object.entries(rules).reduce((map, it) => {
      const [key, rule] = it

      map[key] = {
        id: currentEnv[key]?.id ?? v4(),
        key,
        value: currentEnv[key]?.value ?? rule.default ?? '',
      }

      return map
    }, currentEnv)

    return Object.values(mergedEnv)
  }
}
