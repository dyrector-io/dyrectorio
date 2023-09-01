/* eslint-disable */
import { Metadata } from '@grpc/grpc-js'
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices'
import { Observable } from 'rxjs'
import {
  ConfigContainer,
  ContainerCommandRequest,
  ContainerIdentifier,
  ContainerLogMessage,
  ContainerStateListMessage,
  DeleteContainersRequest,
  DeploymentStatusMessage,
  DeploymentStrategy,
  DriverType,
  Empty,
  ExposeStrategy,
  HealthCheckConfig,
  ListSecretsResponse,
  NetworkMode,
  ResourceConfig,
  RestartPolicy,
  Routing,
  VolumeType,
  deploymentStrategyFromJSON,
  deploymentStrategyToJSON,
  driverTypeFromJSON,
  driverTypeToJSON,
  exposeStrategyFromJSON,
  exposeStrategyToJSON,
  networkModeFromJSON,
  networkModeToJSON,
  restartPolicyFromJSON,
  restartPolicyToJSON,
  volumeTypeFromJSON,
  volumeTypeToJSON,
} from './common'

export const protobufPackage = 'agent'

/**
 * Container agent interface messages and service definitions
 * Logs, statuses, deployments
 */

/** Connection close */
export enum CloseReason {
  CLOSE_REASON_UNSPECIFIED = 0,
  CLOSE = 1,
  SELF_DESTRUCT = 2,
  SHUTDOWN = 3,
  REVOKE_TOKEN = 4,
  UNRECOGNIZED = -1,
}

export function closeReasonFromJSON(object: any): CloseReason {
  switch (object) {
    case 0:
    case 'CLOSE_REASON_UNSPECIFIED':
      return CloseReason.CLOSE_REASON_UNSPECIFIED
    case 1:
    case 'CLOSE':
      return CloseReason.CLOSE
    case 2:
    case 'SELF_DESTRUCT':
      return CloseReason.SELF_DESTRUCT
    case 3:
    case 'SHUTDOWN':
      return CloseReason.SHUTDOWN
    case 4:
    case 'REVOKE_TOKEN':
      return CloseReason.REVOKE_TOKEN
    case -1:
    case 'UNRECOGNIZED':
    default:
      return CloseReason.UNRECOGNIZED
  }
}

