import { Injectable } from '@nestjs/common'
import { Registry, RegistryTypeEnum } from '@prisma/client'
import { InvalidArgumentException } from 'src/exception/errors'
import {
  AuditResponse,
  CreateRegistryRequest,
  RegistryDetailsResponse,
  RegistryResponse,
  RegistryType,
  registryTypeFromJSON,
  registryTypeToJSON,
  UpdateRegistryRequest,
} from 'src/grpc/protobuf/proto/crux'
import { REGISTRY_HUB_URL } from 'src/shared/const'

@Injectable()
export class RegistryMapper {
  toGrpc(registry: Registry): RegistryResponse {
    return {
      ...registry,
      type: this.typeToGrpc(registry.type),
      audit: AuditResponse.fromJSON(registry),
    }
  }

  detailsToGrpc(registry: Registry): RegistryDetailsResponse {
    return {
      ...registry,
      icon: registry.icon ?? null,
      audit: AuditResponse.fromJSON(registry),
      hub:
        registry.type !== RegistryTypeEnum.hub
          ? null
          : {
              imageNamePrefix: registry.imageNamePrefix,
            },
      v2:
        registry.type !== RegistryTypeEnum.v2
          ? null
          : {
              url: registry.url,
              user: registry.user,
              token: registry.token,
            },
      gitlab:
        registry.type !== RegistryTypeEnum.gitlab
          ? null
          : {
              user: registry.user,
              token: registry.token,
              imageNamePrefix: registry.imageNamePrefix,
              url: registry.apiUrl ? registry.url : null,
              apiUrl: registry.apiUrl,
            },
      github:
        registry.type !== RegistryTypeEnum.github
          ? null
          : {
              user: registry.user,
              token: registry.token,
              imageNamePrefix: registry.imageNamePrefix,
            },
      google:
        registry.type !== RegistryTypeEnum.google
          ? null
          : {
              url: registry.url,
              user: registry.user,
              token: registry.token,
              imageNamePrefix: registry.imageNamePrefix,
            },
    }
  }

  typeToGrpc(type: RegistryTypeEnum): RegistryType {
    return registryTypeFromJSON(type.toUpperCase())
  }

  typeToDb(type: RegistryType): RegistryTypeEnum {
    return registryTypeToJSON(type).toLowerCase() as RegistryTypeEnum
  }

  detailsToDb(
    request: CreateRegistryRequest | UpdateRegistryRequest,
  ): Pick<Registry, 'url' | 'type' | 'apiUrl' | 'user' | 'token' | 'imageNamePrefix'> {
    const emptyOrDefault = (value: string | null | undefined, def: string | null = null) => value ? value : def

    if (request.hub) {
      return {
        type: RegistryTypeEnum.hub,
        ...request.hub,
        url: REGISTRY_HUB_URL,
        apiUrl: null,
        token: null,
        user: null,
      }
    } else if (request.v2) {
      return {
        type: RegistryTypeEnum.v2,
        ...request.v2,
        user: emptyOrDefault(request.v2.user),
        token: emptyOrDefault(request.v2.token),
        imageNamePrefix: null,
        apiUrl: null,
      }
    } else if (request.gitlab) {
      return {
        type: RegistryTypeEnum.gitlab,
        ...request.gitlab,
        url: request.gitlab.apiUrl ? request.gitlab.url : 'registry.gitlab.com',
        apiUrl: request.gitlab.apiUrl ?? null,
      }
    } else if (request.github) {
      return {
        type: RegistryTypeEnum.github,
        ...request.github,
        url: 'ghcr.io',
        apiUrl: null,
      }
    } else if (request.google) {
      return {
        type: RegistryTypeEnum.google,
        ...request.google,
        user: emptyOrDefault(request.google.user),
        token: emptyOrDefault(request.google.token),
        imageNamePrefix: request.google.imageNamePrefix,
        apiUrl: null,
      }
    } else {
      throw new InvalidArgumentException({
        message: 'Registry type is undeductable',
        property: 'type',
      })
    }
  }
}
