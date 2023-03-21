import { Injectable } from '@nestjs/common'
import { Registry, RegistryTypeEnum } from '@prisma/client'
import { InvalidArgumentException } from 'src/exception/errors'
import {
  RegistryType as ProtoRegistryType,
  registryTypeFromJSON as protoRegistryTypeFromJSON,
} from 'src/grpc/protobuf/proto/crux'
import { REGISTRY_HUB_URL } from 'src/shared/const'
import {
  CreateRegistry,
  GithubRegistryDetails,
  GitlabRegistryDetails,
  GoogleRegistryDetails,
  HubRegistryDetails,
  RegistryDetails,
  RegistryDto,
  UncheckedRegistryDetails,
  UpdateRegistry,
  V2RegistryDetails,
} from './registry.dto'

type RegistryTypeUnion = Pick<Registry, 'url' | 'type' | 'apiUrl' | 'user' | 'token' | 'imageNamePrefix' | 'namespace'>

@Injectable()
export default class RegistryMapper {
  listItemToDto(registry: Registry): RegistryDto {
    return {
      ...registry,
    }
  }

  detailsToDto(registry: RegistryWithCount): RegistryDetails {
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
      throw new InvalidArgumentException({
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

  detailsToDb(request: CreateRegistry | UpdateRegistry): RegistryTypeUnion {
    const emptyOrDefault = (value: string | null | undefined, def: string | null = null) => value || def

    if (request.type === 'hub') {
      return {
        type: RegistryTypeEnum.hub,
        ...(request.details as HubRegistryDetails),
        url: REGISTRY_HUB_URL,
        apiUrl: null,
        token: null,
        user: null,
        namespace: null,
      }
    }
    if (request.type === 'v2') {
      const v2Details = request.details as V2RegistryDetails
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
      const gitlabDetails = request.details as GitlabRegistryDetails
      return {
        type: RegistryTypeEnum.gitlab,
        ...gitlabDetails,
        url: gitlabDetails.apiUrl ? gitlabDetails.url : 'registry.gitlab.com',
        apiUrl: gitlabDetails.apiUrl ?? null,
        namespace: gitlabDetails.namespace,
      }
    }
    if (request.type === 'github') {
      const githubDetails = request.details as GithubRegistryDetails
      return {
        type: RegistryTypeEnum.github,
        ...githubDetails,
        url: 'ghcr.io',
        apiUrl: null,
        namespace: githubDetails.namespace,
      }
    }
    if (request.type === 'google') {
      const googleDetails = request.details as GoogleRegistryDetails
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
        ...(request.details as UncheckedRegistryDetails),
        user: null,
        apiUrl: null,
        token: null,
        imageNamePrefix: null,
        namespace: null,
      }
    }
    throw new InvalidArgumentException({
      message: 'Unknown registry type',
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
