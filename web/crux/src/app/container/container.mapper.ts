import { forwardRef, Inject, Injectable } from '@nestjs/common'
import {
  ConfigBundle,
  ContainerConfig,
  ContainerConfigType,
  Deployment,
  DeploymentStatusEnum,
  Image,
  Project,
  Version,
  VersionsOnParentVersion,
} from '@prisma/client'
import { ContainerConfigData } from 'src/domain/container'
import { deploymentIsMutable, DeploymentWithConfigAndBundles } from 'src/domain/deployment'
import { ContainerConfigUpdatedEvent } from 'src/domain/domain-events'
import { ImageDetails } from 'src/domain/image'
import { toNullableBoolean, toNullableNumber, toPrismaJson, toPrismaJsonArray } from 'src/domain/utils'
import { versionIsMutable } from 'src/domain/version'
import { ListSecretsResponse } from 'src/grpc/protobuf/proto/common'
import ConfigBundleMapper from '../config.bundle/config.bundle.mapper'
import DeployMapper from '../deploy/deploy.mapper'
import ImageMapper from '../image/image.mapper'
import ProjectMapper from '../project/project.mapper'
import VersionMapper from '../version/version.mapper'
import { ConfigUpdatedMessage } from './container-config.message'
import {
  ContainerConfigDataDto,
  ContainerConfigDetailsDto,
  ContainerConfigDto,
  ContainerConfigParentDto,
  ContainerConfigRelationsDto,
  ContainerConfigTypeDto,
  ContainerSecretsDto,
} from './container.dto'

@Injectable()
export default class ContainerMapper {
  constructor(
    private readonly projectMapper: ProjectMapper,
    private readonly versionMapper: VersionMapper,
    @Inject(forwardRef(() => ImageMapper))
    private readonly imageMapper: ImageMapper,
    @Inject(forwardRef(() => DeployMapper))
    private readonly deployMapper: DeployMapper,
    @Inject(forwardRef(() => ConfigBundleMapper))
    private readonly configBundleMapper: ConfigBundleMapper,
  ) {}

  typeToDto(type: ContainerConfigType): ContainerConfigTypeDto {
    switch (type) {
      case 'configBundle':
        return 'config-bundle'
      default:
        return type
    }
  }

  configDataToDto(config: ContainerConfig): ContainerConfigDto {
    if (!config) {
      return null
    }

    const containerConfig = this.dbConfigToContainerConfigData(config)

    return {
      ...containerConfig,
      id: config.id,
      type: this.typeToDto(config.type),
      capabilities: null,
      storage: !containerConfig.storageSet
        ? null
        : {
            storageId: containerConfig.storageId,
            bucket: containerConfig.storageConfig?.bucket,
            path: containerConfig.storageConfig?.path,
          },
    }
  }

  configDetailsToDto(config: ContainerConfigDetails): ContainerConfigDetailsDto {
    return {
      ...this.configDataToDto(config),
      parent: this.configDetailsToParentDto(config),
      updatedAt: config.updatedAt,
      updatedBy: config.updatedBy,
    }
  }

  configRelationsToDto(config: ContainerConfigRelations): ContainerConfigRelationsDto {
    switch (config.type) {
      case 'image': {
        const { version } = config.image

        return {
          image: this.imageMapper.toDetailsDto(config.image),
          project: this.projectMapper.toBasicDto(version.project),
          version: this.versionMapper.toBasicDto(version),
        }
      }
      case 'instance': {
        const { deployment } = config.instance
        const { version } = deployment

        return {
          image: this.imageMapper.toDetailsDto(config.instance.image),
          project: this.projectMapper.toBasicDto(version.project),
          version: this.versionMapper.toBasicDto(version),
          deployment: this.deployMapper.toDeploymentWithConfigDto(deployment),
        }
      }
      case 'deployment': {
        const { deployment } = config
        const { version } = deployment

        return {
          project: this.projectMapper.toBasicDto(version.project),
          version: this.versionMapper.toBasicDto(version),
          deployment: this.deployMapper.toDeploymentWithConfigDto(deployment),
        }
      }
      case 'configBundle':
        return {
          configBundle: this.configBundleMapper.toDto(config.configBundle),
        }
      default:
        throw new Error(`Unknown ContainerConfigType ${config.type}`)
    }
  }

  secretsResponseToDto(secrets: ListSecretsResponse): ContainerSecretsDto {
    return {
      keys: secrets.keys ?? [],
      publicKey: secrets.publicKey,
    }
  }

  configDtoToConfigData<ConfigData extends ContainerConfigData, ConfigDataDto extends ContainerConfigDataDto>(
    current: ConfigData,
    patch: ConfigDataDto,
  ): ConfigData {
    let result: ConfigData = {
      ...current,
      ...patch,
    }

    if (typeof patch.storage === 'object' && patch.storage !== null) {
      result = {
        ...result,
        storageSet: true,
        storageId: patch.storage.storageId ?? null,
        storageConfig: patch.storage.storageId
          ? {
              path: patch.storage.path,
              bucket: patch.storage.bucket,
            }
          : null,
      }
    } else {
      result.storageSet = current.storageId && !!current.storageConfig
    }

    if (typeof patch.annotations === 'object' && patch.annotations !== null) {
      result = {
        ...result,
        annotations: {
          ...(current.annotations ?? {}),
          ...patch.annotations,
        },
      }
    }

    if (typeof patch.labels === 'object' && patch.labels !== null) {
      result = {
        ...result,
        labels: {
          ...(current.labels ?? {}),
          ...patch.labels,
        },
      }
    }

    return result
  }

