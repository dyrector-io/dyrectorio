import { Injectable } from '@nestjs/common'
import { Registry, RegistryTypeEnum } from '@prisma/client'
import { InvalidArgumentException } from 'src/exception/errors'
import {
  RegistryType as ProtoRegistryType,
  registryTypeFromJSON as protoRegistryTypeFromJSON,
} from 'src/grpc/protobuf/proto/crux'
import { REGISTRY_HUB_URL } from 'src/shared/const'
import { CreateRegistry, RegistryDetails, BasicRegistry, UpdateRegistry } from './registry.dto'

type RegistryTypeUnion = Pick<Registry, 'url' | 'type' | 'apiUrl' | 'user' | 'token' | 'imageNamePrefix' | 'namespace'>

@Injectable()
export default class RegistryMapper {
  listItemToDto(registry: Registry): BasicRegistry {
    return {
      ...registry,
    }
  }

  detailsToDto(registry: RegistryWithCount): RegistryDetails {
    return {
      ...registry,
      inUse: registry._count?.images > 0,
      icon: registry.icon ?? null,
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
              namespace: registry.namespace,
            },
      github:
        registry.type !== RegistryTypeEnum.github
          ? null
          : {
              user: registry.user,
              token: registry.token,
              imageNamePrefix: registry.imageNamePrefix,
              namespace: registry.namespace,
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
      unchecked:
        registry.type !== RegistryTypeEnum.unchecked
          ? null
          : {
              url: registry.url,
            },
    }
  }

  detailsToDb(request: CreateRegistry | UpdateRegistry): RegistryTypeUnion {
    const emptyOrDefault = (value: string | null | undefined, def: string | null = null) => value || def

    if (request.hub) {
      return {
        type: RegistryTypeEnum.hub,
        ...request.hub,
        url: REGISTRY_HUB_URL,
        apiUrl: null,
        token: null,
        user: null,
        namespace: null,
      }
    }
    if (request.v2) {
      return {
        type: RegistryTypeEnum.v2,
        ...request.v2,
        user: emptyOrDefault(request.v2.user),
        token: emptyOrDefault(request.v2.token),
        imageNamePrefix: null,
        apiUrl: null,
        namespace: null,
      }
    }
    if (request.gitlab) {
      return {
        type: RegistryTypeEnum.gitlab,
        ...request.gitlab,
        url: request.gitlab.apiUrl ? request.gitlab.url : 'registry.gitlab.com',
        apiUrl: request.gitlab.apiUrl ?? null,
        namespace: request.gitlab.namespace,
      }
    }
    if (request.github) {
      return {
        type: RegistryTypeEnum.github,
        ...request.github,
        url: 'ghcr.io',
        apiUrl: null,
        namespace: request.github.namespace,
      }
    }
    if (request.google) {
      return {
        type: RegistryTypeEnum.google,
        ...request.google,
        user: emptyOrDefault(request.google.user),
        token: emptyOrDefault(request.google.token),
        imageNamePrefix: request.google.imageNamePrefix,
        apiUrl: null,
        namespace: null,
      }
    }
    if (request.unchecked) {
      return {
        type: RegistryTypeEnum.unchecked,
        ...request.unchecked,
        user: null,
        apiUrl: null,
        token: null,
        imageNamePrefix: null,
        namespace: null,
      }
    }
    throw new InvalidArgumentException({
      message: 'Registry type is undeductable',
      property: 'type',
    })
  }

  // TODO(@robot9706): Required by ImageMapper, remove when ImageMapper is removed
  typeToProto(type: RegistryTypeEnum): ProtoRegistryType {
    return protoRegistryTypeFromJSON(type.toUpperCase())
  }
}

type RegistryWithCount = Registry & {
  _count?: {
    images: number
  }
}
