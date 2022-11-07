/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices'
import { util, configure } from 'protobufjs/minimal'
import * as Long from 'long'
import {
  DriverType,
  VolumeType,
  RestartPolicy,
  NetworkMode,
  DeploymentStrategy,
  HealthCheckConfig,
  ResourceConfig,
  ExposeStrategy,
  Ingress,
  ConfigContainer,
  Empty,
  volumeTypeFromJSON,
  volumeTypeToJSON,
  driverTypeFromJSON,
  driverTypeToJSON,
  restartPolicyFromJSON,
  networkModeFromJSON,
  restartPolicyToJSON,
  networkModeToJSON,
  deploymentStrategyFromJSON,
  deploymentStrategyToJSON,
  exposeStrategyFromJSON,
  exposeStrategyToJSON,
  ListSecretsResponse,
  DeploymentStatusMessage,
  ContainerStateListMessage,
} from './common'
import { Observable } from 'rxjs'
import { Metadata } from '@grpc/grpc-js'

export const protobufPackage = 'agent'

/**
 * Container agent interface messages and service definitions
 * Logs, statuses, deployments
 */

/**  */
export interface AgentInfo {
  id: string
  version: string
  publicKey: string
}

export interface AgentCommand {
  deploy: VersionDeployRequest | undefined
  containerState: ContainerStateRequest | undefined
  containerDelete: ContainerDeleteRequest | undefined
  deployLegacy: DeployRequestLegacy | undefined
  listSecrets: ListSecretsRequest | undefined
}

/**
 * This is more of a placeholder, we could include more, or return this
 * instantly after validation success.
 */
export interface DeployResponse {
  started: boolean
}

export interface VersionDeployRequest {
  id: string
  versionName: string
  releaseNotes: string
  requests: DeployRequest[]
}

/** Request for a keys of existing secrets in a prefix, eg. namespace */
export interface ListSecretsRequest {
  prefix: string
  name: string
}

/** Deploys a single container */
export interface Environment {
  env: string[]
}

export interface InstanceConfig {
  /**
   * prefix mapped into host folder structure,
   * used as namespace id
   */
  prefix: string
  /** mount path of instance (docker only) */
  mountPath?: string | undefined
  /** environment variable map (piped) */
  environment?: Environment | undefined
  /** registry repo prefix */
  repositoryPrefix?: string | undefined
}

export interface RegistryAuth {
  name: string
  url: string
  user: string
  password: string
}

export interface Port {
  internal: number
  external: number
}

export interface PortRange {
  from: number
  to: number
}

export interface PortRangeBinding {
  internal: PortRange | undefined
  external: PortRange | undefined
}

export interface Volume {
  name: string
  path: string
  size?: string | undefined
  type?: VolumeType | undefined
  class?: string | undefined
}

export interface VolumeLink {
  name: string
  path: string
}

export interface InitContainer {
  name: string
  image: string
  useParentConfig?: boolean | undefined
  volumes: VolumeLink[]
  command: string[]
  args: string[]
  environment: { [key: string]: string }
}

export interface InitContainer_EnvironmentEntry {
  key: string
  value: string
}

export interface ImportContainer {
  volume: string
  command: string
  environment: { [key: string]: string }
}

export interface ImportContainer_EnvironmentEntry {
  key: string
  value: string
}

export interface LogConfig {
  driver: DriverType
  options: { [key: string]: string }
}

export interface LogConfig_OptionsEntry {
  key: string
  value: string
}

export interface DagentContainerConfig {
  logConfig?: LogConfig | undefined
  restartPolicy?: RestartPolicy | undefined
  networkMode?: NetworkMode | undefined
  networks: string[]
}

export interface CraneContainerConfig {
  deploymentStatregy?: DeploymentStrategy | undefined
  healthCheckConfig?: HealthCheckConfig | undefined
  resourceConfig?: ResourceConfig | undefined
  proxyHeaders?: boolean | undefined
  useLoadBalancer?: boolean | undefined
  customHeaders: string[]
  extraLBAnnotations: { [key: string]: string }
}

export interface CraneContainerConfig_ExtraLBAnnotationsEntry {
  key: string
  value: string
}

export interface CommonContainerConfig {
  name: string
  expose?: ExposeStrategy | undefined
  ingress?: Ingress | undefined
  configContainer?: ConfigContainer | undefined
  importContainer?: ImportContainer | undefined
  user?: number | undefined
  TTY?: boolean | undefined
  ports: Port[]
  portRanges: PortRangeBinding[]
  volumes: Volume[]
  commands: string[]
  args: string[]
  environment: string[]
  secrets: { [key: string]: string }
  initContainers: InitContainer[]
}