  dbConfigToContainerConfigData<ConfigData extends ContainerConfigData>(dbConfig: ContainerConfig): ConfigData {
    const config = {
      ...dbConfig,
    }

    delete config.id
    delete config.type
    delete config.updatedBy
    delete config.updatedAt

    return {
      name: config.name ?? null,
      expose: config.expose ?? null,
      routing: config.routing ?? null,
      configContainer: config.configContainer ?? null,
      user: toNullableNumber(config.user),
      workingDirectory: config.workingDirectory ?? null,
      tty: toNullableBoolean(config.tty),
      ports: config.ports ?? null,
      portRanges: config.portRanges ?? null,
      volumes: config.volumes ?? null,
      commands: config.commands ?? null,
      args: config.args ?? null,
      environment: config.environment ?? null,
      secrets: config.secrets ?? null,
      initContainers: config.initContainers ?? null,
      logConfig: config.logConfig ?? null,
      storageSet: toNullableBoolean(config.storageSet),
      storageId: config.storageId ?? null,
      storageConfig: config.storageSet ? config.storageConfig : null,

      // dagent
      restartPolicy: config.restartPolicy ?? null,
      networkMode: config.networkMode ?? null,
      networks: config.networks ?? null,
      dockerLabels: config.dockerLabels ?? null,
      expectedState: config.expectedState ?? null,

      // crane
      deploymentStrategy: config.deploymentStrategy ?? null,
      healthCheckConfig: config.healthCheckConfig ?? null,
      resourceConfig: config.resourceConfig ?? null,
      proxyHeaders: toNullableBoolean(config.proxyHeaders),
      useLoadBalancer: toNullableBoolean(config.useLoadBalancer),
      customHeaders: config.customHeaders ?? null,
      extraLBAnnotations: config.extraLBAnnotations ?? null,
      capabilities: config.capabilities ?? null,
      annotations: config.annotations ?? null,
      labels: config.labels ?? null,
      metrics: config.metrics ?? null,
    } as any as ConfigData
  }

  dbConfigToCreateConfigStatement(
    config: Omit<ContainerConfig, 'id'>,
  ): Omit<ContainerConfig, 'id' | 'updatedAt' | 'updatedBy'> {
    return {
      type: config.type,
      // common
      name: config.name ?? null,
      expose: config.expose ?? null,
      routing: toPrismaJson(config.routing),
      configContainer: toPrismaJson(config.configContainer) ?? null,
      user: toNullableNumber(config.user),
      workingDirectory: config.workingDirectory ?? null,
      tty: toNullableBoolean(config.tty),
      ports: toPrismaJsonArray(config.ports),
      portRanges: toPrismaJsonArray(config.portRanges),
      volumes: toPrismaJsonArray(config.volumes),
      commands: toPrismaJsonArray(config.commands),
      args: toPrismaJsonArray(config.args),
      environment: toPrismaJsonArray(config.environment),
      secrets: toPrismaJsonArray(config.secrets),
      initContainers: toPrismaJsonArray(config.initContainers),
      logConfig: toPrismaJson(config.logConfig),
      storageSet: toNullableBoolean(config.storageSet),
      storageId: config.storageId ?? null,
      storageConfig: toPrismaJson(config.storageConfig),

      // dagent
      restartPolicy: config.restartPolicy ?? null,
      networkMode: config.networkMode ?? null,
      networks: toPrismaJsonArray(config.networks),
      dockerLabels: toPrismaJsonArray(config.dockerLabels),
      expectedState: toPrismaJson(config.expectedState),

      // crane
      deploymentStrategy: config.deploymentStrategy ?? null,
      healthCheckConfig: toPrismaJson(config.healthCheckConfig),
      resourceConfig: toPrismaJson(config.resourceConfig),
      proxyHeaders: toNullableBoolean(config.proxyHeaders),
      useLoadBalancer: toNullableBoolean(config.useLoadBalancer),
      customHeaders: toPrismaJsonArray(config.customHeaders),
      extraLBAnnotations: toPrismaJsonArray(config.extraLBAnnotations),
      capabilities: toPrismaJsonArray(config.capabilities),
      annotations: toPrismaJson(config.annotations),
      labels: toPrismaJson(config.labels),
      metrics: toPrismaJson(config.metrics),
    }
  }

