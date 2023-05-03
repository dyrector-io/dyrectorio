import { Injectable } from '@nestjs/common'
import { Registry, RegistryTypeEnum } from '@prisma/client'
import { CruxBadRequestException } from 'src/exception/crux-exception'
import { REGISTRY_HUB_URL } from 'src/shared/const'
import { BasicProperties } from '../shared/shared.dto'
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
    const emptyOrDefault = (value: string | null | undefined, def: string | null = null) => value || def

    if (request.type === 'hub') {
      return {
        type: RegistryTypeEnum.hub,
        ...(request.details as HubRegistryDetailsDto),
        url: REGISTRY_HUB_URL,
        apiUrl: null,
        token: null,
        user: null,
        namespace: null,
      }
    }
    if (request.type === 'v2') {
      const v2Details = request.details as V2RegistryDetailsDto
      return {
        type: RegistryTypeEnum.v2,
        ...v2Details,
        user: emptyOrDefault(v2Details.user),
        token: emptyOrDefault(v2Details.token),
        imageNamePrefix: null,
        apiUrl: null,
        namespace: null,
      }
    }
    if (request.type === 'gitlab') {
      const gitlabDetails = request.details as GitlabRegistryDetailsDto
      return {
        type: RegistryTypeEnum.gitlab,
        ...gitlabDetails,
        url: gitlabDetails.apiUrl ? gitlabDetails.url : 'registry.gitlab.com',
        apiUrl: gitlabDetails.apiUrl ?? null,
        namespace: gitlabDetails.namespace,
      }
    }
    if (request.type === 'github') {
      const githubDetails = request.details as GithubRegistryDetailsDto
      return {
        type: RegistryTypeEnum.github,
        ...githubDetails,
        url: 'ghcr.io',
        apiUrl: null,
        namespace: githubDetails.namespace,
      }
    }
    if (request.type === 'google') {
      const googleDetails = request.details as GoogleRegistryDetailsDto
      return {
        type: RegistryTypeEnum.google,
        ...googleDetails,
        user: emptyOrDefault(googleDetails.user),
        token: emptyOrDefault(googleDetails.token),
        imageNamePrefix: googleDetails.imageNamePrefix,
        apiUrl: null,
        namespace: null,
      }
    }
    if (request.type === 'unchecked') {
      return {
        type: RegistryTypeEnum.unchecked,
        ...(request.details as UncheckedRegistryDetailsDto),
        user: null,
        apiUrl: null,
        token: null,
        imageNamePrefix: null,
        namespace: null,
      }
    }

    throw new CruxBadRequestException({
      message: 'Unknown registry type',
      property: 'type',
      value: request.type,
    })
  }
}

type RegistryWithCount = Registry & {
  _count?: {
    images: number
  }
}