export interface CommonContainerConfig_SecretsEntry {
  key: string
  value: string
}

export interface DeployRequest {
  id: string
  containerName: string
  /** InstanceConfig is set for multiple containers */
  instanceConfig: InstanceConfig | undefined
  /** ContainerConfigs */
  common?: CommonContainerConfig | undefined
  dagent?: DagentContainerConfig | undefined
  crane?: CraneContainerConfig | undefined
  /** Runtime info and requirements of a container */
  runtimeConfig?: string | undefined
  registry?: string | undefined
  imageName: string
  tag: string
  registryAuth?: RegistryAuth | undefined
}

export interface ContainerStateRequest {
  prefix?: string | undefined
  oneShot?: boolean | undefined
}

export interface ContainerDeleteRequest {
  prefix: string
  name: string
}

export interface DeployRequestLegacy {
  /** for early dogger logging */
  requestId: string
  json: string
}

export const AGENT_PACKAGE_NAME = 'agent'

const baseAgentInfo: object = { id: '', version: '', publicKey: '' }

export const AgentInfo = {
  fromJSON(object: any): AgentInfo {
    const message = { ...baseAgentInfo } as AgentInfo
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.version = object.version !== undefined && object.version !== null ? String(object.version) : ''
    message.publicKey = object.publicKey !== undefined && object.publicKey !== null ? String(object.publicKey) : ''
    return message
  },

  toJSON(message: AgentInfo): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.version !== undefined && (obj.version = message.version)
    message.publicKey !== undefined && (obj.publicKey = message.publicKey)
    return obj
  },
}

const baseAgentCommand: object = {}

export const AgentCommand = {
  fromJSON(object: any): AgentCommand {
    const message = { ...baseAgentCommand } as AgentCommand
    message.deploy =
      object.deploy !== undefined && object.deploy !== null ? VersionDeployRequest.fromJSON(object.deploy) : undefined
    message.containerState =
      object.containerState !== undefined && object.containerState !== null
        ? ContainerStateRequest.fromJSON(object.containerState)
        : undefined
    message.containerDelete =
      object.containerDelete !== undefined && object.containerDelete !== null
        ? ContainerDeleteRequest.fromJSON(object.containerDelete)
        : undefined
    message.deployLegacy =
      object.deployLegacy !== undefined && object.deployLegacy !== null
        ? DeployRequestLegacy.fromJSON(object.deployLegacy)
        : undefined
    message.listSecrets =
      object.listSecrets !== undefined && object.listSecrets !== null
        ? ListSecretsRequest.fromJSON(object.listSecrets)
        : undefined
    return message
  },

  toJSON(message: AgentCommand): unknown {
    const obj: any = {}
    message.deploy !== undefined &&
      (obj.deploy = message.deploy ? VersionDeployRequest.toJSON(message.deploy) : undefined)
    message.containerState !== undefined &&
      (obj.containerState = message.containerState ? ContainerStateRequest.toJSON(message.containerState) : undefined)
    message.containerDelete !== undefined &&
      (obj.containerDelete = message.containerDelete
        ? ContainerDeleteRequest.toJSON(message.containerDelete)
        : undefined)
    message.deployLegacy !== undefined &&
      (obj.deployLegacy = message.deployLegacy ? DeployRequestLegacy.toJSON(message.deployLegacy) : undefined)
    message.listSecrets !== undefined &&
      (obj.listSecrets = message.listSecrets ? ListSecretsRequest.toJSON(message.listSecrets) : undefined)
    return obj
  },
}

const baseDeployResponse: object = { started: false }

export const DeployResponse = {
  fromJSON(object: any): DeployResponse {
    const message = { ...baseDeployResponse } as DeployResponse
    message.started = object.started !== undefined && object.started !== null ? Boolean(object.started) : false
    return message
  },

  toJSON(message: DeployResponse): unknown {
    const obj: any = {}
    message.started !== undefined && (obj.started = message.started)
    return obj
  },
}

const baseVersionDeployRequest: object = {
  id: '',
  versionName: '',
  releaseNotes: '',
}

