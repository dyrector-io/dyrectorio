/* eslint-disable */
import { util, configure } from 'protobufjs/minimal'
import * as Long from 'long'
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
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

export interface InitContainer {
  image: string
  command: string[]
  args: string[]
  environments: { [key: string]: string }
  useParentConfig: boolean
  volumes: InitContainer_VolumeLink[]
}

export interface InitContainer_EnvironmentsEntry {
  key: string
  value: string
}

export interface InitContainer_VolumeLink {
  name: string
  path: string
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
  InitContainers: InitContainer[]
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

const baseContainerStateItem: object = {
  containerId: '',
  name: '',
  command: '',
  state: 0,
  status: '',
  imageName: '',
  imageTag: '',
}

export const ContainerStateItem = {
  fromJSON(object: any): ContainerStateItem {
    const message = { ...baseContainerStateItem } as ContainerStateItem
    message.containerId =
      object.containerId !== undefined && object.containerId !== null ? String(object.containerId) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.command = object.command !== undefined && object.command !== null ? String(object.command) : ''
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null ? fromJsonTimestamp(object.createdAt) : undefined
    message.state = object.state !== undefined && object.state !== null ? containerStateFromJSON(object.state) : 0
    message.status = object.status !== undefined && object.status !== null ? String(object.status) : ''
    message.imageName = object.imageName !== undefined && object.imageName !== null ? String(object.imageName) : ''
    message.imageTag = object.imageTag !== undefined && object.imageTag !== null ? String(object.imageTag) : ''
    message.ports = (object.ports ?? []).map((e: any) => Port.fromJSON(e))
    return message
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

const baseContainerStateListMessage: object = {}

export const ContainerStateListMessage = {
  fromJSON(object: any): ContainerStateListMessage {
    const message = {
      ...baseContainerStateListMessage,
    } as ContainerStateListMessage
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : undefined
    message.data = (object.data ?? []).map((e: any) => ContainerStateItem.fromJSON(e))
    return message
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

const baseInstanceDeploymentItem: object = { instanceId: '', state: 0 }

export const InstanceDeploymentItem = {
  fromJSON(object: any): InstanceDeploymentItem {
    const message = { ...baseInstanceDeploymentItem } as InstanceDeploymentItem
    message.instanceId = object.instanceId !== undefined && object.instanceId !== null ? String(object.instanceId) : ''
    message.state = object.state !== undefined && object.state !== null ? containerStateFromJSON(object.state) : 0
    return message
  },

  toJSON(message: InstanceDeploymentItem): unknown {
    const obj: any = {}
    message.instanceId !== undefined && (obj.instanceId = message.instanceId)
    message.state !== undefined && (obj.state = containerStateToJSON(message.state))
    return obj
  },
}

const baseDeploymentStatusMessage: object = { log: '' }

export const DeploymentStatusMessage = {
  fromJSON(object: any): DeploymentStatusMessage {
    const message = {
      ...baseDeploymentStatusMessage,
    } as DeploymentStatusMessage
    message.instance =
      object.instance !== undefined && object.instance !== null
        ? InstanceDeploymentItem.fromJSON(object.instance)
        : undefined
    message.deploymentStatus =
      object.deploymentStatus !== undefined && object.deploymentStatus !== null
        ? deploymentStatusFromJSON(object.deploymentStatus)
        : undefined
    message.log = (object.log ?? []).map((e: any) => String(e))
    return message
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
    message.type = object.type !== undefined && object.type !== null ? String(object.type) : undefined
    message.class = object.class !== undefined && object.class !== null ? String(object.class) : undefined
    return message
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

const baseExpose: object = { public: false, tls: false }

export const Expose = {
  fromJSON(object: any): Expose {
    const message = { ...baseExpose } as Expose
    message.public = object.public !== undefined && object.public !== null ? Boolean(object.public) : false
    message.tls = object.tls !== undefined && object.tls !== null ? Boolean(object.tls) : false
    return message
  },

  toJSON(message: Expose): unknown {
    const obj: any = {}
    message.public !== undefined && (obj.public = message.public)
    message.tls !== undefined && (obj.tls = message.tls)
    return obj
  },
}

const baseIngress: object = { name: '', host: '' }

export const Ingress = {
  fromJSON(object: any): Ingress {
    const message = { ...baseIngress } as Ingress
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.host = object.host !== undefined && object.host !== null ? String(object.host) : ''
    message.uploadLimit =
      object.uploadLimit !== undefined && object.uploadLimit !== null ? String(object.uploadLimit) : undefined
    return message
  },

  toJSON(message: Ingress): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.host !== undefined && (obj.host = message.host)
    message.uploadLimit !== undefined && (obj.uploadLimit = message.uploadLimit)
    return obj
  },
}

const baseConfigContainer: object = {
  image: '',
  volume: '',
  path: '',
  keepFiles: false,
}

export const ConfigContainer = {
  fromJSON(object: any): ConfigContainer {
    const message = { ...baseConfigContainer } as ConfigContainer
    message.image = object.image !== undefined && object.image !== null ? String(object.image) : ''
    message.volume = object.volume !== undefined && object.volume !== null ? String(object.volume) : ''
    message.path = object.path !== undefined && object.path !== null ? String(object.path) : ''
    message.keepFiles = object.keepFiles !== undefined && object.keepFiles !== null ? Boolean(object.keepFiles) : false
    return message
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

const baseImportContainer: object = { volume: '', command: '' }

export const ImportContainer = {
  fromJSON(object: any): ImportContainer {
    const message = { ...baseImportContainer } as ImportContainer
    message.environments = Object.entries(object.environments ?? {}).reduce<{
      [key: string]: string
    }>((acc, [key, value]) => {
      acc[key] = String(value)
      return acc
    }, {})
    message.volume = object.volume !== undefined && object.volume !== null ? String(object.volume) : ''
    message.command = object.command !== undefined && object.command !== null ? String(object.command) : ''
    return message
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

const baseImportContainer_EnvironmentsEntry: object = { key: '', value: '' }

export const ImportContainer_EnvironmentsEntry = {
  fromJSON(object: any): ImportContainer_EnvironmentsEntry {
    const message = {
      ...baseImportContainer_EnvironmentsEntry,
    } as ImportContainer_EnvironmentsEntry
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    message.value = object.value !== undefined && object.value !== null ? String(object.value) : ''
    return message
  },

  toJSON(message: ImportContainer_EnvironmentsEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

const baseLogConfig: object = { driver: '' }

export const LogConfig = {
  fromJSON(object: any): LogConfig {
    const message = { ...baseLogConfig } as LogConfig
    message.driver = object.driver !== undefined && object.driver !== null ? String(object.driver) : ''
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

const baseInitContainer: object = {
  image: '',
  command: '',
  args: '',
  useParentConfig: false,
}

export const InitContainer = {
  fromJSON(object: any): InitContainer {
    const message = { ...baseInitContainer } as InitContainer
    message.image = object.image !== undefined && object.image !== null ? String(object.image) : ''
    message.command = (object.command ?? []).map((e: any) => String(e))
    message.args = (object.args ?? []).map((e: any) => String(e))
    message.environments = Object.entries(object.environments ?? {}).reduce<{
      [key: string]: string
    }>((acc, [key, value]) => {
      acc[key] = String(value)
      return acc
    }, {})
    message.useParentConfig =
      object.useParentConfig !== undefined && object.useParentConfig !== null ? Boolean(object.useParentConfig) : false
    message.volumes = (object.volumes ?? []).map((e: any) => InitContainer_VolumeLink.fromJSON(e))
    return message
  },

  toJSON(message: InitContainer): unknown {
    const obj: any = {}
    message.image !== undefined && (obj.image = message.image)
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
    obj.environments = {}
    if (message.environments) {
      Object.entries(message.environments).forEach(([k, v]) => {
        obj.environments[k] = v
      })
    }
    message.useParentConfig !== undefined && (obj.useParentConfig = message.useParentConfig)
    if (message.volumes) {
      obj.volumes = message.volumes.map(e => (e ? InitContainer_VolumeLink.toJSON(e) : undefined))
    } else {
      obj.volumes = []
    }
    return obj
  },
}

const baseInitContainer_EnvironmentsEntry: object = { key: '', value: '' }

export const InitContainer_EnvironmentsEntry = {
  fromJSON(object: any): InitContainer_EnvironmentsEntry {
    const message = {
      ...baseInitContainer_EnvironmentsEntry,
    } as InitContainer_EnvironmentsEntry
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    message.value = object.value !== undefined && object.value !== null ? String(object.value) : ''
    return message
  },

  toJSON(message: InitContainer_EnvironmentsEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

const baseInitContainer_VolumeLink: object = { name: '', path: '' }

export const InitContainer_VolumeLink = {
  fromJSON(object: any): InitContainer_VolumeLink {
    const message = {
      ...baseInitContainer_VolumeLink,
    } as InitContainer_VolumeLink
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.path = object.path !== undefined && object.path !== null ? String(object.path) : ''
    return message
  },

  toJSON(message: InitContainer_VolumeLink): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.path !== undefined && (obj.path = message.path)
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

const baseHealthCheckConfig: object = { port: 0 }

export const HealthCheckConfig = {
  fromJSON(object: any): HealthCheckConfig {
    const message = { ...baseHealthCheckConfig } as HealthCheckConfig
    message.port = object.port !== undefined && object.port !== null ? Number(object.port) : 0
    message.livenessProbe =
      object.livenessProbe !== undefined && object.livenessProbe !== null ? String(object.livenessProbe) : undefined
    message.readinessProbe =
      object.readinessProbe !== undefined && object.readinessProbe !== null ? String(object.readinessProbe) : undefined
    message.startupProbe =
      object.startupProbe !== undefined && object.startupProbe !== null ? String(object.startupProbe) : undefined
    return message
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

const baseResource: object = {}

export const Resource = {
  fromJSON(object: any): Resource {
    const message = { ...baseResource } as Resource
    message.cpu = object.cpu !== undefined && object.cpu !== null ? String(object.cpu) : undefined
    message.memory = object.memory !== undefined && object.memory !== null ? String(object.memory) : undefined
    return message
  },

  toJSON(message: Resource): unknown {
    const obj: any = {}
    message.cpu !== undefined && (obj.cpu = message.cpu)
    message.memory !== undefined && (obj.memory = message.memory)
    return obj
  },
}

const baseResourceConfig: object = {}

export const ResourceConfig = {
  fromJSON(object: any): ResourceConfig {
    const message = { ...baseResourceConfig } as ResourceConfig
    message.limits =
      object.limits !== undefined && object.limits !== null ? Resource.fromJSON(object.limits) : undefined
    message.requests =
      object.requests !== undefined && object.requests !== null ? Resource.fromJSON(object.requests) : undefined
    return message
  },

  toJSON(message: ResourceConfig): unknown {
    const obj: any = {}
    message.limits !== undefined && (obj.limits = message.limits ? Resource.toJSON(message.limits) : undefined)
    message.requests !== undefined && (obj.requests = message.requests ? Resource.toJSON(message.requests) : undefined)
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
    message.extraLBAnnotations = Object.entries(object.extraLBAnnotations ?? {}).reduce<{ [key: string]: string }>(
      (acc, [key, value]) => {
        acc[key] = String(value)
        return acc
      },
      {},
    )
    message.customHeaders = (object.customHeaders ?? []).map((e: any) => String(e))
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

const baseExplicitContainerConfig: object = {
  command: '',
  args: '',
  environments: '',
}

export const ExplicitContainerConfig = {
  fromJSON(object: any): ExplicitContainerConfig {
    const message = {
      ...baseExplicitContainerConfig,
    } as ExplicitContainerConfig
    message.dagent =
      object.dagent !== undefined && object.dagent !== null ? DagentContainerConfig.fromJSON(object.dagent) : undefined
    message.crane =
      object.crane !== undefined && object.crane !== null ? CraneContainerConfig.fromJSON(object.crane) : undefined
    message.expose = object.expose !== undefined && object.expose !== null ? Expose.fromJSON(object.expose) : undefined
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
    message.command = (object.command ?? []).map((e: any) => String(e))
    message.args = (object.args ?? []).map((e: any) => String(e))
    message.environments = (object.environments ?? []).map((e: any) => String(e))
    message.secrets =
      object.secrets !== undefined && object.secrets !== null ? KeyValueList.fromJSON(object.secrets) : undefined
    message.InitContainers = (object.InitContainers ?? []).map((e: any) => InitContainer.fromJSON(e))
    return message
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
    if (message.InitContainers) {
      obj.InitContainers = message.InitContainers.map(e => (e ? InitContainer.toJSON(e) : undefined))
    } else {
      obj.InitContainers = []
    }
    return obj
  },
}

const baseUniqueKey: object = { id: '', key: '' }

export const UniqueKey = {
  fromJSON(object: any): UniqueKey {
    const message = { ...baseUniqueKey } as UniqueKey
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    return message
  },

  toJSON(message: UniqueKey): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.key !== undefined && (obj.key = message.key)
    return obj
  },
}

const baseKeyList: object = {}

export const KeyList = {
  fromJSON(object: any): KeyList {
    const message = { ...baseKeyList } as KeyList
    message.data = (object.data ?? []).map((e: any) => UniqueKey.fromJSON(e))
    return message
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

const baseUniqueKeyValue: object = { id: '', key: '', value: '' }

export const UniqueKeyValue = {
  fromJSON(object: any): UniqueKeyValue {
    const message = { ...baseUniqueKeyValue } as UniqueKeyValue
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    message.value = object.value !== undefined && object.value !== null ? String(object.value) : ''
    return message
  },

  toJSON(message: UniqueKeyValue): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

const baseUniqueKeySecretValue: object = { id: '', key: '', value: '' }

export const UniqueKeySecretValue = {
  fromJSON(object: any): UniqueKeySecretValue {
    const message = { ...baseUniqueKeySecretValue } as UniqueKeySecretValue
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    message.value = object.value !== undefined && object.value !== null ? String(object.value) : ''
    message.encrypted =
      object.encrypted !== undefined && object.encrypted !== null ? Boolean(object.encrypted) : undefined
    return message
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

const baseKeyValueList: object = {}

export const KeyValueList = {
  fromJSON(object: any): KeyValueList {
    const message = { ...baseKeyValueList } as KeyValueList
    message.data = (object.data ?? []).map((e: any) => UniqueKeyValue.fromJSON(e))
    return message
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

const baseSecretList: object = {}

export const SecretList = {
  fromJSON(object: any): SecretList {
    const message = { ...baseSecretList } as SecretList
    message.data = (object.data ?? []).map((e: any) => UniqueKeySecretValue.fromJSON(e))
    return message
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

const baseListSecretsResponse: object = { prefix: '', publicKey: '', keys: '' }

export const ListSecretsResponse = {
  fromJSON(object: any): ListSecretsResponse {
    const message = { ...baseListSecretsResponse } as ListSecretsResponse
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : ''
    message.publicKey = object.publicKey !== undefined && object.publicKey !== null ? String(object.publicKey) : ''
    message.keys = (object.keys ?? []).map((e: any) => String(e))
    return message
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

// If you get a compile-error about 'Constructor<Long> and ... have no overlap',
// add '--ts_proto_opt=esModuleInterop=true' as a flag when calling 'protoc'.
if (util.Long !== Long) {
  util.Long = Long as any
  configure()
}
