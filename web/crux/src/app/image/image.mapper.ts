import { Injectable } from '@nestjs/common'
import {
  ContainerConfig,
  DeploymentStrategy,
  ExposeStrategy,
  Image,
  NetworkMode,
  Registry,
  RestartPolicy,
} from '@prisma/client'
import { ContainerConfigData } from 'src/domain/container'
import {
  DeploymentStrategy as ProtoDeploymentStrategy,
  ExposeStrategy as ProtoExposeStrategy,
  NetworkMode as ProtoNetworkMode,
  RestartPolicy as ProtoRestartPolicy,
  networkModeToJSON,
} from 'src/grpc/protobuf/proto/common'
import ContainerMapper from '../container/container.mapper'
import RegistryMapper from '../registry/registry.mapper'
import { ImageDto } from './image.dto'

@Injectable()
export default class ImageMapper {
  constructor(
    private registryMapper: RegistryMapper,
    private readonly containerMapper: ContainerMapper,
  ) {}

  toDto(it: ImageDetails): ImageDto {
    return {
      id: it.id,
      name: it.name,
      tag: it.tag,
      order: it.order,
      registry: this.registryMapper.toDto(it.registry),
      config: this.containerMapper.configDataToDto(it.config.id, 'image', it.config as any as ContainerConfigData),
      createdAt: it.createdAt,
      labels: it.labels as Record<string, string>,
    }
  }

  dbImageToCreateImageStatement(image: Image): Omit<Image, 'id' | 'registryId' | 'versionId' | 'configId'> {
    const result = {
      ...image,
    }

    delete result.id
    delete result.registryId
    delete result.versionId
    delete result.configId

    return result
  }

  deploymentStrategyToDb(type: ProtoDeploymentStrategy): DeploymentStrategy {
    if (!type) {
      return undefined
    }

    switch (type) {
      case ProtoDeploymentStrategy.RECREATE:
        return DeploymentStrategy.recreate
      case ProtoDeploymentStrategy.ROLLING_UPDATE:
        return DeploymentStrategy.rolling
      default:
        return DeploymentStrategy.recreate
    }
  }

  exposeStrategyToDb(type: ProtoExposeStrategy): ExposeStrategy {
    if (!type) {
      return undefined
    }

    switch (type) {
      case ProtoExposeStrategy.EXPOSE:
        return ExposeStrategy.expose
      case ProtoExposeStrategy.EXPOSE_WITH_TLS:
        return ExposeStrategy.exposeWithTls
      default:
        return ExposeStrategy.none
    }
  }

  restartPolicyToDb(type: ProtoRestartPolicy): RestartPolicy {
    if (!type) {
      return undefined
    }

    switch (type) {
      case ProtoRestartPolicy.ALWAYS:
        return RestartPolicy.always
      case ProtoRestartPolicy.NO:
        return RestartPolicy.no
      case ProtoRestartPolicy.UNLESS_STOPPED:
        return RestartPolicy.unlessStopped
      case ProtoRestartPolicy.ON_FAILURE:
        return RestartPolicy.onFailure
      default:
        return RestartPolicy.no
    }
  }

  networkModeToDb(it: ProtoNetworkMode): NetworkMode {
    if (!it) {
      return undefined
    }

    if (ProtoNetworkMode.UNRECOGNIZED || ProtoNetworkMode.NETWORK_MODE_UNSPECIFIED) {
      return 'bridge'
    }

    return networkModeToJSON(it).toLowerCase() as NetworkMode
  }
}

export type ImageDetails = Image & {
  config: ContainerConfig
  registry: Registry
}