export function closeReasonToJSON(object: CloseReason): string {
  switch (object) {
    case CloseReason.CLOSE_REASON_UNSPECIFIED:
      return 'CLOSE_REASON_UNSPECIFIED'
    case CloseReason.CLOSE:
      return 'CLOSE'
    case CloseReason.SELF_DESTRUCT:
      return 'SELF_DESTRUCT'
    case CloseReason.SHUTDOWN:
      return 'SHUTDOWN'
    case CloseReason.REVOKE_TOKEN:
      return 'REVOKE_TOKEN'
    case CloseReason.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

/**  */
export interface AgentInfo {
  id: string
  version: string
  publicKey: string
  containerName?: string | undefined
}

export interface AgentCommand {
  deploy?: VersionDeployRequest | undefined
  containerState?: ContainerStateRequest | undefined
  containerDelete?: ContainerDeleteRequest | undefined
  deployLegacy?: DeployRequestLegacy | undefined
  listSecrets?: ListSecretsRequest | undefined
  update?: AgentUpdateRequest | undefined
  close?: CloseConnectionRequest | undefined
  containerCommand?: ContainerCommandRequest | undefined
  deleteContainers?: DeleteContainersRequest | undefined
  containerLog?: ContainerLogRequest | undefined
  replaceToken?: ReplaceTokenRequest | undefined
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
export interface InstanceConfig {
  /**
   * prefix mapped into host folder structure,
   * used as namespace id
   */
  prefix: string
  /** mount path of instance (docker only) */
  mountPath?: string | undefined
  /** environment variable map */
  environment: { [key: string]: string }
  /** registry repo prefix */
  repositoryPrefix?: string | undefined
}

export interface InstanceConfig_EnvironmentEntry {
  key: string
  value: string
}

export interface RegistryAuth {
  name: string
  url: string
  user: string
  password: string
}

export interface Port {
  internal: number
  external?: number | undefined
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

export interface Marker {
  deployment: { [key: string]: string }
  service: { [key: string]: string }
  ingress: { [key: string]: string }
}

export interface Marker_DeploymentEntry {
  key: string
  value: string
}

export interface Marker_ServiceEntry {
  key: string
  value: string
}

export interface Marker_IngressEntry {
  key: string
  value: string
}

export interface DagentContainerConfig {
  logConfig?: LogConfig | undefined
  restartPolicy?: RestartPolicy | undefined
  networkMode?: NetworkMode | undefined
  networks: string[]
  labels: { [key: string]: string }
}

export interface DagentContainerConfig_LabelsEntry {
  key: string
  value: string
}

export interface Metrics {
  port: string
  path: string
}

export interface CraneContainerConfig {
  deploymentStatregy?: DeploymentStrategy | undefined
  healthCheckConfig?: HealthCheckConfig | undefined
  resourceConfig?: ResourceConfig | undefined
  proxyHeaders?: boolean | undefined
  useLoadBalancer?: boolean | undefined
  annotations?: Marker | undefined
  labels?: Marker | undefined
  metrics?: Metrics | undefined
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
  routing?: Routing | undefined
  configContainer?: ConfigContainer | undefined
  importContainer?: ImportContainer | undefined
  user?: number | undefined
  TTY?: boolean | undefined
  ports: Port[]
  portRanges: PortRangeBinding[]
  volumes: Volume[]
  commands: string[]
  args: string[]
  environment: { [key: string]: string }
  secrets: { [key: string]: string }
  initContainers: InitContainer[]
}

export interface CommonContainerConfig_EnvironmentEntry {
  key: string
  value: string
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

/** Dagent update */
export interface AgentUpdateRequest {
  tag: string
  timeoutSeconds: number
  token: string
}

export interface ReplaceTokenRequest {
  token: string
}

export interface AgentAbortUpdate {
  error: string
}

/** Container log */
export interface ContainerLogRequest {
  container: ContainerIdentifier | undefined
  streaming: boolean
  tail: number
}

export interface CloseConnectionRequest {
  reason: CloseReason
}

export const AGENT_PACKAGE_NAME = 'agent'

function createBaseAgentInfo(): AgentInfo {
  return { id: '', version: '', publicKey: '' }
}

export const AgentInfo = {
  fromJSON(object: any): AgentInfo {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      version: isSet(object.version) ? String(object.version) : '',
      publicKey: isSet(object.publicKey) ? String(object.publicKey) : '',
      containerName: isSet(object.containerName) ? String(object.containerName) : undefined,
    }
  },

  toJSON(message: AgentInfo): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.version !== undefined && (obj.version = message.version)
    message.publicKey !== undefined && (obj.publicKey = message.publicKey)
    message.containerName !== undefined && (obj.containerName = message.containerName)
    return obj
  },
}

function createBaseAgentCommand(): AgentCommand {
  return {}
}

export const AgentCommand = {
  fromJSON(object: any): AgentCommand {
    return {
      deploy: isSet(object.deploy) ? VersionDeployRequest.fromJSON(object.deploy) : undefined,
      containerState: isSet(object.containerState) ? ContainerStateRequest.fromJSON(object.containerState) : undefined,
      containerDelete: isSet(object.containerDelete)
        ? ContainerDeleteRequest.fromJSON(object.containerDelete)
        : undefined,
      deployLegacy: isSet(object.deployLegacy) ? DeployRequestLegacy.fromJSON(object.deployLegacy) : undefined,
      listSecrets: isSet(object.listSecrets) ? ListSecretsRequest.fromJSON(object.listSecrets) : undefined,
      update: isSet(object.update) ? AgentUpdateRequest.fromJSON(object.update) : undefined,
      close: isSet(object.close) ? CloseConnectionRequest.fromJSON(object.close) : undefined,
      containerCommand: isSet(object.containerCommand)
        ? ContainerCommandRequest.fromJSON(object.containerCommand)
        : undefined,
      deleteContainers: isSet(object.deleteContainers)
        ? DeleteContainersRequest.fromJSON(object.deleteContainers)
        : undefined,
      containerLog: isSet(object.containerLog) ? ContainerLogRequest.fromJSON(object.containerLog) : undefined,
      replaceToken: isSet(object.replaceToken) ? ReplaceTokenRequest.fromJSON(object.replaceToken) : undefined,
    }
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
    message.update !== undefined &&
      (obj.update = message.update ? AgentUpdateRequest.toJSON(message.update) : undefined)
    message.close !== undefined &&
      (obj.close = message.close ? CloseConnectionRequest.toJSON(message.close) : undefined)
    message.containerCommand !== undefined &&
      (obj.containerCommand = message.containerCommand
        ? ContainerCommandRequest.toJSON(message.containerCommand)
        : undefined)
    message.deleteContainers !== undefined &&
      (obj.deleteContainers = message.deleteContainers
        ? DeleteContainersRequest.toJSON(message.deleteContainers)
        : undefined)
    message.containerLog !== undefined &&
      (obj.containerLog = message.containerLog ? ContainerLogRequest.toJSON(message.containerLog) : undefined)
    message.replaceToken !== undefined &&
      (obj.replaceToken = message.replaceToken ? ReplaceTokenRequest.toJSON(message.replaceToken) : undefined)
    return obj
  },
}

function createBaseDeployResponse(): DeployResponse {
  return { started: false }
}

export const DeployResponse = {
  fromJSON(object: any): DeployResponse {
    return { started: isSet(object.started) ? Boolean(object.started) : false }
  },

  toJSON(message: DeployResponse): unknown {
    const obj: any = {}
    message.started !== undefined && (obj.started = message.started)
    return obj
  },
}

function createBaseVersionDeployRequest(): VersionDeployRequest {
  return { id: '', versionName: '', releaseNotes: '', requests: [] }
}

export const VersionDeployRequest = {
  fromJSON(object: any): VersionDeployRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      versionName: isSet(object.versionName) ? String(object.versionName) : '',
      releaseNotes: isSet(object.releaseNotes) ? String(object.releaseNotes) : '',
      requests: Array.isArray(object?.requests) ? object.requests.map((e: any) => DeployRequest.fromJSON(e)) : [],
    }
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

function createBaseListSecretsRequest(): ListSecretsRequest {
  return { prefix: '', name: '' }
}

export const ListSecretsRequest = {
  fromJSON(object: any): ListSecretsRequest {
    return {
      prefix: isSet(object.prefix) ? String(object.prefix) : '',
      name: isSet(object.name) ? String(object.name) : '',
    }
  },

  toJSON(message: ListSecretsRequest): unknown {
    const obj: any = {}
    message.prefix !== undefined && (obj.prefix = message.prefix)
    message.name !== undefined && (obj.name = message.name)
    return obj
  },
}

function createBaseInstanceConfig(): InstanceConfig {
  return { prefix: '', environment: {} }
}

export const InstanceConfig = {
  fromJSON(object: any): InstanceConfig {
    return {
      prefix: isSet(object.prefix) ? String(object.prefix) : '',
      mountPath: isSet(object.mountPath) ? String(object.mountPath) : undefined,
      environment: isObject(object.environment)
        ? Object.entries(object.environment).reduce<{ [key: string]: string }>((acc, [key, value]) => {
            acc[key] = String(value)
            return acc
          }, {})
        : {},
      repositoryPrefix: isSet(object.repositoryPrefix) ? String(object.repositoryPrefix) : undefined,
    }
  },

  toJSON(message: InstanceConfig): unknown {
    const obj: any = {}
    message.prefix !== undefined && (obj.prefix = message.prefix)
    message.mountPath !== undefined && (obj.mountPath = message.mountPath)
    obj.environment = {}
    if (message.environment) {
      Object.entries(message.environment).forEach(([k, v]) => {
        obj.environment[k] = v
      })
    }
    message.repositoryPrefix !== undefined && (obj.repositoryPrefix = message.repositoryPrefix)
    return obj
  },
}

function createBaseInstanceConfig_EnvironmentEntry(): InstanceConfig_EnvironmentEntry {
  return { key: '', value: '' }
}

export const InstanceConfig_EnvironmentEntry = {
  fromJSON(object: any): InstanceConfig_EnvironmentEntry {
    return { key: isSet(object.key) ? String(object.key) : '', value: isSet(object.value) ? String(object.value) : '' }
  },

  toJSON(message: InstanceConfig_EnvironmentEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

function createBaseRegistryAuth(): RegistryAuth {
  return { name: '', url: '', user: '', password: '' }
}

export const RegistryAuth = {
  fromJSON(object: any): RegistryAuth {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      url: isSet(object.url) ? String(object.url) : '',
      user: isSet(object.user) ? String(object.user) : '',
      password: isSet(object.password) ? String(object.password) : '',
    }
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

function createBasePort(): Port {
  return { internal: 0 }
}

export const Port = {
  fromJSON(object: any): Port {
    return {
      internal: isSet(object.internal) ? Number(object.internal) : 0,
      external: isSet(object.external) ? Number(object.external) : undefined,
    }
  },

  toJSON(message: Port): unknown {
    const obj: any = {}
    message.internal !== undefined && (obj.internal = Math.round(message.internal))
    message.external !== undefined && (obj.external = Math.round(message.external))
    return obj
  },
}

function createBasePortRange(): PortRange {
  return { from: 0, to: 0 }
}

export const PortRange = {
  fromJSON(object: any): PortRange {
    return { from: isSet(object.from) ? Number(object.from) : 0, to: isSet(object.to) ? Number(object.to) : 0 }
  },

  toJSON(message: PortRange): unknown {
    const obj: any = {}
    message.from !== undefined && (obj.from = Math.round(message.from))
    message.to !== undefined && (obj.to = Math.round(message.to))
    return obj
  },
}

function createBasePortRangeBinding(): PortRangeBinding {
  return { internal: undefined, external: undefined }
}

export const PortRangeBinding = {
  fromJSON(object: any): PortRangeBinding {
    return {
      internal: isSet(object.internal) ? PortRange.fromJSON(object.internal) : undefined,
      external: isSet(object.external) ? PortRange.fromJSON(object.external) : undefined,
    }
  },

  toJSON(message: PortRangeBinding): unknown {
    const obj: any = {}
    message.internal !== undefined && (obj.internal = message.internal ? PortRange.toJSON(message.internal) : undefined)
    message.external !== undefined && (obj.external = message.external ? PortRange.toJSON(message.external) : undefined)
    return obj
  },
}

function createBaseVolume(): Volume {
  return { name: '', path: '' }
}

export const Volume = {
  fromJSON(object: any): Volume {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      path: isSet(object.path) ? String(object.path) : '',
      size: isSet(object.size) ? String(object.size) : undefined,
      type: isSet(object.type) ? volumeTypeFromJSON(object.type) : undefined,
      class: isSet(object.class) ? String(object.class) : undefined,
    }
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

function createBaseVolumeLink(): VolumeLink {
  return { name: '', path: '' }
}

export const VolumeLink = {
  fromJSON(object: any): VolumeLink {
    return { name: isSet(object.name) ? String(object.name) : '', path: isSet(object.path) ? String(object.path) : '' }
  },

  toJSON(message: VolumeLink): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.path !== undefined && (obj.path = message.path)
    return obj
  },
}

function createBaseInitContainer(): InitContainer {
  return { name: '', image: '', volumes: [], command: [], args: [], environment: {} }
}

export const InitContainer = {
  fromJSON(object: any): InitContainer {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      image: isSet(object.image) ? String(object.image) : '',
      useParentConfig: isSet(object.useParentConfig) ? Boolean(object.useParentConfig) : undefined,
      volumes: Array.isArray(object?.volumes) ? object.volumes.map((e: any) => VolumeLink.fromJSON(e)) : [],
      command: Array.isArray(object?.command) ? object.command.map((e: any) => String(e)) : [],
      args: Array.isArray(object?.args) ? object.args.map((e: any) => String(e)) : [],
      environment: isObject(object.environment)
        ? Object.entries(object.environment).reduce<{ [key: string]: string }>((acc, [key, value]) => {
            acc[key] = String(value)
            return acc
          }, {})
        : {},
    }
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

function createBaseInitContainer_EnvironmentEntry(): InitContainer_EnvironmentEntry {
  return { key: '', value: '' }
}

export const InitContainer_EnvironmentEntry = {
  fromJSON(object: any): InitContainer_EnvironmentEntry {
    return { key: isSet(object.key) ? String(object.key) : '', value: isSet(object.value) ? String(object.value) : '' }
  },

  toJSON(message: InitContainer_EnvironmentEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

function createBaseImportContainer(): ImportContainer {
  return { volume: '', command: '', environment: {} }
}

export const ImportContainer = {
  fromJSON(object: any): ImportContainer {
    return {
      volume: isSet(object.volume) ? String(object.volume) : '',
      command: isSet(object.command) ? String(object.command) : '',
      environment: isObject(object.environment)
        ? Object.entries(object.environment).reduce<{ [key: string]: string }>((acc, [key, value]) => {
            acc[key] = String(value)
            return acc
          }, {})
        : {},
    }
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

function createBaseImportContainer_EnvironmentEntry(): ImportContainer_EnvironmentEntry {
  return { key: '', value: '' }
}

export const ImportContainer_EnvironmentEntry = {
  fromJSON(object: any): ImportContainer_EnvironmentEntry {
    return { key: isSet(object.key) ? String(object.key) : '', value: isSet(object.value) ? String(object.value) : '' }
  },

  toJSON(message: ImportContainer_EnvironmentEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

function createBaseLogConfig(): LogConfig {
  return { driver: 0, options: {} }
}

export const LogConfig = {
  fromJSON(object: any): LogConfig {
    return {
      driver: isSet(object.driver) ? driverTypeFromJSON(object.driver) : 0,
      options: isObject(object.options)
        ? Object.entries(object.options).reduce<{ [key: string]: string }>((acc, [key, value]) => {
            acc[key] = String(value)
            return acc
          }, {})
        : {},
    }
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

function createBaseLogConfig_OptionsEntry(): LogConfig_OptionsEntry {
  return { key: '', value: '' }
}

export const LogConfig_OptionsEntry = {
  fromJSON(object: any): LogConfig_OptionsEntry {
    return { key: isSet(object.key) ? String(object.key) : '', value: isSet(object.value) ? String(object.value) : '' }
  },

  toJSON(message: LogConfig_OptionsEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

function createBaseMarker(): Marker {
  return { deployment: {}, service: {}, ingress: {} }
}

export const Marker = {
  fromJSON(object: any): Marker {
    return {
      deployment: isObject(object.deployment)
        ? Object.entries(object.deployment).reduce<{ [key: string]: string }>((acc, [key, value]) => {
            acc[key] = String(value)
            return acc
          }, {})
        : {},
      service: isObject(object.service)
        ? Object.entries(object.service).reduce<{ [key: string]: string }>((acc, [key, value]) => {
            acc[key] = String(value)
            return acc
          }, {})
        : {},
      ingress: isObject(object.ingress)
        ? Object.entries(object.ingress).reduce<{ [key: string]: string }>((acc, [key, value]) => {
            acc[key] = String(value)
            return acc
          }, {})
        : {},
    }
  },

  toJSON(message: Marker): unknown {
    const obj: any = {}
    obj.deployment = {}
    if (message.deployment) {
      Object.entries(message.deployment).forEach(([k, v]) => {
        obj.deployment[k] = v
      })
    }
    obj.service = {}
    if (message.service) {
      Object.entries(message.service).forEach(([k, v]) => {
        obj.service[k] = v
      })
    }
    obj.ingress = {}
    if (message.ingress) {
      Object.entries(message.ingress).forEach(([k, v]) => {
        obj.ingress[k] = v
      })
    }
    return obj
  },
}

function createBaseMarker_DeploymentEntry(): Marker_DeploymentEntry {
  return { key: '', value: '' }
}

export const Marker_DeploymentEntry = {
  fromJSON(object: any): Marker_DeploymentEntry {
    return { key: isSet(object.key) ? String(object.key) : '', value: isSet(object.value) ? String(object.value) : '' }
  },

  toJSON(message: Marker_DeploymentEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

function createBaseMarker_ServiceEntry(): Marker_ServiceEntry {
  return { key: '', value: '' }
}

export const Marker_ServiceEntry = {
  fromJSON(object: any): Marker_ServiceEntry {
    return { key: isSet(object.key) ? String(object.key) : '', value: isSet(object.value) ? String(object.value) : '' }
  },

  toJSON(message: Marker_ServiceEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

function createBaseMarker_IngressEntry(): Marker_IngressEntry {
  return { key: '', value: '' }
}

export const Marker_IngressEntry = {
  fromJSON(object: any): Marker_IngressEntry {
    return { key: isSet(object.key) ? String(object.key) : '', value: isSet(object.value) ? String(object.value) : '' }
  },

  toJSON(message: Marker_IngressEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

function createBaseDagentContainerConfig(): DagentContainerConfig {
  return { networks: [], labels: {} }
}

export const DagentContainerConfig = {
  fromJSON(object: any): DagentContainerConfig {
    return {
      logConfig: isSet(object.logConfig) ? LogConfig.fromJSON(object.logConfig) : undefined,
      restartPolicy: isSet(object.restartPolicy) ? restartPolicyFromJSON(object.restartPolicy) : undefined,
      networkMode: isSet(object.networkMode) ? networkModeFromJSON(object.networkMode) : undefined,
      networks: Array.isArray(object?.networks) ? object.networks.map((e: any) => String(e)) : [],
      labels: isObject(object.labels)
        ? Object.entries(object.labels).reduce<{ [key: string]: string }>((acc, [key, value]) => {
            acc[key] = String(value)
            return acc
          }, {})
        : {},
    }
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
    obj.labels = {}
    if (message.labels) {
      Object.entries(message.labels).forEach(([k, v]) => {
        obj.labels[k] = v
      })
    }
    return obj
  },
}

function createBaseDagentContainerConfig_LabelsEntry(): DagentContainerConfig_LabelsEntry {
  return { key: '', value: '' }
}

export const DagentContainerConfig_LabelsEntry = {
  fromJSON(object: any): DagentContainerConfig_LabelsEntry {
    return { key: isSet(object.key) ? String(object.key) : '', value: isSet(object.value) ? String(object.value) : '' }
  },

  toJSON(message: DagentContainerConfig_LabelsEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

function createBaseMetrics(): Metrics {
  return { port: '', path: '' }
}

export const Metrics = {
  fromJSON(object: any): Metrics {
    return { port: isSet(object.port) ? String(object.port) : '', path: isSet(object.path) ? String(object.path) : '' }
  },

  toJSON(message: Metrics): unknown {
    const obj: any = {}
    message.port !== undefined && (obj.port = message.port)
    message.path !== undefined && (obj.path = message.path)
    return obj
  },
}

function createBaseCraneContainerConfig(): CraneContainerConfig {
  return { customHeaders: [], extraLBAnnotations: {} }
}

export const CraneContainerConfig = {
  fromJSON(object: any): CraneContainerConfig {
    return {
      deploymentStatregy: isSet(object.deploymentStatregy)
        ? deploymentStrategyFromJSON(object.deploymentStatregy)
        : undefined,
      healthCheckConfig: isSet(object.healthCheckConfig)
        ? HealthCheckConfig.fromJSON(object.healthCheckConfig)
        : undefined,
      resourceConfig: isSet(object.resourceConfig) ? ResourceConfig.fromJSON(object.resourceConfig) : undefined,
      proxyHeaders: isSet(object.proxyHeaders) ? Boolean(object.proxyHeaders) : undefined,
      useLoadBalancer: isSet(object.useLoadBalancer) ? Boolean(object.useLoadBalancer) : undefined,
      annotations: isSet(object.annotations) ? Marker.fromJSON(object.annotations) : undefined,
      labels: isSet(object.labels) ? Marker.fromJSON(object.labels) : undefined,
      metrics: isSet(object.metrics) ? Metrics.fromJSON(object.metrics) : undefined,
      customHeaders: Array.isArray(object?.customHeaders) ? object.customHeaders.map((e: any) => String(e)) : [],
      extraLBAnnotations: isObject(object.extraLBAnnotations)
        ? Object.entries(object.extraLBAnnotations).reduce<{ [key: string]: string }>((acc, [key, value]) => {
            acc[key] = String(value)
            return acc
          }, {})
        : {},
    }
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
    message.annotations !== undefined &&
      (obj.annotations = message.annotations ? Marker.toJSON(message.annotations) : undefined)
    message.labels !== undefined && (obj.labels = message.labels ? Marker.toJSON(message.labels) : undefined)
    message.metrics !== undefined && (obj.metrics = message.metrics ? Metrics.toJSON(message.metrics) : undefined)
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

function createBaseCraneContainerConfig_ExtraLBAnnotationsEntry(): CraneContainerConfig_ExtraLBAnnotationsEntry {
  return { key: '', value: '' }
}

export const CraneContainerConfig_ExtraLBAnnotationsEntry = {
  fromJSON(object: any): CraneContainerConfig_ExtraLBAnnotationsEntry {
    return { key: isSet(object.key) ? String(object.key) : '', value: isSet(object.value) ? String(object.value) : '' }
  },

  toJSON(message: CraneContainerConfig_ExtraLBAnnotationsEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

function createBaseCommonContainerConfig(): CommonContainerConfig {
  return {
    name: '',
    ports: [],
    portRanges: [],
    volumes: [],
    commands: [],
    args: [],
    environment: {},
    secrets: {},
    initContainers: [],
  }
}

export const CommonContainerConfig = {
  fromJSON(object: any): CommonContainerConfig {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      expose: isSet(object.expose) ? exposeStrategyFromJSON(object.expose) : undefined,
      routing: isSet(object.routing) ? Routing.fromJSON(object.routing) : undefined,
      configContainer: isSet(object.configContainer) ? ConfigContainer.fromJSON(object.configContainer) : undefined,
      importContainer: isSet(object.importContainer) ? ImportContainer.fromJSON(object.importContainer) : undefined,
      user: isSet(object.user) ? Number(object.user) : undefined,
      TTY: isSet(object.TTY) ? Boolean(object.TTY) : undefined,
      ports: Array.isArray(object?.ports) ? object.ports.map((e: any) => Port.fromJSON(e)) : [],
      portRanges: Array.isArray(object?.portRanges)
        ? object.portRanges.map((e: any) => PortRangeBinding.fromJSON(e))
        : [],
      volumes: Array.isArray(object?.volumes) ? object.volumes.map((e: any) => Volume.fromJSON(e)) : [],
      commands: Array.isArray(object?.commands) ? object.commands.map((e: any) => String(e)) : [],
      args: Array.isArray(object?.args) ? object.args.map((e: any) => String(e)) : [],
      environment: isObject(object.environment)
        ? Object.entries(object.environment).reduce<{ [key: string]: string }>((acc, [key, value]) => {
            acc[key] = String(value)
            return acc
          }, {})
        : {},
      secrets: isObject(object.secrets)
        ? Object.entries(object.secrets).reduce<{ [key: string]: string }>((acc, [key, value]) => {
            acc[key] = String(value)
            return acc
          }, {})
        : {},
      initContainers: Array.isArray(object?.initContainers)
        ? object.initContainers.map((e: any) => InitContainer.fromJSON(e))
        : [],
    }
  },

  toJSON(message: CommonContainerConfig): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.expose !== undefined &&
      (obj.expose = message.expose !== undefined ? exposeStrategyToJSON(message.expose) : undefined)
    message.routing !== undefined && (obj.routing = message.routing ? Routing.toJSON(message.routing) : undefined)
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
    obj.environment = {}
    if (message.environment) {
      Object.entries(message.environment).forEach(([k, v]) => {
        obj.environment[k] = v
      })
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

function createBaseCommonContainerConfig_EnvironmentEntry(): CommonContainerConfig_EnvironmentEntry {
  return { key: '', value: '' }
}

export const CommonContainerConfig_EnvironmentEntry = {
  fromJSON(object: any): CommonContainerConfig_EnvironmentEntry {
    return { key: isSet(object.key) ? String(object.key) : '', value: isSet(object.value) ? String(object.value) : '' }
  },

  toJSON(message: CommonContainerConfig_EnvironmentEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

function createBaseCommonContainerConfig_SecretsEntry(): CommonContainerConfig_SecretsEntry {
  return { key: '', value: '' }
}

export const CommonContainerConfig_SecretsEntry = {
  fromJSON(object: any): CommonContainerConfig_SecretsEntry {
    return { key: isSet(object.key) ? String(object.key) : '', value: isSet(object.value) ? String(object.value) : '' }
  },

  toJSON(message: CommonContainerConfig_SecretsEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

function createBaseDeployRequest(): DeployRequest {
  return { id: '', containerName: '', instanceConfig: undefined, imageName: '', tag: '' }
}

export const DeployRequest = {
  fromJSON(object: any): DeployRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      containerName: isSet(object.containerName) ? String(object.containerName) : '',
      instanceConfig: isSet(object.instanceConfig) ? InstanceConfig.fromJSON(object.instanceConfig) : undefined,
      common: isSet(object.common) ? CommonContainerConfig.fromJSON(object.common) : undefined,
      dagent: isSet(object.dagent) ? DagentContainerConfig.fromJSON(object.dagent) : undefined,
      crane: isSet(object.crane) ? CraneContainerConfig.fromJSON(object.crane) : undefined,
      runtimeConfig: isSet(object.runtimeConfig) ? String(object.runtimeConfig) : undefined,
      registry: isSet(object.registry) ? String(object.registry) : undefined,
      imageName: isSet(object.imageName) ? String(object.imageName) : '',
      tag: isSet(object.tag) ? String(object.tag) : '',
      registryAuth: isSet(object.registryAuth) ? RegistryAuth.fromJSON(object.registryAuth) : undefined,
    }
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

function createBaseContainerStateRequest(): ContainerStateRequest {
  return {}
}

export const ContainerStateRequest = {
  fromJSON(object: any): ContainerStateRequest {
    return {
      prefix: isSet(object.prefix) ? String(object.prefix) : undefined,
      oneShot: isSet(object.oneShot) ? Boolean(object.oneShot) : undefined,
    }
  },

  toJSON(message: ContainerStateRequest): unknown {
    const obj: any = {}
    message.prefix !== undefined && (obj.prefix = message.prefix)
    message.oneShot !== undefined && (obj.oneShot = message.oneShot)
    return obj
  },
}

function createBaseContainerDeleteRequest(): ContainerDeleteRequest {
  return { prefix: '', name: '' }
}

export const ContainerDeleteRequest = {
  fromJSON(object: any): ContainerDeleteRequest {
    return {
      prefix: isSet(object.prefix) ? String(object.prefix) : '',
      name: isSet(object.name) ? String(object.name) : '',
    }
  },

  toJSON(message: ContainerDeleteRequest): unknown {
    const obj: any = {}
    message.prefix !== undefined && (obj.prefix = message.prefix)
    message.name !== undefined && (obj.name = message.name)
    return obj
  },
}

function createBaseDeployRequestLegacy(): DeployRequestLegacy {
  return { requestId: '', json: '' }
}

export const DeployRequestLegacy = {
  fromJSON(object: any): DeployRequestLegacy {
    return {
      requestId: isSet(object.requestId) ? String(object.requestId) : '',
      json: isSet(object.json) ? String(object.json) : '',
    }
  },

  toJSON(message: DeployRequestLegacy): unknown {
    const obj: any = {}
    message.requestId !== undefined && (obj.requestId = message.requestId)
    message.json !== undefined && (obj.json = message.json)
    return obj
  },
}

function createBaseAgentUpdateRequest(): AgentUpdateRequest {
  return { tag: '', timeoutSeconds: 0, token: '' }
}

export const AgentUpdateRequest = {
  fromJSON(object: any): AgentUpdateRequest {
    return {
      tag: isSet(object.tag) ? String(object.tag) : '',
      timeoutSeconds: isSet(object.timeoutSeconds) ? Number(object.timeoutSeconds) : 0,
      token: isSet(object.token) ? String(object.token) : '',
    }
  },

  toJSON(message: AgentUpdateRequest): unknown {
    const obj: any = {}
    message.tag !== undefined && (obj.tag = message.tag)
    message.timeoutSeconds !== undefined && (obj.timeoutSeconds = Math.round(message.timeoutSeconds))
    message.token !== undefined && (obj.token = message.token)
    return obj
  },
}

function createBaseReplaceTokenRequest(): ReplaceTokenRequest {
  return { token: '' }
}

export const ReplaceTokenRequest = {
  fromJSON(object: any): ReplaceTokenRequest {
    return { token: isSet(object.token) ? String(object.token) : '' }
  },

  toJSON(message: ReplaceTokenRequest): unknown {
    const obj: any = {}
    message.token !== undefined && (obj.token = message.token)
    return obj
  },
}

function createBaseAgentAbortUpdate(): AgentAbortUpdate {
  return { error: '' }
}

export const AgentAbortUpdate = {
  fromJSON(object: any): AgentAbortUpdate {
    return { error: isSet(object.error) ? String(object.error) : '' }
  },

  toJSON(message: AgentAbortUpdate): unknown {
    const obj: any = {}
    message.error !== undefined && (obj.error = message.error)
    return obj
  },
}

function createBaseContainerLogRequest(): ContainerLogRequest {
  return { container: undefined, streaming: false, tail: 0 }
}

export const ContainerLogRequest = {
  fromJSON(object: any): ContainerLogRequest {
    return {
      container: isSet(object.container) ? ContainerIdentifier.fromJSON(object.container) : undefined,
      streaming: isSet(object.streaming) ? Boolean(object.streaming) : false,
      tail: isSet(object.tail) ? Number(object.tail) : 0,
    }
  },

  toJSON(message: ContainerLogRequest): unknown {
    const obj: any = {}
    message.container !== undefined &&
      (obj.container = message.container ? ContainerIdentifier.toJSON(message.container) : undefined)
    message.streaming !== undefined && (obj.streaming = message.streaming)
    message.tail !== undefined && (obj.tail = Math.round(message.tail))
    return obj
  },
}

function createBaseCloseConnectionRequest(): CloseConnectionRequest {
  return { reason: 0 }
}

export const CloseConnectionRequest = {
  fromJSON(object: any): CloseConnectionRequest {
    return { reason: isSet(object.reason) ? closeReasonFromJSON(object.reason) : 0 }
  },

  toJSON(message: CloseConnectionRequest): unknown {
    const obj: any = {}
    message.reason !== undefined && (obj.reason = closeReasonToJSON(message.reason))
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

  abortUpdate(request: AgentAbortUpdate, metadata: Metadata, ...rest: any): Observable<Empty>

  deleteContainers(request: DeleteContainersRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  containerLog(request: Observable<ContainerLogMessage>, metadata: Metadata, ...rest: any): Observable<Empty>

  tokenReplaced(request: Empty, metadata: Metadata, ...rest: any): Observable<Empty>
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

  abortUpdate(request: AgentAbortUpdate, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  deleteContainers(
    request: DeleteContainersRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty

  containerLog(
    request: Observable<ContainerLogMessage>,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty

  tokenReplaced(request: Empty, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty
}

export function AgentControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['connect', 'secretList', 'abortUpdate', 'deleteContainers', 'tokenReplaced']
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('Agent', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = ['deploymentStatus', 'containerState', 'containerLog']
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcStreamMethod('Agent', method)(constructor.prototype[method], method, descriptor)
    }
  }
}

export const AGENT_SERVICE_NAME = 'Agent'

function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined
}
