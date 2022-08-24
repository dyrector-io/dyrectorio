import { Logger } from '@app/logger'
import { PatchVersionImage, RegistryImages, VersionImage } from '@app/models'
import {
  ContainerConfig,
  ExplicitContainerConfig,
  ExplicitContainerConfigLog,
  ExplicitContainerDeploymentStrategyType,
  ExplicitContainerNetworkMode,
  ExplicitContainerRestartPolicyType,
} from '@app/models-config'
import {
  DeploymentStrategy,
  deploymentStrategyFromJSON,
  deploymentStrategyToJSON,
  ExplicitContainerConfig as ProtoExplicitContainerConfig,
  LogConfig,
  NetworkMode,
  networkModeFromJSON,
  networkModeToJSON,
  RestartPolicy,
  restartPolicyFromJSON,
  restartPolicyToJSON,
  Volume,
} from '@app/models/grpc/protobuf/proto/common'
import {
  AddImagesToVersionRequest,
  ContainerConfig as ProtoContainerConfig,
  CruxImageClient,
  Empty,
  IdRequest,
  ImageListResponse,
  ImageResponse,
  OrderVersionImagesRequest,
  PatchImageRequest,
} from '@app/models/grpc/protobuf/proto/crux'
import { Identity } from '@ory/kratos-client'
import { protomisify } from '@server/crux/grpc-connection'

class DyoImageService {
  private logger = new Logger(DyoImageService.name)

  constructor(private client: CruxImageClient, private identity: Identity) {}

  async getAllByVersionId(verisonId: string): Promise<VersionImage[]> {
    const req: IdRequest = {
      id: verisonId,
      accessedBy: this.identity.id,
    }

    const images = await protomisify<IdRequest, ImageListResponse>(this.client, this.client.getImagesByVersionId)(
      IdRequest,
      req,
    )

    return images.data.map(it => imageToDto(it))
  }

  async getById(id: string): Promise<VersionImage> {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    const image = await protomisify<IdRequest, ImageResponse>(this.client, this.client.getImageDetails)(IdRequest, req)

    return imageToDto(image)
  }

  async addImagesToVersion(versionId: string, registryImages: RegistryImages[]): Promise<VersionImage[]> {
    const req: AddImagesToVersionRequest = {
      versionId,
      images: registryImages.map(it => {
        return {
          registryId: it.registryId,
          imageNames: it.images,
        }
      }),
      accessedBy: this.identity.id,
    }

    const res = await protomisify<AddImagesToVersionRequest, ImageListResponse>(
      this.client,
      this.client.addImagesToVersion,
    )(AddImagesToVersionRequest, req)

    return res.data.map(it => imageToDto(it))
  }

  async orderImages(versionId: string, imageIds: string[]) {
    const req: OrderVersionImagesRequest = {
      versionId,
      imageIds,
      accessedBy: this.identity.id,
    }

    await protomisify<OrderVersionImagesRequest, Empty>(this.client, this.client.orderImages)(
      OrderVersionImagesRequest,
      req,
    )
  }

  async patchImage(id: string, image: PatchVersionImage) {
    const req = {
      ...image,
      accessedBy: this.identity.id,
      id,
      config: !image.config
        ? null
        : {
            config: explicitContainerConfigToProto(image.config?.config),
            name: image.config?.name,
            capabilities: !image.config?.capabilities
              ? undefined
              : {
                  data: image.config.capabilities,
                },
            environment: !image.config?.environment
              ? undefined
              : {
                  data: image.config.environment,
                },
          },
    } as PatchImageRequest

    await protomisify<PatchImageRequest, Empty>(this.client, this.client.patchImage)(PatchImageRequest, req)
  }

  async deleteImage(id: string) {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteImage)(IdRequest, req)
  }
}

export default DyoImageService

export const networkModeToDto = (networkMode?: NetworkMode): ExplicitContainerNetworkMode =>
  !networkMode ? 'none' : (networkModeToJSON(networkMode).toLocaleLowerCase() as ExplicitContainerNetworkMode)

export const deploymentStrategyToDto = (strategy?: DeploymentStrategy): ExplicitContainerDeploymentStrategyType =>
  !strategy
    ? 'recreate'
    : (deploymentStrategyToJSON(strategy).toLocaleLowerCase() as ExplicitContainerDeploymentStrategyType)

export const restartPolicyTypeToDto = (policy?: RestartPolicy): ExplicitContainerRestartPolicyType =>
  !policy ? 'unless_stopped' : (restartPolicyToJSON(policy).toLocaleLowerCase() as ExplicitContainerRestartPolicyType)