export const VersionDeployRequest = {
  fromJSON(object: any): VersionDeployRequest {
    const message = { ...baseVersionDeployRequest } as VersionDeployRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.versionName =
      object.versionName !== undefined && object.versionName !== null ? String(object.versionName) : ''
    message.releaseNotes =
      object.releaseNotes !== undefined && object.releaseNotes !== null ? String(object.releaseNotes) : ''
    message.requests = (object.requests ?? []).map((e: any) => DeployRequest.fromJSON(e))
    return message
  },

  toJSON(message: VersionDeployRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.versionName !== undefined && (obj.versionName = message.versionName)
    message.releaseNotes !== undefined && (obj.releaseNotes = message.releaseNotes)
    if (message.requests) {
      obj.requests = message.requests.map(e => (e ? DeployRequest.toJSON(e) : undefined))
    } else {
      obj.requests = []
    }
    return obj
  },
}

const baseListSecretsRequest: object = { prefix: '', name: '' }

export const ListSecretsRequest = {
  fromJSON(object: any): ListSecretsRequest {
    const message = { ...baseListSecretsRequest } as ListSecretsRequest
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    return message
  },

  toJSON(message: ListSecretsRequest): unknown {
    const obj: any = {}
    message.prefix !== undefined && (obj.prefix = message.prefix)
    message.name !== undefined && (obj.name = message.name)
    return obj
  },
}

const baseEnvironment: object = { env: '' }

export const Environment = {
  fromJSON(object: any): Environment {
    const message = { ...baseEnvironment } as Environment
    message.env = (object.env ?? []).map((e: any) => String(e))
    return message
  },

  toJSON(message: Environment): unknown {
    const obj: any = {}
    if (message.env) {
      obj.env = message.env.map(e => e)
    } else {
      obj.env = []
    }
    return obj
  },
}

const baseInstanceConfig: object = { prefix: '' }

export const InstanceConfig = {
  fromJSON(object: any): InstanceConfig {
    const message = { ...baseInstanceConfig } as InstanceConfig
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : ''
    message.mountPath =
      object.mountPath !== undefined && object.mountPath !== null ? String(object.mountPath) : undefined
    message.environment =
      object.environment !== undefined && object.environment !== null
        ? Environment.fromJSON(object.environment)
        : undefined
    message.repositoryPrefix =
      object.repositoryPrefix !== undefined && object.repositoryPrefix !== null
        ? String(object.repositoryPrefix)
        : undefined
    return message
  },

  toJSON(message: InstanceConfig): unknown {
    const obj: any = {}
    message.prefix !== undefined && (obj.prefix = message.prefix)
    message.mountPath !== undefined && (obj.mountPath = message.mountPath)
    message.environment !== undefined &&
      (obj.environment = message.environment ? Environment.toJSON(message.environment) : undefined)
    message.repositoryPrefix !== undefined && (obj.repositoryPrefix = message.repositoryPrefix)
    return obj
  },
}

const baseRegistryAuth: object = { name: '', url: '', user: '', password: '' }

export const RegistryAuth = {
  fromJSON(object: any): RegistryAuth {
    const message = { ...baseRegistryAuth } as RegistryAuth
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.url = object.url !== undefined && object.url !== null ? String(object.url) : ''
    message.user = object.user !== undefined && object.user !== null ? String(object.user) : ''
    message.password = object.password !== undefined && object.password !== null ? String(object.password) : ''
    return message
  },

  toJSON(message: RegistryAuth): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.url !== undefined && (obj.url = message.url)
    message.user !== undefined && (obj.user = message.user)
    message.password !== undefined && (obj.password = message.password)
    return obj
  },
}

const basePort: object = { internal: 0, external: 0 }

export const Port = {
  fromJSON(object: any): Port {
    const message = { ...basePort } as Port
    message.internal = object.internal !== undefined && object.internal !== null ? Number(object.internal) : 0
    message.external = object.external !== undefined && object.external !== null ? Number(object.external) : 0
    return message
  },

  toJSON(message: Port): unknown {
    const obj: any = {}
    message.internal !== undefined && (obj.internal = Math.round(message.internal))
    message.external !== undefined && (obj.external = Math.round(message.external))
    return obj
  },
}

const basePortRange: object = { from: 0, to: 0 }

export const PortRange = {
  fromJSON(object: any): PortRange {
    const message = { ...basePortRange } as PortRange
    message.from = object.from !== undefined && object.from !== null ? Number(object.from) : 0
    message.to = object.to !== undefined && object.to !== null ? Number(object.to) : 0
    return message
  },

  toJSON(message: PortRange): unknown {
    const obj: any = {}
    message.from !== undefined && (obj.from = Math.round(message.from))
    message.to !== undefined && (obj.to = Math.round(message.to))
    return obj
  },
}

