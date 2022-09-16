/* eslint-disable */
import { Timestamp } from '../../google/protobuf/timestamp'

export const protobufPackage = 'common'

/** Deployment */
export enum ContainerState {
  UNKNOWN_CONTAINER_STATE = 0,
  CREATED = 1,
  RESTARTING = 2,
  RUNNING = 3,
  REMOVING = 4,
  PAUSED = 5,
  EXITED = 6,
  DEAD = 7,
  UNRECOGNIZED = -1,
}

export function containerStateFromJSON(object: any): ContainerState {
  switch (object) {
    case 0:
    case 'UNKNOWN_CONTAINER_STATE':
      return ContainerState.UNKNOWN_CONTAINER_STATE
    case 1:
    case 'CREATED':
      return ContainerState.CREATED
    case 2:
    case 'RESTARTING':
      return ContainerState.RESTARTING
    case 3:
    case 'RUNNING':
      return ContainerState.RUNNING
    case 4:
    case 'REMOVING':
      return ContainerState.REMOVING
    case 5:
    case 'PAUSED':
      return ContainerState.PAUSED
    case 6:
    case 'EXITED':
      return ContainerState.EXITED
    case 7:
    case 'DEAD':
      return ContainerState.DEAD
    case -1:
    case 'UNRECOGNIZED':
    default:
      return ContainerState.UNRECOGNIZED
  }
}

