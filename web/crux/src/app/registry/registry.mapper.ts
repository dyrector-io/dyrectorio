import { Injectable } from '@nestjs/common'
import { Registry, RegistryNamespaceEnum, RegistryTypeEnum } from '@prisma/client'
import { InternalException, InvalidArgumentException } from 'src/exception/errors'
import {
  AuditResponse,
  CreateRegistryRequest,
  RegistryDetailsResponse,
  RegistryNamespace,
  RegistryResponse,
  RegistryType,
  registryTypeFromJSON,
  registryTypeToJSON,
  UpdateRegistryRequest,
} from 'src/grpc/protobuf/proto/crux'
import { REGISTRY_HUB_URL } from 'src/shared/const'

type RegistryTypeUnion = Pick<Registry, 'url' | 'type' | 'apiUrl' | 'user' | 'token' | 'imageNamePrefix' | 'namespace'>

@Injectable()
export default class RegistryMapper {
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
              namespace: this.registryNamespaceToGrpc(registry.namespace),
            },
      github:
        registry.type !== RegistryTypeEnum.github
          ? null
          : {
              user: registry.user,
              token: registry.token,
              imageNamePrefix: registry.imageNamePrefix,
              namespace: this.registryNamespaceToGrpc(registry.namespace),
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

  detailsToDb(request: CreateRegistryRequest | UpdateRegistryRequest): RegistryTypeUnion {
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
        namespace: this.registryNamespaceToDb(request.gitlab.namespace),
      }
    }
    if (request.github) {
      return {
        type: RegistryTypeEnum.github,
        ...request.github,
        url: 'ghcr.io',
        apiUrl: null,
        namespace: this.registryNamespaceToDb(request.github.namespace),
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
    throw new InvalidArgumentException({
      message: 'Registry type is undeductable',
      property: 'type',
    })
  }

  registryNamespaceToGrpc(type: RegistryNamespaceEnum): RegistryNamespace {
    switch (type) {
      case RegistryNamespaceEnum.organization:
        return RegistryNamespace.RNS_ORGANIZATION
      case RegistryNamespaceEnum.user:
        return RegistryNamespace.RNS_USER
      case RegistryNamespaceEnum.group:
        return RegistryNamespace.RNS_GROUP
      case RegistryNamespaceEnum.project:
        return RegistryNamespace.RNS_PROJECT
      default:
        throw new InternalException({
          message: `Unknown RegistryNamespaceEnum '${type}'`,
        })
    }
  }

  registryNamespaceToDb(type: RegistryNamespace): RegistryNamespaceEnum {
    switch (type) {
      case RegistryNamespace.RNS_ORGANIZATION:
        return RegistryNamespaceEnum.organization
      case RegistryNamespace.RNS_USER:
        return RegistryNamespaceEnum.user
      case RegistryNamespace.RNS_GROUP:
        return RegistryNamespaceEnum.group
      case RegistryNamespace.RNS_PROJECT:
        return RegistryNamespaceEnum.project
      default:
        throw new InvalidArgumentException({
          property: 'namespace',
          value: type,
          message: `Unknown RegistryNamespace '${type}'`,
        })
    }
  }
}