const basePortRangeBinding: object = {}

export const PortRangeBinding = {
  fromJSON(object: any): PortRangeBinding {
    const message = { ...basePortRangeBinding } as PortRangeBinding
    message.internal =
      object.internal !== undefined && object.internal !== null ? PortRange.fromJSON(object.internal) : undefined
    message.external =
      object.external !== undefined && object.external !== null ? PortRange.fromJSON(object.external) : undefined
    return message
  },

  toJSON(message: PortRangeBinding): unknown {
    const obj: any = {}
    message.internal !== undefined && (obj.internal = message.internal ? PortRange.toJSON(message.internal) : undefined)
    message.external !== undefined && (obj.external = message.external ? PortRange.toJSON(message.external) : undefined)
    return obj
  },
}

const baseVolume: object = { name: '', path: '' }

export const Volume = {
  fromJSON(object: any): Volume {
    const message = { ...baseVolume } as Volume
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.path = object.path !== undefined && object.path !== null ? String(object.path) : ''
    message.size = object.size !== undefined && object.size !== null ? String(object.size) : undefined
    message.type = object.type !== undefined && object.type !== null ? volumeTypeFromJSON(object.type) : undefined
    message.class = object.class !== undefined && object.class !== null ? String(object.class) : undefined
    return message
  },

  toJSON(message: Volume): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.path !== undefined && (obj.path = message.path)
    message.size !== undefined && (obj.size = message.size)
    message.type !== undefined && (obj.type = message.type !== undefined ? volumeTypeToJSON(message.type) : undefined)
    message.class !== undefined && (obj.class = message.class)
    return obj
  },
}

const baseVolumeLink: object = { name: '', path: '' }

export const VolumeLink = {
  fromJSON(object: any): VolumeLink {
    const message = { ...baseVolumeLink } as VolumeLink
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.path = object.path !== undefined && object.path !== null ? String(object.path) : ''
    return message
  },

  toJSON(message: VolumeLink): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.path !== undefined && (obj.path = message.path)
    return obj
  },
}

const baseInitContainer: object = {
  name: '',
  image: '',
  command: '',
  args: '',
}

export const InitContainer = {
  fromJSON(object: any): InitContainer {
    const message = { ...baseInitContainer } as InitContainer
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.image = object.image !== undefined && object.image !== null ? String(object.image) : ''
    message.useParentConfig =
      object.useParentConfig !== undefined && object.useParentConfig !== null
        ? Boolean(object.useParentConfig)
        : undefined
    message.volumes = (object.volumes ?? []).map((e: any) => VolumeLink.fromJSON(e))
    message.command = (object.command ?? []).map((e: any) => String(e))
    message.args = (object.args ?? []).map((e: any) => String(e))
    message.environment = Object.entries(object.environment ?? {}).reduce<{
      [key: string]: string
    }>((acc, [key, value]) => {
      acc[key] = String(value)
      return acc
    }, {})
    return message
  },

  toJSON(message: InitContainer): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.image !== undefined && (obj.image = message.image)
    message.useParentConfig !== undefined && (obj.useParentConfig = message.useParentConfig)
    if (message.volumes) {
      obj.volumes = message.volumes.map(e => (e ? VolumeLink.toJSON(e) : undefined))
    } else {
      obj.volumes = []
    }
    if (message.command) {
      obj.command = message.command.map(e => e)
    } else {
      obj.command = []
    }
    if (message.args) {
      obj.args = message.args.map(e => e)
    } else {
      obj.args = []
    }
    obj.environment = {}
    if (message.environment) {
      Object.entries(message.environment).forEach(([k, v]) => {
        obj.environment[k] = v
      })
    }
    return obj
  },
}

const baseInitContainer_EnvironmentEntry: object = { key: '', value: '' }

