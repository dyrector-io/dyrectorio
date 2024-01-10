import { Injectable } from '@nestjs/common'
import { Registry, RegistryToken, RegistryTypeEnum } from '@prisma/client'
import { NotificationMessageType } from 'src/domain/notification-templates'
import { CruxBadRequestException } from 'src/exception/crux-exception'
import EncryptionService from 'src/services/encryption.service'
import { REGISTRY_GITLAB_URLS, REGISTRY_HUB_URL } from 'src/shared/const'
import { BasicProperties } from '../../shared/dtos/shared.dto'
import {
  BasicRegistryDto,
  CreateGithubRegistryDetailsDto,
  CreateGitlabRegistryDetailsDto,
  CreateGoogleRegistryDetailsDto,
  CreateHubRegistryDetailsDto,
  CreateRegistryDto,
  CreateUncheckedRegistryDetailsDto,
  CreateV2RegistryDetailsDto,
  RegistryDetailsDto,
  RegistryDto,
  RegistryV2HookActionTypeDto,
  UpdateGithubRegistryDetailsDto,
  UpdateGitlabRegistryDetailsDto,
  UpdateGoogleRegistryDetailsDto,
  UpdateHubRegistryDetailsDto,
  UpdateRegistryDto,
  UpdateUncheckedRegistryDetailsDto,
  UpdateV2RegistryDetailsDto,
} from './registry.dto'

type RegistryTypeUnion = Pick<Registry, 'url' | 'type' | 'apiUrl' | 'user' | 'token' | 'imageNamePrefix' | 'namespace'>

@Injectable()
export default class RegistryMapper {
  constructor(private readonly encryptionService: EncryptionService) {}

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
            public: !registry.user,
          }
        : registry.type === RegistryTypeEnum.v2
        ? {
            url: registry.url,
            public: !registry.user,
          }
        : registry.type === RegistryTypeEnum.gitlab
        ? {
            imageNamePrefix: registry.imageNamePrefix,
            url: registry.apiUrl ? registry.url : null,
            apiUrl: registry.apiUrl,
            namespace: registry.namespace,
          }
        : registry.type === RegistryTypeEnum.github
        ? {
            imageNamePrefix: registry.imageNamePrefix,
            namespace: registry.namespace,
          }
        : registry.type === RegistryTypeEnum.google
        ? {
            url: registry.url,
            imageNamePrefix: registry.imageNamePrefix,
            public: !registry.user,
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

    const regToken = registry.registryToken

    return {
      ...registry,
      registryToken: !regToken
        ? null
        : {
            id: regToken.id,
            createdAt: regToken.createdAt,
            expiresAt: regToken.expiresAt,
          },
      inUse: registry._count?.images > 0,
      icon: registry.icon ?? null,
      details,
    }
  }

  detailsToDb(req: CreateRegistryDto | UpdateRegistryDto): RegistryTypeUnion {
    switch (req.type) {
      case 'hub': {
        const details = this.dtoDetailsToDb(req.details as CreateHubRegistryDetailsDto | UpdateHubRegistryDetailsDto)
        return {
          type: RegistryTypeEnum.hub,
          ...details,
          url: REGISTRY_HUB_URL,
          apiUrl: null,
          namespace: null,
        }
      }
      case 'v2': {
        const details = this.dtoDetailsToDb(req.details as CreateV2RegistryDetailsDto | UpdateV2RegistryDetailsDto)
        return {
          type: RegistryTypeEnum.v2,
          ...details,
          imageNamePrefix: null,
          apiUrl: null,
          namespace: null,
        }
      }
      case 'gitlab': {
        const details = this.dtoDetailsToDb(
          req.details as CreateGitlabRegistryDetailsDto | UpdateGitlabRegistryDetailsDto,
        )
        return {
          type: RegistryTypeEnum.gitlab,
          ...details,
          url: details.apiUrl ? details.url : REGISTRY_GITLAB_URLS.registryUrl,
          apiUrl: details.apiUrl ?? null,
          namespace: details.namespace,
        }
      }
      case 'github': {
        const details = this.dtoDetailsToDb(
          req.details as CreateGithubRegistryDetailsDto | UpdateGithubRegistryDetailsDto,
        )
        return {
          type: RegistryTypeEnum.github,
          ...details,
          url: 'ghcr.io',
          apiUrl: null,
          namespace: details.namespace,
        }
      }
      case 'google': {
        const details = this.dtoDetailsToDb(
          req.details as CreateGoogleRegistryDetailsDto | UpdateGoogleRegistryDetailsDto,
        )
        return {
          type: RegistryTypeEnum.google,
          ...details,
          imageNamePrefix: details.imageNamePrefix,
          apiUrl: null,
          namespace: null,
        }
      }
      case 'unchecked': {
        const details = req.details as CreateUncheckedRegistryDetailsDto | UpdateUncheckedRegistryDetailsDto
        return {
          type: RegistryTypeEnum.unchecked,
          url: details.local ? '' : details.url,
          user: null,
          token: null,
          apiUrl: null,
          imageNamePrefix: null,
          namespace: null,
        }
      }
      default:
        throw new CruxBadRequestException({
          message: 'Unknown registry type',
          property: 'type',
          value: req.type,
        })
    }
  }

  private dtoDetailsToDb<T extends CredentialsDto>(dto: T): T & Pick<Registry, 'user' | 'token'> {
    const { public: pub } = dto
    delete dto.public

    if (pub) {
      return {
        ...dto,
        user: null,
        token: null,
      }
    }

    const hasCreds = !!dto.user
    if (hasCreds) {
      return {
        ...dto,
        user: dto.user,
        token: this.encryptionService.encrypt(dto.token),
      }
    }

    return {
      ...dto,
      user: undefined,
      token: undefined,
    }
  }

  v2HookActionTypeToNotificationMessageType(action: RegistryV2HookActionTypeDto): NotificationMessageType {
    switch (action) {
      case 'push':
        return 'image-pushed'
      case 'pull':
        return 'image-pulled'
      default:
        throw new CruxBadRequestException({
          message: `Invalid action type : ${action}`,
          property: 'action',
        })
    }
  }
}

type CredentialsDto = {
  public?: boolean
  user?: string
  token?: string
}

type RegistryWithCount = Registry & {
  registryToken: RegistryToken
  _count?: {
    images: number
  }
}
