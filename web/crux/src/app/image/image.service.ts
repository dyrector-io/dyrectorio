import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Identity } from '@ory/kratos-client'
import { Prisma } from '@prisma/client'
import { UniqueKeyValue, UniqueSecretKey } from 'src/domain/container'
import { IMAGE_EVENT_ADD, IMAGE_EVENT_DELETE, ImageDeletedEvent, ImagesAddedEvent } from 'src/domain/domain-events'
import { EnvironmentRule, parseDyrectorioEnvRules } from 'src/domain/image'
import PrismaService from 'src/services/prisma.service'
import { v4 as uuid } from 'uuid'
import ContainerConfigService from '../container/container-config.service'
import RegistryClientProvider from '../registry/registry-client.provider'
import TeamRepository from '../team/team.repository'
import { AddImagesDto, ImageDetailsDto, PatchImageDto } from './image.dto'
import ImageMapper from './image.mapper'

type LabelMap = Record<string, string>
type ImageLabelMap = Record<string, LabelMap>
type RegistryLabelMap = Record<string, ImageLabelMap>

@Injectable()
export default class ImageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: ImageMapper,
    private readonly containerConfigService: ContainerConfigService,
    private readonly events: EventEmitter2,
    private readonly teamRepository: TeamRepository,
    private readonly registryClients: RegistryClientProvider,
  ) {}

  async getImagesByVersionId(versionId: string): Promise<ImageDetailsDto[]> {
    const images = await this.prisma.image.findMany({
      where: {
        versionId,
      },
      include: {
        config: true,
        registry: true,
      },
    })

    return images.map(it => this.mapper.toDetailsDto(it))
  }

  async getImageDetails(imageId: string): Promise<ImageDetailsDto> {
    const image = await this.prisma.image.findUniqueOrThrow({
      where: {
        id: imageId,
      },
      include: {
        config: true,
        registry: true,
      },
    })
    return this.mapper.toDetailsDto(image)
  }

  async addImagesToVersion(
    teamSlug: string,
    versionId: string,
    request: AddImagesDto[],
    identity: Identity,
  ): Promise<ImageDetailsDto[]> {
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
              registry: { connect: { id: registyImages.registryId } },
              version: { connect: { id: versionId } },
              config: { create: { type: 'image' } },
              createdBy: identity.id,
              name: imageName,
              tag: imageTag,
              order: order++,
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
            .filter(([, rule]) => (rule.required || !!rule.default) && !rule.secret)
            .map(([key, rule]) => ({
              id: uuid(),
              key,
              value: rule.default ?? '',
            }))

          const defaultSecrets = Object.entries(envRules)
            .filter(([, rule]) => rule.secret)
            .map(
              ([key, rule]) =>
                ({
                  id: uuid(),
                  key,
                  required: rule.required,
                }) as UniqueSecretKey,
            )

          return prisma.image.update({
            where: {
              id: it.id,
            },
            data: {
              labels,
              config: {
                update: {
                  environment: defaultEnvs,
                  secrets: defaultSecrets,
                },
              },
            },
          })
        }),
      ),
    )

    const dtos = images.map(it => this.mapper.toDetailsDto(it))

    const event: ImagesAddedEvent = {
      versionId,
      images,
    }
    await this.events.emitAsync(IMAGE_EVENT_ADD, event)

    return dtos
  }

  async patchImage(teamSlug: string, imageId: string, request: PatchImageDto, identity: Identity): Promise<void> {
    const currentConfig = await this.prisma.containerConfig.findFirstOrThrow({
      where: {
        image: {
          id: imageId,
        },
      },
    })

    if (request.config) {
      await this.containerConfigService.patchConfig(
        currentConfig.id,
        {
          config: request.config,
        },
        identity,
      )
    }

    let labels: Record<string, string>
    let configUpdate: Prisma.ContainerConfigUpdateOneRequiredWithoutImageNestedInput = null
    if (request.tag) {
      const image = await this.prisma.image.findUniqueOrThrow({
        where: {
          id: imageId,
        },
        select: {
          name: true,
          registryId: true,
          config: true,
        },
      })

      const teamId = await this.teamRepository.getTeamIdBySlug(teamSlug)
      const api = await this.registryClients.getByRegistryId(teamId, image.registryId)

      labels = await api.client.labels(image.name, request.tag)
      const rules = parseDyrectorioEnvRules(labels)

      const configEnvironment = ImageService.mergeEnvironmentsRules(image.config.environment as UniqueKeyValue[], rules)

      const configSecrets = ImageService.mergeSecretsRules(image.config.secrets as UniqueSecretKey[], rules)

      configUpdate = {
        update: {
          environment: configEnvironment,
          secrets: configSecrets,
        },
      }
    }

    await this.prisma.image.update({
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
        updatedBy: identity.id,
        config: configUpdate ?? undefined,
      },
    })
  }

  async deleteImage(imageId: string): Promise<void> {
    const image = await this.prisma.image.delete({
      where: {
        id: imageId,
      },
      select: {
        versionId: true,
        instances: {
          select: {
            id: true,
            configId: true,
            deploymentId: true,
          },
        },
      },
    })

    const event: ImageDeletedEvent = {
      versionId: image.versionId,
      imageId,
      instances: image.instances,
    }
    await this.events.emitAsync(IMAGE_EVENT_DELETE, event)
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

    const mergedEnv = Object.entries(rules)
      .filter(([_, rule]) => !rule.secret)
      .reduce((map, it) => {
        const [key, rule] = it

        map[key] = {
          id: currentEnv[key]?.id ?? uuid(),
          key,
          value: currentEnv[key]?.value ?? rule.default ?? '',
        }

        return map
      }, currentEnv)

    return Object.values(mergedEnv)
  }

  private static mergeSecretsRules(
    secrets: UniqueSecretKey[],
    rules: Record<string, EnvironmentRule>,
  ): UniqueSecretKey[] | null {
    const currentSecrets =
      secrets?.reduce((map, it) => {
        map[it.key] = it
        return map
      }, {}) ?? {}

    const mergedSecrets = Object.entries(rules)
      .filter(([_, rule]) => rule.secret)
      .reduce((map, it) => {
        const [key, rule] = it

        map[key] = {
          id: currentSecrets[key]?.id ?? uuid(),
          required: currentSecrets[key]?.required ?? rule.required ?? false,
          key,
          value: currentSecrets[key]?.value ?? rule.default ?? '',
        }

        return map
      }, currentSecrets)

    return Object.values(mergedSecrets)
  }
}