export const InitContainer_EnvironmentEntry = {
  fromJSON(object: any): InitContainer_EnvironmentEntry {
    const message = {
      ...baseInitContainer_EnvironmentEntry,
    } as InitContainer_EnvironmentEntry
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    message.value = object.value !== undefined && object.value !== null ? String(object.value) : ''
    return message
  },

  toJSON(message: InitContainer_EnvironmentEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

const baseImportContainer: object = { volume: '', command: '' }

export const ImportContainer = {
  fromJSON(object: any): ImportContainer {
    const message = { ...baseImportContainer } as ImportContainer
    message.volume = object.volume !== undefined && object.volume !== null ? String(object.volume) : ''
    message.command = object.command !== undefined && object.command !== null ? String(object.command) : ''
    message.environment = Object.entries(object.environment ?? {}).reduce<{
      [key: string]: string
    }>((acc, [key, value]) => {
      acc[key] = String(value)
      return acc
    }, {})
    return message
  },

  toJSON(message: ImportContainer): unknown {
    const obj: any = {}
    message.volume !== undefined && (obj.volume = message.volume)
    message.command !== undefined && (obj.command = message.command)
    obj.environment = {}
    if (message.environment) {
      Object.entries(message.environment).forEach(([k, v]) => {
        obj.environment[k] = v
      })
    }
    return obj
  },
}

const baseImportContainer_EnvironmentEntry: object = { key: '', value: '' }

export const ImportContainer_EnvironmentEntry = {
  fromJSON(object: any): ImportContainer_EnvironmentEntry {
    const message = {
      ...baseImportContainer_EnvironmentEntry,
    } as ImportContainer_EnvironmentEntry
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    message.value = object.value !== undefined && object.value !== null ? String(object.value) : ''
    return message
  },

  toJSON(message: ImportContainer_EnvironmentEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

const baseLogConfig: object = { driver: 0 }

export const LogConfig = {
  fromJSON(object: any): LogConfig {
    const message = { ...baseLogConfig } as LogConfig
    message.driver = object.driver !== undefined && object.driver !== null ? driverTypeFromJSON(object.driver) : 0
    message.options = Object.entries(object.options ?? {}).reduce<{
      [key: string]: string
    }>((acc, [key, value]) => {
      acc[key] = String(value)
      return acc
    }, {})
    return message
  },

  toJSON(message: LogConfig): unknown {
    const obj: any = {}
    message.driver !== undefined && (obj.driver = driverTypeToJSON(message.driver))
    obj.options = {}
    if (message.options) {
      Object.entries(message.options).forEach(([k, v]) => {
        obj.options[k] = v
      })
    }
    return obj
  },
}

const baseLogConfig_OptionsEntry: object = { key: '', value: '' }

export const LogConfig_OptionsEntry = {
  fromJSON(object: any): LogConfig_OptionsEntry {
    const message = { ...baseLogConfig_OptionsEntry } as LogConfig_OptionsEntry
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    message.value = object.value !== undefined && object.value !== null ? String(object.value) : ''
    return message
  },

  toJSON(message: LogConfig_OptionsEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

const baseDagentContainerConfig: object = { networks: '' }

export const DagentContainerConfig = {
  fromJSON(object: any): DagentContainerConfig {
    const message = { ...baseDagentContainerConfig } as DagentContainerConfig
    message.logConfig =
      object.logConfig !== undefined && object.logConfig !== null ? LogConfig.fromJSON(object.logConfig) : undefined
    message.restartPolicy =
      object.restartPolicy !== undefined && object.restartPolicy !== null
        ? restartPolicyFromJSON(object.restartPolicy)
        : undefined
    message.networkMode =
      object.networkMode !== undefined && object.networkMode !== null
        ? networkModeFromJSON(object.networkMode)
        : undefined
    message.networks = (object.networks ?? []).map((e: any) => String(e))
    return message
  },

  toJSON(message: DagentContainerConfig): unknown {
    const obj: any = {}
    message.logConfig !== undefined &&
      (obj.logConfig = message.logConfig ? LogConfig.toJSON(message.logConfig) : undefined)
    message.restartPolicy !== undefined &&
      (obj.restartPolicy = message.restartPolicy !== undefined ? restartPolicyToJSON(message.restartPolicy) : undefined)
    message.networkMode !== undefined &&
      (obj.networkMode = message.networkMode !== undefined ? networkModeToJSON(message.networkMode) : undefined)
    if (message.networks) {
      obj.networks = message.networks.map(e => e)
    } else {
      obj.networks = []
    }
    return obj
  },
}

const baseCraneContainerConfig: object = { customHeaders: '' }

export const CraneContainerConfig = {
  fromJSON(object: any): CraneContainerConfig {
    const message = { ...baseCraneContainerConfig } as CraneContainerConfig
    message.deploymentStatregy =
      object.deploymentStatregy !== undefined && object.deploymentStatregy !== null
        ? deploymentStrategyFromJSON(object.deploymentStatregy)
        : undefined
    message.healthCheckConfig =
      object.healthCheckConfig !== undefined && object.healthCheckConfig !== null
        ? HealthCheckConfig.fromJSON(object.healthCheckConfig)
        : undefined
    message.resourceConfig =
      object.resourceConfig !== undefined && object.resourceConfig !== null
        ? ResourceConfig.fromJSON(object.resourceConfig)
        : undefined
    message.proxyHeaders =
      object.proxyHeaders !== undefined && object.proxyHeaders !== null ? Boolean(object.proxyHeaders) : undefined
    message.useLoadBalancer =
      object.useLoadBalancer !== undefined && object.useLoadBalancer !== null
        ? Boolean(object.useLoadBalancer)
        : undefined
    message.customHeaders = (object.customHeaders ?? []).map((e: any) => String(e))
    message.extraLBAnnotations = Object.entries(object.extraLBAnnotations ?? {}).reduce<{ [key: string]: string }>(
      (acc, [key, value]) => {
        acc[key] = String(value)
        return acc
      },
      {},
    )
    return message
  },

  toJSON(message: CraneContainerConfig): unknown {
    const obj: any = {}
    message.deploymentStatregy !== undefined &&
      (obj.deploymentStatregy =
        message.deploymentStatregy !== undefined ? deploymentStrategyToJSON(message.deploymentStatregy) : undefined)
    message.healthCheckConfig !== undefined &&
      (obj.healthCheckConfig = message.healthCheckConfig
        ? HealthCheckConfig.toJSON(message.healthCheckConfig)
        : undefined)
    message.resourceConfig !== undefined &&
      (obj.resourceConfig = message.resourceConfig ? ResourceConfig.toJSON(message.resourceConfig) : undefined)
    message.proxyHeaders !== undefined && (obj.proxyHeaders = message.proxyHeaders)
    message.useLoadBalancer !== undefined && (obj.useLoadBalancer = message.useLoadBalancer)
    if (message.customHeaders) {
      obj.customHeaders = message.customHeaders.map(e => e)
    } else {
      obj.customHeaders = []
    }
    obj.extraLBAnnotations = {}
    if (message.extraLBAnnotations) {
      Object.entries(message.extraLBAnnotations).forEach(([k, v]) => {
        obj.extraLBAnnotations[k] = v
      })
    }
    return obj
  },
}

const baseCraneContainerConfig_ExtraLBAnnotationsEntry: object = {
  key: '',
  value: '',
}

export const CraneContainerConfig_ExtraLBAnnotationsEntry = {
  fromJSON(object: any): CraneContainerConfig_ExtraLBAnnotationsEntry {
    const message = {
      ...baseCraneContainerConfig_ExtraLBAnnotationsEntry,
    } as CraneContainerConfig_ExtraLBAnnotationsEntry
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    message.value = object.value !== undefined && object.value !== null ? String(object.value) : ''
    return message
  },

  toJSON(message: CraneContainerConfig_ExtraLBAnnotationsEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

const baseCommonContainerConfig: object = {
  name: '',
  commands: '',
  args: '',
  environment: '',
}

export const CommonContainerConfig = {
  fromJSON(object: any): CommonContainerConfig {
    const message = { ...baseCommonContainerConfig } as CommonContainerConfig
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.expose =
      object.expose !== undefined && object.expose !== null ? exposeStrategyFromJSON(object.expose) : undefined
    message.ingress =
      object.ingress !== undefined && object.ingress !== null ? Ingress.fromJSON(object.ingress) : undefined
    message.configContainer =
      object.configContainer !== undefined && object.configContainer !== null
        ? ConfigContainer.fromJSON(object.configContainer)
        : undefined
    message.importContainer =
      object.importContainer !== undefined && object.importContainer !== null
        ? ImportContainer.fromJSON(object.importContainer)
        : undefined
    message.user = object.user !== undefined && object.user !== null ? Number(object.user) : undefined
    message.TTY = object.TTY !== undefined && object.TTY !== null ? Boolean(object.TTY) : undefined
    message.ports = (object.ports ?? []).map((e: any) => Port.fromJSON(e))
    message.portRanges = (object.portRanges ?? []).map((e: any) => PortRangeBinding.fromJSON(e))
    message.volumes = (object.volumes ?? []).map((e: any) => Volume.fromJSON(e))
    message.commands = (object.commands ?? []).map((e: any) => String(e))
    message.args = (object.args ?? []).map((e: any) => String(e))
    message.environment = (object.environment ?? []).map((e: any) => String(e))
    message.secrets = Object.entries(object.secrets ?? {}).reduce<{
      [key: string]: string
    }>((acc, [key, value]) => {
      acc[key] = String(value)
      return acc
    }, {})
    message.initContainers = (object.initContainers ?? []).map((e: any) => InitContainer.fromJSON(e))
    return message
  },

  toJSON(message: CommonContainerConfig): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.expose !== undefined &&
      (obj.expose = message.expose !== undefined ? exposeStrategyToJSON(message.expose) : undefined)
    message.ingress !== undefined && (obj.ingress = message.ingress ? Ingress.toJSON(message.ingress) : undefined)
    message.configContainer !== undefined &&
      (obj.configContainer = message.configContainer ? ConfigContainer.toJSON(message.configContainer) : undefined)
    message.importContainer !== undefined &&
      (obj.importContainer = message.importContainer ? ImportContainer.toJSON(message.importContainer) : undefined)
    message.user !== undefined && (obj.user = Math.round(message.user))
    message.TTY !== undefined && (obj.TTY = message.TTY)
    if (message.ports) {
      obj.ports = message.ports.map(e => (e ? Port.toJSON(e) : undefined))
    } else {
      obj.ports = []
    }
    if (message.portRanges) {
      obj.portRanges = message.portRanges.map(e => (e ? PortRangeBinding.toJSON(e) : undefined))
    } else {
      obj.portRanges = []
    }
    if (message.volumes) {
      obj.volumes = message.volumes.map(e => (e ? Volume.toJSON(e) : undefined))
    } else {
      obj.volumes = []
    }
    if (message.commands) {
      obj.commands = message.commands.map(e => e)
    } else {
      obj.commands = []
    }
    if (message.args) {
      obj.args = message.args.map(e => e)
    } else {
      obj.args = []
    }
    if (message.environment) {
      obj.environment = message.environment.map(e => e)
    } else {
      obj.environment = []
    }
    obj.secrets = {}
    if (message.secrets) {
      Object.entries(message.secrets).forEach(([k, v]) => {
        obj.secrets[k] = v
      })
    }
    if (message.initContainers) {
      obj.initContainers = message.initContainers.map(e => (e ? InitContainer.toJSON(e) : undefined))
    } else {
      obj.initContainers = []
    }
    return obj
  },
}

const baseCommonContainerConfig_SecretsEntry: object = { key: '', value: '' }

export const CommonContainerConfig_SecretsEntry = {
  fromJSON(object: any): CommonContainerConfig_SecretsEntry {
    const message = {
      ...baseCommonContainerConfig_SecretsEntry,
    } as CommonContainerConfig_SecretsEntry
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    message.value = object.value !== undefined && object.value !== null ? String(object.value) : ''
    return message
  },

  toJSON(message: CommonContainerConfig_SecretsEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

const baseDeployRequest: object = {
  id: '',
  containerName: '',
  imageName: '',
  tag: '',
}

export const DeployRequest = {
  fromJSON(object: any): DeployRequest {
    const message = { ...baseDeployRequest } as DeployRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.containerName =
      object.containerName !== undefined && object.containerName !== null ? String(object.containerName) : ''
    message.instanceConfig =
      object.instanceConfig !== undefined && object.instanceConfig !== null
        ? InstanceConfig.fromJSON(object.instanceConfig)
        : undefined
    message.common =
      object.common !== undefined && object.common !== null ? CommonContainerConfig.fromJSON(object.common) : undefined
    message.dagent =
      object.dagent !== undefined && object.dagent !== null ? DagentContainerConfig.fromJSON(object.dagent) : undefined
    message.crane =
      object.crane !== undefined && object.crane !== null ? CraneContainerConfig.fromJSON(object.crane) : undefined
    message.runtimeConfig =
      object.runtimeConfig !== undefined && object.runtimeConfig !== null ? String(object.runtimeConfig) : undefined
    message.registry = object.registry !== undefined && object.registry !== null ? String(object.registry) : undefined
    message.imageName = object.imageName !== undefined && object.imageName !== null ? String(object.imageName) : ''
    message.tag = object.tag !== undefined && object.tag !== null ? String(object.tag) : ''
    message.registryAuth =
      object.registryAuth !== undefined && object.registryAuth !== null
        ? RegistryAuth.fromJSON(object.registryAuth)
        : undefined
    return message
  },

  toJSON(message: DeployRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.containerName !== undefined && (obj.containerName = message.containerName)
    message.instanceConfig !== undefined &&
      (obj.instanceConfig = message.instanceConfig ? InstanceConfig.toJSON(message.instanceConfig) : undefined)
    message.common !== undefined &&
      (obj.common = message.common ? CommonContainerConfig.toJSON(message.common) : undefined)
    message.dagent !== undefined &&
      (obj.dagent = message.dagent ? DagentContainerConfig.toJSON(message.dagent) : undefined)
    message.crane !== undefined && (obj.crane = message.crane ? CraneContainerConfig.toJSON(message.crane) : undefined)
    message.runtimeConfig !== undefined && (obj.runtimeConfig = message.runtimeConfig)
    message.registry !== undefined && (obj.registry = message.registry)
    message.imageName !== undefined && (obj.imageName = message.imageName)
    message.tag !== undefined && (obj.tag = message.tag)
    message.registryAuth !== undefined &&
      (obj.registryAuth = message.registryAuth ? RegistryAuth.toJSON(message.registryAuth) : undefined)
    return obj
  },
}

const baseContainerStateRequest: object = {}

export const ContainerStateRequest = {
  fromJSON(object: any): ContainerStateRequest {
    const message = { ...baseContainerStateRequest } as ContainerStateRequest
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : undefined
    message.oneShot = object.oneShot !== undefined && object.oneShot !== null ? Boolean(object.oneShot) : undefined
    return message
  },

  toJSON(message: ContainerStateRequest): unknown {
    const obj: any = {}
    message.prefix !== undefined && (obj.prefix = message.prefix)
    message.oneShot !== undefined && (obj.oneShot = message.oneShot)
    return obj
  },
}

const baseContainerDeleteRequest: object = { prefix: '', name: '' }

export const ContainerDeleteRequest = {
  fromJSON(object: any): ContainerDeleteRequest {
    const message = { ...baseContainerDeleteRequest } as ContainerDeleteRequest
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    return message
  },

  toJSON(message: ContainerDeleteRequest): unknown {
    const obj: any = {}
    message.prefix !== undefined && (obj.prefix = message.prefix)
    message.name !== undefined && (obj.name = message.name)
    return obj
  },
}

const baseDeployRequestLegacy: object = { requestId: '', json: '' }

export const DeployRequestLegacy = {
  fromJSON(object: any): DeployRequestLegacy {
    const message = { ...baseDeployRequestLegacy } as DeployRequestLegacy
    message.requestId = object.requestId !== undefined && object.requestId !== null ? String(object.requestId) : ''
    message.json = object.json !== undefined && object.json !== null ? String(object.json) : ''
    return message
  },

  toJSON(message: DeployRequestLegacy): unknown {
    const obj: any = {}
    message.requestId !== undefined && (obj.requestId = message.requestId)
    message.json !== undefined && (obj.json = message.json)
    return obj
  },
}

/** Service handling deployment of containers and fetching statuses */

export interface AgentClient {
  /**
   * Subscribe with pre-assigned AgentID, waiting for incoming
   * deploy requests and prefix status requests.
   * In both cases, separate, shorter-living channels are opened.
   * For deployment status reports, closed when ended.
   * For prefix state reports, should be closed by the server.
   */

  connect(request: AgentInfo, metadata: Metadata, ...rest: any): Observable<AgentCommand>

  deploymentStatus(request: Observable<DeploymentStatusMessage>, metadata: Metadata, ...rest: any): Observable<Empty>

  containerState(request: Observable<ContainerStateListMessage>, metadata: Metadata, ...rest: any): Observable<Empty>

  secretList(request: ListSecretsResponse, metadata: Metadata, ...rest: any): Observable<Empty>
}

/** Service handling deployment of containers and fetching statuses */

export interface AgentController {
  /**
   * Subscribe with pre-assigned AgentID, waiting for incoming
   * deploy requests and prefix status requests.
   * In both cases, separate, shorter-living channels are opened.
   * For deployment status reports, closed when ended.
   * For prefix state reports, should be closed by the server.
   */

  connect(request: AgentInfo, metadata: Metadata, ...rest: any): Observable<AgentCommand>

  deploymentStatus(
    request: Observable<DeploymentStatusMessage>,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty

  containerState(
    request: Observable<ContainerStateListMessage>,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty

  secretList(request: ListSecretsResponse, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty
}

export function AgentControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['connect', 'secretList']
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('Agent', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = ['deploymentStatus', 'containerState']
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcStreamMethod('Agent', method)(constructor.prototype[method], method, descriptor)
    }
  }
}

export const AGENT_SERVICE_NAME = 'Agent'

// If you get a compile-error about 'Constructor<Long> and ... have no overlap',
// add '--ts_proto_opt=esModuleInterop=true' as a flag when calling 'protoc'.
if (util.Long !== Long) {
  util.Long = Long as any
  configure()
}