export function containerStateToJSON(object: ContainerState): string {
  switch (object) {
    case ContainerState.UNKNOWN_CONTAINER_STATE:
      return 'UNKNOWN_CONTAINER_STATE'
    case ContainerState.CREATED:
      return 'CREATED'
    case ContainerState.RESTARTING:
      return 'RESTARTING'
    case ContainerState.RUNNING:
      return 'RUNNING'
    case ContainerState.REMOVING:
      return 'REMOVING'
    case ContainerState.PAUSED:
      return 'PAUSED'
    case ContainerState.EXITED:
      return 'EXITED'
    case ContainerState.DEAD:
      return 'DEAD'
    case ContainerState.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum DeploymentStatus {
  UNKNOWN_DEPLOYMENT_STATUS = 0,
  PREPARING = 1,
  IN_PROGRESS = 2,
  SUCCESSFUL = 3,
  FAILED = 4,
  OBSOLATE = 5,
  DOWNGRADED = 6,
  UNRECOGNIZED = -1,
}

export function deploymentStatusFromJSON(object: any): DeploymentStatus {
  switch (object) {
    case 0:
    case 'UNKNOWN_DEPLOYMENT_STATUS':
      return DeploymentStatus.UNKNOWN_DEPLOYMENT_STATUS
    case 1:
    case 'PREPARING':
      return DeploymentStatus.PREPARING
    case 2:
    case 'IN_PROGRESS':
      return DeploymentStatus.IN_PROGRESS
    case 3:
    case 'SUCCESSFUL':
      return DeploymentStatus.SUCCESSFUL
    case 4:
    case 'FAILED':
      return DeploymentStatus.FAILED
    case 5:
    case 'OBSOLATE':
      return DeploymentStatus.OBSOLATE
    case 6:
    case 'DOWNGRADED':
      return DeploymentStatus.DOWNGRADED
    case -1:
    case 'UNRECOGNIZED':
    default:
      return DeploymentStatus.UNRECOGNIZED
  }
}

export function deploymentStatusToJSON(object: DeploymentStatus): string {
  switch (object) {
    case DeploymentStatus.UNKNOWN_DEPLOYMENT_STATUS:
      return 'UNKNOWN_DEPLOYMENT_STATUS'
    case DeploymentStatus.PREPARING:
      return 'PREPARING'
    case DeploymentStatus.IN_PROGRESS:
      return 'IN_PROGRESS'
    case DeploymentStatus.SUCCESSFUL:
      return 'SUCCESSFUL'
    case DeploymentStatus.FAILED:
      return 'FAILED'
    case DeploymentStatus.OBSOLATE:
      return 'OBSOLATE'
    case DeploymentStatus.DOWNGRADED:
      return 'DOWNGRADED'
    case DeploymentStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum NetworkMode {
  UNKNOWN_NETWORK_MODE = 0,
  NONE = 1,
  HOST = 2,
  BRIDGE = 3,
  UNRECOGNIZED = -1,
}

export function networkModeFromJSON(object: any): NetworkMode {
  switch (object) {
    case 0:
    case 'UNKNOWN_NETWORK_MODE':
      return NetworkMode.UNKNOWN_NETWORK_MODE
    case 1:
    case 'NONE':
      return NetworkMode.NONE
    case 2:
    case 'HOST':
      return NetworkMode.HOST
    case 3:
    case 'BRIDGE':
      return NetworkMode.BRIDGE
    case -1:
    case 'UNRECOGNIZED':
    default:
      return NetworkMode.UNRECOGNIZED
  }
}

export function networkModeToJSON(object: NetworkMode): string {
  switch (object) {
    case NetworkMode.UNKNOWN_NETWORK_MODE:
      return 'UNKNOWN_NETWORK_MODE'
    case NetworkMode.NONE:
      return 'NONE'
    case NetworkMode.HOST:
      return 'HOST'
    case NetworkMode.BRIDGE:
      return 'BRIDGE'
    case NetworkMode.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum RestartPolicy {
  UNKNOWN_POLICY = 0,
  EMPTY = 1,
  ALWAYS = 2,
  UNLESS_STOPPED = 3,
  NO = 4,
  ON_FAILURE = 5,
  UNRECOGNIZED = -1,
}

export function restartPolicyFromJSON(object: any): RestartPolicy {
  switch (object) {
    case 0:
    case 'UNKNOWN_POLICY':
      return RestartPolicy.UNKNOWN_POLICY
    case 1:
    case 'EMPTY':
      return RestartPolicy.EMPTY
    case 2:
    case 'ALWAYS':
      return RestartPolicy.ALWAYS
    case 3:
    case 'UNLESS_STOPPED':
      return RestartPolicy.UNLESS_STOPPED
    case 4:
    case 'NO':
      return RestartPolicy.NO
    case 5:
    case 'ON_FAILURE':
      return RestartPolicy.ON_FAILURE
    case -1:
    case 'UNRECOGNIZED':
    default:
      return RestartPolicy.UNRECOGNIZED
  }
}

export function restartPolicyToJSON(object: RestartPolicy): string {
  switch (object) {
    case RestartPolicy.UNKNOWN_POLICY:
      return 'UNKNOWN_POLICY'
    case RestartPolicy.EMPTY:
      return 'EMPTY'
    case RestartPolicy.ALWAYS:
      return 'ALWAYS'
    case RestartPolicy.UNLESS_STOPPED:
      return 'UNLESS_STOPPED'
    case RestartPolicy.NO:
      return 'NO'
    case RestartPolicy.ON_FAILURE:
      return 'ON_FAILURE'
    case RestartPolicy.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum DeploymentStrategy {
  UNKOWN_DEPLOYMENT_STRATEGY = 0,
  RECREATE = 1,
  ROLLING = 2,
  UNRECOGNIZED = -1,
}

export function deploymentStrategyFromJSON(object: any): DeploymentStrategy {
  switch (object) {
    case 0:
    case 'UNKOWN_DEPLOYMENT_STRATEGY':
      return DeploymentStrategy.UNKOWN_DEPLOYMENT_STRATEGY
    case 1:
    case 'RECREATE':
      return DeploymentStrategy.RECREATE
    case 2:
    case 'ROLLING':
      return DeploymentStrategy.ROLLING
    case -1:
    case 'UNRECOGNIZED':
    default:
      return DeploymentStrategy.UNRECOGNIZED
  }
}

export function deploymentStrategyToJSON(object: DeploymentStrategy): string {
  switch (object) {
    case DeploymentStrategy.UNKOWN_DEPLOYMENT_STRATEGY:
      return 'UNKOWN_DEPLOYMENT_STRATEGY'
    case DeploymentStrategy.RECREATE:
      return 'RECREATE'
    case DeploymentStrategy.ROLLING:
      return 'ROLLING'
    case DeploymentStrategy.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export interface ContainerStateItem {
  containerId: string
  name: string
  command: string
  createdAt: Timestamp | undefined
  /** The 'State' of the container (Created, Running, etc) */
  state: ContainerState
  /**
   * The 'Status' of the container ("Created 1min ago", "Exited with code 123",
   * etc). Unused but left here for reverse compatibility with the legacy
   * version.
   */
  status: string
  imageName: string
  imageTag: string
  ports: Port[]
}

export interface ContainerStateListMessage {
  prefix?: string | undefined
  data: ContainerStateItem[]
}

export interface InstanceDeploymentItem {
  instanceId: string
  state: ContainerState
}

export interface DeploymentStatusMessage {
  instance: InstanceDeploymentItem | undefined
  deploymentStatus: DeploymentStatus | undefined
  log: string[]
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
  type?: string | undefined
  class?: string | undefined
}

export interface Expose {
  /** if expose is needed */
  public: boolean
  /** if tls is needed */
  tls: boolean
}

export interface Ingress {
  name: string
  host: string
  uploadLimit?: string | undefined
}

export interface ConfigContainer {
  image: string
  volume: string
  path: string
  keepFiles: boolean
}

export interface ImportContainer {
  environments: { [key: string]: string }
  volume: string
  command: string
}

export interface ImportContainer_EnvironmentsEntry {
  key: string
  value: string
}

export interface LogConfig {
  driver: string
  options: { [key: string]: string }
}

export interface LogConfig_OptionsEntry {
  key: string
  value: string
}

/**
 * volumes referred as VolumeLink
 * they won't get created if non-existent
 */
export interface VolumeLink {
  name: string
  path: string
}

export interface InitContainer {
  name: string
  image: string
  environments: { [key: string]: string }
  useParentConfig?: boolean | undefined
  volumes: VolumeLink[]
  command: string[]
  args: string[]
}

export interface InitContainer_EnvironmentsEntry {
  key: string
  value: string
}

export interface DagentContainerConfig {
  logConfig?: LogConfig | undefined
  restartPolicy?: RestartPolicy | undefined
  networkMode?: NetworkMode | undefined
  networks: string[]
}

export interface HealthCheckConfig {
  port: number
  livenessProbe?: string | undefined
  readinessProbe?: string | undefined
  startupProbe?: string | undefined
}

export interface Resource {
  cpu?: string | undefined
  memory?: string | undefined
}

export interface ResourceConfig {
  limits?: Resource | undefined
  requests?: Resource | undefined
}

export interface CraneContainerConfig {
  deploymentStatregy?: DeploymentStrategy | undefined
  healthCheckConfig?: HealthCheckConfig | undefined
  resourceConfig?: ResourceConfig | undefined
  proxyHeaders?: boolean | undefined
  useLoadBalancer?: boolean | undefined
  extraLBAnnotations: { [key: string]: string }
  customHeaders: string[]
}

export interface CraneContainerConfig_ExtraLBAnnotationsEntry {
  key: string
  value: string
}

export interface ExplicitContainerConfig {
  dagent?: DagentContainerConfig | undefined
  crane?: CraneContainerConfig | undefined
  expose?: Expose | undefined
  ingress?: Ingress | undefined
  configContainer?: ConfigContainer | undefined
  importContainer?: ImportContainer | undefined
  user?: number | undefined
  TTY?: boolean | undefined
  ports: Port[]
  portRanges: PortRangeBinding[]
  volumes: Volume[]
  command: string[]
  args: string[]
  environments: string[]
  secrets?: KeyValueList | undefined
  initContainers: InitContainer[]
}

export interface UniqueKey {
  id: string
  key: string
}

export interface KeyList {
  data: UniqueKey[]
}

export interface UniqueKeyValue {
  id: string
  key: string
  value: string
}

export interface UniqueKeySecretValue {
  id: string
  key: string
  value: string
  encrypted?: boolean | undefined
}

export interface KeyValueList {
  data: UniqueKeyValue[]
}

export interface SecretList {
  data: UniqueKeySecretValue[]
}

export interface ListSecretsResponse {
  prefix: string
  publicKey: string
  keys: string[]
}

export const COMMON_PACKAGE_NAME = 'common'

function createBaseContainerStateItem(): ContainerStateItem {
  return {
    containerId: '',
    name: '',
    command: '',
    createdAt: undefined,
    state: 0,
    status: '',
    imageName: '',
    imageTag: '',
    ports: [],
  }
}

export const ContainerStateItem = {
  fromJSON(object: any): ContainerStateItem {
    return {
      containerId: isSet(object.containerId) ? String(object.containerId) : '',
      name: isSet(object.name) ? String(object.name) : '',
      command: isSet(object.command) ? String(object.command) : '',
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined,
      state: isSet(object.state) ? containerStateFromJSON(object.state) : 0,
      status: isSet(object.status) ? String(object.status) : '',
      imageName: isSet(object.imageName) ? String(object.imageName) : '',
      imageTag: isSet(object.imageTag) ? String(object.imageTag) : '',
      ports: Array.isArray(object?.ports) ? object.ports.map((e: any) => Port.fromJSON(e)) : [],
    }
  },

  toJSON(message: ContainerStateItem): unknown {
    const obj: any = {}
    message.containerId !== undefined && (obj.containerId = message.containerId)
    message.name !== undefined && (obj.name = message.name)
    message.command !== undefined && (obj.command = message.command)
    message.createdAt !== undefined && (obj.createdAt = fromTimestamp(message.createdAt).toISOString())
    message.state !== undefined && (obj.state = containerStateToJSON(message.state))
    message.status !== undefined && (obj.status = message.status)
    message.imageName !== undefined && (obj.imageName = message.imageName)
    message.imageTag !== undefined && (obj.imageTag = message.imageTag)
    if (message.ports) {
      obj.ports = message.ports.map(e => (e ? Port.toJSON(e) : undefined))
    } else {
      obj.ports = []
    }
    return obj
  },
}

function createBaseContainerStateListMessage(): ContainerStateListMessage {
  return { data: [] }
}

export const ContainerStateListMessage = {
  fromJSON(object: any): ContainerStateListMessage {
    return {
      prefix: isSet(object.prefix) ? String(object.prefix) : undefined,
      data: Array.isArray(object?.data) ? object.data.map((e: any) => ContainerStateItem.fromJSON(e)) : [],
    }
  },

  toJSON(message: ContainerStateListMessage): unknown {
    const obj: any = {}
    message.prefix !== undefined && (obj.prefix = message.prefix)
    if (message.data) {
      obj.data = message.data.map(e => (e ? ContainerStateItem.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },
}

function createBaseInstanceDeploymentItem(): InstanceDeploymentItem {
  return { instanceId: '', state: 0 }
}

export const InstanceDeploymentItem = {
  fromJSON(object: any): InstanceDeploymentItem {
    return {
      instanceId: isSet(object.instanceId) ? String(object.instanceId) : '',
      state: isSet(object.state) ? containerStateFromJSON(object.state) : 0,
    }
  },

  toJSON(message: InstanceDeploymentItem): unknown {
    const obj: any = {}
    message.instanceId !== undefined && (obj.instanceId = message.instanceId)
    message.state !== undefined && (obj.state = containerStateToJSON(message.state))
    return obj
  },
}

function createBaseDeploymentStatusMessage(): DeploymentStatusMessage {
  return { instance: undefined, deploymentStatus: undefined, log: [] }
}

export const DeploymentStatusMessage = {
  fromJSON(object: any): DeploymentStatusMessage {
    return {
      instance: isSet(object.instance) ? InstanceDeploymentItem.fromJSON(object.instance) : undefined,
      deploymentStatus: isSet(object.deploymentStatus) ? deploymentStatusFromJSON(object.deploymentStatus) : undefined,
      log: Array.isArray(object?.log) ? object.log.map((e: any) => String(e)) : [],
    }
  },

  toJSON(message: DeploymentStatusMessage): unknown {
    const obj: any = {}
    message.instance !== undefined &&
      (obj.instance = message.instance ? InstanceDeploymentItem.toJSON(message.instance) : undefined)
    message.deploymentStatus !== undefined &&
      (obj.deploymentStatus =
        message.deploymentStatus !== undefined ? deploymentStatusToJSON(message.deploymentStatus) : undefined)
    if (message.log) {
      obj.log = message.log.map(e => e)
    } else {
      obj.log = []
    }
    return obj
  },
}

function createBasePort(): Port {
  return { internal: 0, external: 0 }
}

export const Port = {
  fromJSON(object: any): Port {
    return {
      internal: isSet(object.internal) ? Number(object.internal) : 0,
      external: isSet(object.external) ? Number(object.external) : 0,
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
      type: isSet(object.type) ? String(object.type) : undefined,
      class: isSet(object.class) ? String(object.class) : undefined,
    }
  },

  toJSON(message: Volume): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.path !== undefined && (obj.path = message.path)
    message.size !== undefined && (obj.size = message.size)
    message.type !== undefined && (obj.type = message.type)
    message.class !== undefined && (obj.class = message.class)
    return obj
  },
}

function createBaseExpose(): Expose {
  return { public: false, tls: false }
}

export const Expose = {
  fromJSON(object: any): Expose {
    return {
      public: isSet(object.public) ? Boolean(object.public) : false,
      tls: isSet(object.tls) ? Boolean(object.tls) : false,
    }
  },

  toJSON(message: Expose): unknown {
    const obj: any = {}
    message.public !== undefined && (obj.public = message.public)
    message.tls !== undefined && (obj.tls = message.tls)
    return obj
  },
}

function createBaseIngress(): Ingress {
  return { name: '', host: '' }
}

export const Ingress = {
  fromJSON(object: any): Ingress {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      host: isSet(object.host) ? String(object.host) : '',
      uploadLimit: isSet(object.uploadLimit) ? String(object.uploadLimit) : undefined,
    }
  },

  toJSON(message: Ingress): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.host !== undefined && (obj.host = message.host)
    message.uploadLimit !== undefined && (obj.uploadLimit = message.uploadLimit)
    return obj
  },
}

function createBaseConfigContainer(): ConfigContainer {
  return { image: '', volume: '', path: '', keepFiles: false }
}

export const ConfigContainer = {
  fromJSON(object: any): ConfigContainer {
    return {
      image: isSet(object.image) ? String(object.image) : '',
      volume: isSet(object.volume) ? String(object.volume) : '',
      path: isSet(object.path) ? String(object.path) : '',
      keepFiles: isSet(object.keepFiles) ? Boolean(object.keepFiles) : false,
    }
  },

  toJSON(message: ConfigContainer): unknown {
    const obj: any = {}
    message.image !== undefined && (obj.image = message.image)
    message.volume !== undefined && (obj.volume = message.volume)
    message.path !== undefined && (obj.path = message.path)
    message.keepFiles !== undefined && (obj.keepFiles = message.keepFiles)
    return obj
  },
}

function createBaseImportContainer(): ImportContainer {
  return { environments: {}, volume: '', command: '' }
}

export const ImportContainer = {
  fromJSON(object: any): ImportContainer {
    return {
      environments: isObject(object.environments)
        ? Object.entries(object.environments).reduce<{ [key: string]: string }>((acc, [key, value]) => {
            acc[key] = String(value)
            return acc
          }, {})
        : {},
      volume: isSet(object.volume) ? String(object.volume) : '',
      command: isSet(object.command) ? String(object.command) : '',
    }
  },

  toJSON(message: ImportContainer): unknown {
    const obj: any = {}
    obj.environments = {}
    if (message.environments) {
      Object.entries(message.environments).forEach(([k, v]) => {
        obj.environments[k] = v
      })
    }
    message.volume !== undefined && (obj.volume = message.volume)
    message.command !== undefined && (obj.command = message.command)
    return obj
  },
}

function createBaseImportContainer_EnvironmentsEntry(): ImportContainer_EnvironmentsEntry {
  return { key: '', value: '' }
}

export const ImportContainer_EnvironmentsEntry = {
  fromJSON(object: any): ImportContainer_EnvironmentsEntry {
    return { key: isSet(object.key) ? String(object.key) : '', value: isSet(object.value) ? String(object.value) : '' }
  },

  toJSON(message: ImportContainer_EnvironmentsEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

function createBaseLogConfig(): LogConfig {
  return { driver: '', options: {} }
}

export const LogConfig = {
  fromJSON(object: any): LogConfig {
    return {
      driver: isSet(object.driver) ? String(object.driver) : '',
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
    message.driver !== undefined && (obj.driver = message.driver)
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
  return { name: '', image: '', environments: {}, volumes: [], command: [], args: [] }
}

export const InitContainer = {
  fromJSON(object: any): InitContainer {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      image: isSet(object.image) ? String(object.image) : '',
      environments: isObject(object.environments)
        ? Object.entries(object.environments).reduce<{ [key: string]: string }>((acc, [key, value]) => {
            acc[key] = String(value)
            return acc
          }, {})
        : {},
      useParentConfig: isSet(object.useParentConfig) ? Boolean(object.useParentConfig) : undefined,
      volumes: Array.isArray(object?.volumes) ? object.volumes.map((e: any) => VolumeLink.fromJSON(e)) : [],
      command: Array.isArray(object?.command) ? object.command.map((e: any) => String(e)) : [],
      args: Array.isArray(object?.args) ? object.args.map((e: any) => String(e)) : [],
    }
  },

  toJSON(message: InitContainer): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.image !== undefined && (obj.image = message.image)
    obj.environments = {}
    if (message.environments) {
      Object.entries(message.environments).forEach(([k, v]) => {
        obj.environments[k] = v
      })
    }
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
    return obj
  },
}

function createBaseInitContainer_EnvironmentsEntry(): InitContainer_EnvironmentsEntry {
  return { key: '', value: '' }
}

export const InitContainer_EnvironmentsEntry = {
  fromJSON(object: any): InitContainer_EnvironmentsEntry {
    return { key: isSet(object.key) ? String(object.key) : '', value: isSet(object.value) ? String(object.value) : '' }
  },

  toJSON(message: InitContainer_EnvironmentsEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

function createBaseDagentContainerConfig(): DagentContainerConfig {
  return { networks: [] }
}

export const DagentContainerConfig = {
  fromJSON(object: any): DagentContainerConfig {
    return {
      logConfig: isSet(object.logConfig) ? LogConfig.fromJSON(object.logConfig) : undefined,
      restartPolicy: isSet(object.restartPolicy) ? restartPolicyFromJSON(object.restartPolicy) : undefined,
      networkMode: isSet(object.networkMode) ? networkModeFromJSON(object.networkMode) : undefined,
      networks: Array.isArray(object?.networks) ? object.networks.map((e: any) => String(e)) : [],
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
    return obj
  },
}

function createBaseHealthCheckConfig(): HealthCheckConfig {
  return { port: 0 }
}

export const HealthCheckConfig = {
  fromJSON(object: any): HealthCheckConfig {
    return {
      port: isSet(object.port) ? Number(object.port) : 0,
      livenessProbe: isSet(object.livenessProbe) ? String(object.livenessProbe) : undefined,
      readinessProbe: isSet(object.readinessProbe) ? String(object.readinessProbe) : undefined,
      startupProbe: isSet(object.startupProbe) ? String(object.startupProbe) : undefined,
    }
  },

  toJSON(message: HealthCheckConfig): unknown {
    const obj: any = {}
    message.port !== undefined && (obj.port = Math.round(message.port))
    message.livenessProbe !== undefined && (obj.livenessProbe = message.livenessProbe)
    message.readinessProbe !== undefined && (obj.readinessProbe = message.readinessProbe)
    message.startupProbe !== undefined && (obj.startupProbe = message.startupProbe)
    return obj
  },
}

function createBaseResource(): Resource {
  return {}
}

export const Resource = {
  fromJSON(object: any): Resource {
    return {
      cpu: isSet(object.cpu) ? String(object.cpu) : undefined,
      memory: isSet(object.memory) ? String(object.memory) : undefined,
    }
  },

  toJSON(message: Resource): unknown {
    const obj: any = {}
    message.cpu !== undefined && (obj.cpu = message.cpu)
    message.memory !== undefined && (obj.memory = message.memory)
    return obj
  },
}

function createBaseResourceConfig(): ResourceConfig {
  return {}
}

export const ResourceConfig = {
  fromJSON(object: any): ResourceConfig {
    return {
      limits: isSet(object.limits) ? Resource.fromJSON(object.limits) : undefined,
      requests: isSet(object.requests) ? Resource.fromJSON(object.requests) : undefined,
    }
  },

  toJSON(message: ResourceConfig): unknown {
    const obj: any = {}
    message.limits !== undefined && (obj.limits = message.limits ? Resource.toJSON(message.limits) : undefined)
    message.requests !== undefined && (obj.requests = message.requests ? Resource.toJSON(message.requests) : undefined)
    return obj
  },
}

function createBaseCraneContainerConfig(): CraneContainerConfig {
  return { extraLBAnnotations: {}, customHeaders: [] }
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
      extraLBAnnotations: isObject(object.extraLBAnnotations)
        ? Object.entries(object.extraLBAnnotations).reduce<{ [key: string]: string }>((acc, [key, value]) => {
            acc[key] = String(value)
            return acc
          }, {})
        : {},
      customHeaders: Array.isArray(object?.customHeaders) ? object.customHeaders.map((e: any) => String(e)) : [],
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
    obj.extraLBAnnotations = {}
    if (message.extraLBAnnotations) {
      Object.entries(message.extraLBAnnotations).forEach(([k, v]) => {
        obj.extraLBAnnotations[k] = v
      })
    }
    if (message.customHeaders) {
      obj.customHeaders = message.customHeaders.map(e => e)
    } else {
      obj.customHeaders = []
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

function createBaseExplicitContainerConfig(): ExplicitContainerConfig {
  return { ports: [], portRanges: [], volumes: [], command: [], args: [], environments: [], initContainers: [] }
}

export const ExplicitContainerConfig = {
  fromJSON(object: any): ExplicitContainerConfig {
    return {
      dagent: isSet(object.dagent) ? DagentContainerConfig.fromJSON(object.dagent) : undefined,
      crane: isSet(object.crane) ? CraneContainerConfig.fromJSON(object.crane) : undefined,
      expose: isSet(object.expose) ? Expose.fromJSON(object.expose) : undefined,
      ingress: isSet(object.ingress) ? Ingress.fromJSON(object.ingress) : undefined,
      configContainer: isSet(object.configContainer) ? ConfigContainer.fromJSON(object.configContainer) : undefined,
      importContainer: isSet(object.importContainer) ? ImportContainer.fromJSON(object.importContainer) : undefined,
      user: isSet(object.user) ? Number(object.user) : undefined,
      TTY: isSet(object.TTY) ? Boolean(object.TTY) : undefined,
      ports: Array.isArray(object?.ports) ? object.ports.map((e: any) => Port.fromJSON(e)) : [],
      portRanges: Array.isArray(object?.portRanges)
        ? object.portRanges.map((e: any) => PortRangeBinding.fromJSON(e))
        : [],
      volumes: Array.isArray(object?.volumes) ? object.volumes.map((e: any) => Volume.fromJSON(e)) : [],
      command: Array.isArray(object?.command) ? object.command.map((e: any) => String(e)) : [],
      args: Array.isArray(object?.args) ? object.args.map((e: any) => String(e)) : [],
      environments: Array.isArray(object?.environments) ? object.environments.map((e: any) => String(e)) : [],
      secrets: isSet(object.secrets) ? KeyValueList.fromJSON(object.secrets) : undefined,
      initContainers: Array.isArray(object?.initContainers)
        ? object.initContainers.map((e: any) => InitContainer.fromJSON(e))
        : [],
    }
  },

  toJSON(message: ExplicitContainerConfig): unknown {
    const obj: any = {}
    message.dagent !== undefined &&
      (obj.dagent = message.dagent ? DagentContainerConfig.toJSON(message.dagent) : undefined)
    message.crane !== undefined && (obj.crane = message.crane ? CraneContainerConfig.toJSON(message.crane) : undefined)
    message.expose !== undefined && (obj.expose = message.expose ? Expose.toJSON(message.expose) : undefined)
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
    if (message.environments) {
      obj.environments = message.environments.map(e => e)
    } else {
      obj.environments = []
    }
    message.secrets !== undefined && (obj.secrets = message.secrets ? KeyValueList.toJSON(message.secrets) : undefined)
    if (message.initContainers) {
      obj.initContainers = message.initContainers.map(e => (e ? InitContainer.toJSON(e) : undefined))
    } else {
      obj.initContainers = []
    }
    return obj
  },
}

function createBaseUniqueKey(): UniqueKey {
  return { id: '', key: '' }
}

export const UniqueKey = {
  fromJSON(object: any): UniqueKey {
    return { id: isSet(object.id) ? String(object.id) : '', key: isSet(object.key) ? String(object.key) : '' }
  },

  toJSON(message: UniqueKey): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.key !== undefined && (obj.key = message.key)
    return obj
  },
}

function createBaseKeyList(): KeyList {
  return { data: [] }
}

export const KeyList = {
  fromJSON(object: any): KeyList {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => UniqueKey.fromJSON(e)) : [] }
  },

  toJSON(message: KeyList): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? UniqueKey.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },
}

function createBaseUniqueKeyValue(): UniqueKeyValue {
  return { id: '', key: '', value: '' }
}

export const UniqueKeyValue = {
  fromJSON(object: any): UniqueKeyValue {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      key: isSet(object.key) ? String(object.key) : '',
      value: isSet(object.value) ? String(object.value) : '',
    }
  },

  toJSON(message: UniqueKeyValue): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

function createBaseUniqueKeySecretValue(): UniqueKeySecretValue {
  return { id: '', key: '', value: '' }
}

export const UniqueKeySecretValue = {
  fromJSON(object: any): UniqueKeySecretValue {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      key: isSet(object.key) ? String(object.key) : '',
      value: isSet(object.value) ? String(object.value) : '',
      encrypted: isSet(object.encrypted) ? Boolean(object.encrypted) : undefined,
    }
  },

  toJSON(message: UniqueKeySecretValue): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    message.encrypted !== undefined && (obj.encrypted = message.encrypted)
    return obj
  },
}

function createBaseKeyValueList(): KeyValueList {
  return { data: [] }
}

export const KeyValueList = {
  fromJSON(object: any): KeyValueList {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => UniqueKeyValue.fromJSON(e)) : [] }
  },

  toJSON(message: KeyValueList): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? UniqueKeyValue.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },
}

function createBaseSecretList(): SecretList {
  return { data: [] }
}

export const SecretList = {
  fromJSON(object: any): SecretList {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => UniqueKeySecretValue.fromJSON(e)) : [] }
  },

  toJSON(message: SecretList): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? UniqueKeySecretValue.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },
}

function createBaseListSecretsResponse(): ListSecretsResponse {
  return { prefix: '', publicKey: '', keys: [] }
}

export const ListSecretsResponse = {
  fromJSON(object: any): ListSecretsResponse {
    return {
      prefix: isSet(object.prefix) ? String(object.prefix) : '',
      publicKey: isSet(object.publicKey) ? String(object.publicKey) : '',
      keys: Array.isArray(object?.keys) ? object.keys.map((e: any) => String(e)) : [],
    }
  },

  toJSON(message: ListSecretsResponse): unknown {
    const obj: any = {}
    message.prefix !== undefined && (obj.prefix = message.prefix)
    message.publicKey !== undefined && (obj.publicKey = message.publicKey)
    if (message.keys) {
      obj.keys = message.keys.map(e => e)
    } else {
      obj.keys = []
    }
    return obj
  },
}

function toTimestamp(date: Date): Timestamp {
  const seconds = date.getTime() / 1_000
  const nanos = (date.getTime() % 1_000) * 1_000_000
  return { seconds, nanos }
}

function fromTimestamp(t: Timestamp): Date {
  let millis = t.seconds * 1_000
  millis += t.nanos / 1_000_000
  return new Date(millis)
}

function fromJsonTimestamp(o: any): Timestamp {
  if (o instanceof Date) {
    return toTimestamp(o)
  } else if (typeof o === 'string') {
    return toTimestamp(new Date(o))
  } else {
    return Timestamp.fromJSON(o)
  }
}

function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined
}