  configDataToDbPatch(config: ContainerConfigData): ContainerConfigDbPatch {
    return {
      name: 'name' in config ? (config.name ?? null) : undefined,
      expose: 'expose' in config ? (config.expose ?? null) : undefined,
      routing: 'routing' in config ? toPrismaJson(config.routing) : undefined,
      configContainer: 'configContainer' in config ? toPrismaJson(config.configContainer) : undefined,
      user: 'user' in config ? toNullableNumber(config.user) : undefined,
      workingDirectory: 'workingDirectory' in config ? (config.workingDirectory ?? null) : undefined,
      tty: 'tty' in config ? toNullableBoolean(config.tty) : undefined,
      ports: 'ports' in config ? toPrismaJsonArray(config.ports) : undefined,
      portRanges: 'portRanges' in config ? toPrismaJsonArray(config.portRanges) : undefined,
      volumes: 'volumes' in config ? toPrismaJsonArray(config.volumes) : undefined,
      commands: 'commands' in config ? toPrismaJsonArray(config.commands) : undefined,
      args: 'args' in config ? toPrismaJsonArray(config.args) : undefined,
      environment: 'environment' in config ? toPrismaJsonArray(config.environment) : undefined,
      secrets: 'secrets' in config ? toPrismaJsonArray(config.secrets) : undefined,
      initContainers: 'initContainers' in config ? toPrismaJsonArray(config.initContainers) : undefined,
      logConfig: 'logConfig' in config ? toPrismaJson(config.logConfig) : undefined,
      storageSet: 'storageSet' in config ? toNullableBoolean(config.storageSet) : undefined,
      storageId: 'storageId' in config ? (config.storageId ?? null) : undefined,
      storageConfig: 'storageConfig' in config ? toPrismaJson(config.storageConfig) : undefined,

      // dagent
      restartPolicy: 'restartPolicy' in config ? (config.restartPolicy ?? null) : undefined,
      networkMode: 'networkMode' in config ? (config.networkMode ?? null) : undefined,
      networks: 'networks' in config ? toPrismaJsonArray(config.networks) : undefined,
      dockerLabels: 'dockerLabels' in config ? toPrismaJsonArray(config.dockerLabels) : undefined,
      expectedState: 'expectedState' in config ? toPrismaJson(config.expectedState) : undefined,

      // crane
      deploymentStrategy: 'deploymentStrategy' in config ? (config.deploymentStrategy ?? null) : undefined,
      healthCheckConfig: 'healthCheckConfig' in config ? toPrismaJson(config.healthCheckConfig) : undefined,
      resourceConfig: 'resourceConfig' in config ? toPrismaJson(config.resourceConfig) : undefined,
      proxyHeaders: 'proxyHeaders' in config ? toNullableBoolean(config.proxyHeaders) : undefined,
      useLoadBalancer: 'useLoadBalancer' in config ? toNullableBoolean(config.useLoadBalancer) : undefined,
      customHeaders: 'customHeaders' in config ? toPrismaJsonArray(config.customHeaders) : undefined,
      extraLBAnnotations: 'extraLBAnnotations' in config ? toPrismaJsonArray(config.extraLBAnnotations) : undefined,
      capabilities: 'capabilities' in config ? toPrismaJsonArray(config.capabilities) : undefined,
      annotations: 'annotations' in config ? toPrismaJson(config.annotations) : undefined,
      labels: 'labels' in config ? toPrismaJson(config.labels) : undefined,
      metrics: 'metrics' in config ? toPrismaJson(config.metrics) : undefined,
    }
  }

  configUpdatedEventToMessage(event: ContainerConfigUpdatedEvent): ConfigUpdatedMessage {
    return {
      ...event.patch,
      id: event.id,
    }
  }

  private configDetailsToParentDto(config: ContainerConfigDetails): ContainerConfigParentDto {
    switch (config.type) {
      case 'image': {
        const { image } = config

        return {
          id: image.id,
          name: image.name,
          mutable: versionIsMutable(image.version),
        }
      }
      case 'instance': {
        const { instance } = config
        const { image, deployment } = instance

        return {
          id: image.id,
          name: image.name,
          mutable: deploymentIsMutable(deployment.status, deployment.version.type),
        }
      }
      case 'deployment': {
        const { deployment } = config

        return {
          id: deployment.id,
          name: deployment.prefix,
          mutable: deploymentIsMutable(deployment.status, deployment.version.type),
        }
      }
      case 'configBundle': {
        const { configBundle } = config

        return {
          id: configBundle.id,
          name: configBundle.name,
          mutable: true,
        }
      }
      default:
        throw new Error(`Unknown ContainerConfigType ${config.type}`)
    }
  }
}

type ContainerConfigRelations = {
  type: ContainerConfigType
  image: ImageDetails & {
    version: Version & {
      project: Project
    }
  }
  instance: {
    image: ImageDetails
    deployment: DeploymentWithConfigAndBundles
  }
  deployment: DeploymentWithConfigAndBundles
  configBundle: ConfigBundle
}

type ContainerConfigDetails = ContainerConfig & {
  image: Image & {
    version: Version & {
      deployments: {
        status: DeploymentStatusEnum
      }[]
      children: VersionsOnParentVersion[]
    }
  }
  instance: {
    image: Image
    deployment: Deployment & {
      version: Version
    }
  }
  deployment: Deployment & {
    version: Version
  }
  configBundle: ConfigBundle
}

export type ContainerConfigDbPatch = Omit<ContainerConfig, 'id' | 'type' | 'updatedAt' | 'updatedBy'>