export const networkModeToProto = (networkMode?: ExplicitContainerNetworkMode): NetworkMode =>
  !networkMode ? undefined : networkModeFromJSON(networkMode.toUpperCase())

export const restartPolicyTypeToProto = (policy?: ExplicitContainerRestartPolicyType): RestartPolicy =>
  !policy ? undefined : restartPolicyFromJSON(policy.toUpperCase())

export const deploymentStrategyToProto = (strategy?: ExplicitContainerDeploymentStrategyType): DeploymentStrategy =>
  !strategy ? undefined : deploymentStrategyFromJSON(strategy.toUpperCase())

export const logConfigToProto = (logConfig?: ExplicitContainerConfigLog): LogConfig => {
  if (!logConfig) {
    return null
  }

  return { driver: logConfig.type, options: logConfig.config }
}

export const logConfigToDto = (logConfig?: LogConfig): ExplicitContainerConfigLog => {
  if (!logConfig) {
    return null
  }

  return { type: logConfig.driver, config: logConfig.options }
}

export const explicitContainerConfigToDto = (config?: ProtoExplicitContainerConfig): ExplicitContainerConfig => {
  if (!config) {
    return null
  }

  const explicit: ExplicitContainerConfig = {
    user: config.user ?? null,
    tty: config.TTY ?? false,
    ports: config.ports ?? [],
    portRanges: config.portRanges ?? [],
    volumes: config.volumes ?? [],
    commands: config.command ?? [],
    args: config.args ?? [],
    expose: config.expose ?? null,
    ingress: config.ingress ?? null,
    configContainer: config.configContainer ?? null,
    importContainer: config.importContainer ?? null,
    logConfig: logConfigToDto(config.dagent?.logConfig),
    restartPolicy: restartPolicyTypeToDto(config.dagent?.restartPolicy),
    networkMode: networkModeToDto(config.dagent?.networkMode),
    deploymentStrategy: deploymentStrategyToDto(config.crane?.deploymentStatregy),
    customHeaders: config.crane?.customHeaders ?? [],
    proxyHeaders: config.crane?.proxyHeaders ?? false,
    useLoadBalancer: config.crane?.useLoadBalancer ?? false,
    extraLBAnnotations: config.crane?.extraLBAnnotations ?? null,
    healthCheckConfig: config.crane?.healthCheckConfig ?? null,
    resourceConfig: config.crane?.resourceConfig ?? null,
  }

  return explicit
}

export const explicitContainerConfigToProto = (config?: ExplicitContainerConfig): ProtoExplicitContainerConfig => {
  if (!config) {
    return null
  }

  const protoConfig: ProtoExplicitContainerConfig = {
    user: config.user,
    TTY: config.tty,
    ports: config.ports ?? [],
    portRanges: config.portRanges ?? [],
    volumes: (config.volumes ?? []) as Volume[],
    command: config.commands ?? [],
    args: config.args ?? [],
    importContainer: config.importContainer,
    configContainer: config.configContainer,
    dagent: undefined,
    crane: undefined,
    environments: [],
  }

  if (config.expose) {
    protoConfig.expose = { public: config.expose.public, tls: config.expose.tls }
  }

  if (config.ingress) {
    protoConfig.ingress = {
      name: config.ingress.name,
      host: config.ingress.host,
      uploadLimit: config.ingress.uploadLimitInBytes,
    }
  }

  if (config.logConfig || config.restartPolicy || config.networkMode) {
    protoConfig.dagent = {
      logConfig: logConfigToProto(config.logConfig),
      restartPolicy: restartPolicyTypeToProto(config.restartPolicy),
      networkMode: networkModeToProto(config.networkMode),
    }
  }

  if (
    config.deploymentStrategy ||
    config.customHeaders ||
    config.proxyHeaders ||
    config.useLoadBalancer ||
    config.healthCheckConfig ||
    config.resourceConfig ||
    config.extraLBAnnotations
  ) {
    protoConfig.crane = {
      deploymentStatregy: deploymentStrategyToProto(config.deploymentStrategy),
      healthCheckConfig: config.healthCheckConfig,
      resourceConfig: config.resourceConfig,
      customHeaders: config.customHeaders ?? [],
      proxyHeaders: config.proxyHeaders,
      useLoadBalancer: config.useLoadBalancer,
      extraLBAnnotations: config.extraLBAnnotations,
    }
  }

  return protoConfig
}

export const containerConfigToDto = (config?: ProtoContainerConfig): ContainerConfig => {
  return !config
    ? null
    : {
        ...config,
        config: explicitContainerConfigToDto(config.config),
      }
}

export const imageToDto = (image: ImageResponse): VersionImage => {
  return {
    ...image,
    config: containerConfigToDto(image.config),
  }
}
