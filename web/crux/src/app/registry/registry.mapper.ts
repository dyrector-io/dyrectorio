import { Injectable } from '@nestjs/common'
import { Registry, RegistryTypeEnum } from '@prisma/client'
import { CruxBadRequestException } from 'src/exception/crux-exception'
import { REGISTRY_GITLAB_URLS, REGISTRY_HUB_URL } from 'src/shared/const'
import { BasicProperties } from '../../shared/dtos/shared.dto'
import {
  BasicRegistryDto,
  CreateRegistryDto,
  GithubRegistryDetailsDto,
  GitlabRegistryDetailsDto,
  GoogleRegistryDetailsDto,
  HubRegistryDetailsDto,
  RegistryDetailsDto,
  RegistryDto,
  UncheckedRegistryDetailsDto,
  UpdateRegistryDto,
  V2RegistryDetailsDto,
} from './registry.dto'

type RegistryTypeUnion = Pick<Registry, 'url' | 'type' | 'apiUrl' | 'user' | 'token' | 'imageNamePrefix' | 'namespace'>

@Injectable()
export default class RegistryMapper {
  toBasicDto(it: Pick<Registry, BasicProperties>): BasicRegistryDto {
    return {
      id: it.id,
      name: it.name,
      type: it.type,
    }
  }

  toDto(it: Registry): RegistryDto {
    return {
      id: it.id,
      name: it.name,
      type: it.type,
      url: it.url,
      description: it.description,
      icon: it.icon,
    }
  }

  detailsToDto(registry: RegistryWithCount): RegistryDetailsDto {
    const details =
      registry.type === RegistryTypeEnum.hub
        ? {
            imageNamePrefix: registry.imageNamePrefix,
            user: registry.user,
            token: registry.token,
          }
        : registry.type === RegistryTypeEnum.v2
        ? {
            url: registry.url,
            user: registry.user,
            token: registry.token,
          }
        : registry.type === RegistryTypeEnum.gitlab
        ? {
            user: registry.user,
            token: registry.token,
            imageNamePrefix: registry.imageNamePrefix,
            url: registry.apiUrl ? registry.url : null,
            apiUrl: registry.apiUrl,
            namespace: registry.namespace,
          }
        : registry.type === RegistryTypeEnum.github
        ? {
            user: registry.user,
            token: registry.token,
            imageNamePrefix: registry.imageNamePrefix,
            namespace: registry.namespace,
          }
        : registry.type === RegistryTypeEnum.google
        ? {
            url: registry.url,
            user: registry.user,
            token: registry.token,
            imageNamePrefix: registry.imageNamePrefix,
          }
        : registry.type === RegistryTypeEnum.unchecked
        ? {
            url: registry.url,
          }
        : null
    if (!details) {
      throw new CruxBadRequestException({
        message: 'Unknown registry type',
        property: 'type',
      })
    }

    return {
      ...registry,
      inUse: registry._count?.images > 0,
      icon: registry.icon ?? null,
      details,
    }
  }

  detailsToDb(request: CreateRegistryDto | UpdateRegistryDto): RegistryTypeUnion {
    switch (request.type) {
      case 'hub': {
        const details = request.details as HubRegistryDetailsDto

        return {
          type: RegistryTypeEnum.hub,
          ...details,
          url: REGISTRY_HUB_URL,
          apiUrl: null,
          user: this.emptyOrDefault(details.user),
          token: this.emptyOrDefault(details.token),
          namespace: null,
        }
      }

      case 'v2': {
        const details = request.details as V2RegistryDetailsDto
        return {
          type: RegistryTypeEnum.v2,
          ...details,
          user: this.emptyOrDefault(details.user),
          token: this.emptyOrDefault(details.token),
          imageNamePrefix: null,
          apiUrl: null,
          namespace: null,
        }
      }
      case 'gitlab': {
        const details = request.details as GitlabRegistryDetailsDto
        return {
          type: RegistryTypeEnum.gitlab,
          ...details,
          url: details.apiUrl ? details.url : REGISTRY_GITLAB_URLS.registryUrl,
          apiUrl: details.apiUrl ?? null,
          namespace: details.namespace,
        }
      }
      case 'github': {
        const details = request.details as GithubRegistryDetailsDto
        return {
          type: RegistryTypeEnum.github,
          ...details,
          url: 'ghcr.io',
          apiUrl: null,
          namespace: details.namespace,
        }
      }
      case 'google': {
        const details = request.details as GoogleRegistryDetailsDto
        return {
          type: RegistryTypeEnum.google,
          ...details,
          user: this.emptyOrDefault(details.user),
          token: this.emptyOrDefault(details.token),
          imageNamePrefix: details.imageNamePrefix,
          apiUrl: null,
          namespace: null,
        }
      }
      case 'unchecked':
        return {
          type: RegistryTypeEnum.unchecked,
          ...(request.details as UncheckedRegistryDetailsDto),
          user: null,
          apiUrl: null,
          token: null,
          imageNamePrefix: null,
          namespace: null,
        }
      default:
        throw new CruxBadRequestException({
          message: 'Unknown registry type',
          property: 'type',
          value: request.type,
        })
    }
  }

  private emptyOrDefault(value: string | null | undefined, def: string | null = null) {
    return value ?? def
  }
}

type RegistryWithCount = Registry & {
  _count?: {
    images: number
  }
}
