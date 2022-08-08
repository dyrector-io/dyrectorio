/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices'
import { util, configure } from 'protobufjs/minimal'
import * as Long from 'long'
import { Observable } from 'rxjs'
import { Metadata } from '@grpc/grpc-js'
import { DeploymentStatusMessage, ContainerStatusListMessage } from './crux'

export const protobufPackage = 'agent'

/**
 * Container agent interface messages and service definitions
 * Logs, statuses, deployments
 */

export interface Empty {}

/**  */
export interface AgentInfo {
  id: string
  version: string
}

export interface AgentCommand {
  deploy: VersionDeployRequest | undefined
  containerStatus: ContainerStatusRequest | undefined
  containerDelete: ContainerDeleteRequest | undefined
  deployLegacy: DeployRequestLegacy | undefined
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

/** Deploys a single container */
export interface DeployRequest {
  id: string
  /** InstanceConfig is set for multiple containers */
  instanceConfig: DeployRequest_InstanceConfig | undefined
  /** Runtime info and requirements of a container */
  containerConfig: DeployRequest_ContainerConfig | undefined
  runtimeConfig?: string | undefined
  registry?: string | undefined
  imageName: string
  tag: string
  registryAuth?: DeployRequest_RegistryAuth | undefined
}

export interface DeployRequest_InstanceConfig {
  /**
   * containerPreName, mapped into host folder structure,
   * used as namespace id
   */
  prefix: string
  /** mount path of instance (docker only) */
  mountPath?: string | undefined
  /** environment variable map (piped) */
  environment?: DeployRequest_InstanceConfig_Environment | undefined
  /** registry repo prefix */
  repositoryPrefix?: string | undefined
}

export interface DeployRequest_InstanceConfig_Environment {
  env: string[]
}

export interface DeployRequest_ContainerConfig {
  /** Container name - must have, used by everthing */
  name: string
  /** Container prefix */
  prefix?: string | undefined
  /** container ports */
  ports: DeployRequest_ContainerConfig_Port[]
  /** volume mounts in a piped format */
  mounts: string[]
  /** environment variables in a piped format */
  environments: string[]
  /** could be enum, i'm not sure if it is in use */
  networkMode?: string | undefined
  /** runtime config type if given, magic can happen */
  runtimeConfigType?: DeployRequest_ContainerConfig_RuntimeConfigType | undefined
  /** exposure configuration */
  expose?: DeployRequest_ContainerConfig_Expose | undefined
  /**
   * Config container is started before the container and contents are copied
   * to the volume set
   */
  configContainer?: DeployRequest_ContainerConfig_ConfigContainer | undefined
  /** userId that is used to run the container, number */
  user: number
}

export enum DeployRequest_ContainerConfig_RuntimeConfigType {
  /** DOTNET_APPCONFIG - appconfig will be parsed into environment variables */
  DOTNET_APPCONFIG = 0,
  UNRECOGNIZED = -1,
}

export function deployRequest_ContainerConfig_RuntimeConfigTypeFromJSON(
  object: any,
): DeployRequest_ContainerConfig_RuntimeConfigType {
  switch (object) {
    case 0:
    case 'DOTNET_APPCONFIG':
      return DeployRequest_ContainerConfig_RuntimeConfigType.DOTNET_APPCONFIG
    case -1:
    case 'UNRECOGNIZED':
    default:
      return DeployRequest_ContainerConfig_RuntimeConfigType.UNRECOGNIZED
  }
}

export function deployRequest_ContainerConfig_RuntimeConfigTypeToJSON(
  object: DeployRequest_ContainerConfig_RuntimeConfigType,
): string {
  switch (object) {
    case DeployRequest_ContainerConfig_RuntimeConfigType.DOTNET_APPCONFIG:
      return 'DOTNET_APPCONFIG'
    default:
      return 'UNKNOWN'
  }
}

export interface DeployRequest_ContainerConfig_Port {
  /** internal that is bound by the container */
  internal: number
  /** external is docker only */
  external: number
}

export interface DeployRequest_ContainerConfig_Expose {
  /** if expose is needed */
  public: boolean
  /** if tls is needed */
  tls: boolean
}

export interface DeployRequest_ContainerConfig_ConfigContainer {
  image: string
  volume: string
  path: string
  keepFiles: boolean
}

export interface DeployRequest_RegistryAuth {
  name: string
  url: string
  user: string
  password: string
}

export interface ContainerStatusRequest {
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

const baseEmpty: object = {}

export const Empty = {
  fromJSON(_: any): Empty {
    const message = { ...baseEmpty } as Empty
    return message
  },

  toJSON(_: Empty): unknown {
    const obj: any = {}
    return obj
  },
}

const baseAgentInfo: object = { id: '', version: '' }

export const AgentInfo = {
  fromJSON(object: any): AgentInfo {
    const message = { ...baseAgentInfo } as AgentInfo
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.version = object.version !== undefined && object.version !== null ? String(object.version) : ''
    return message
  },

  toJSON(message: AgentInfo): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.version !== undefined && (obj.version = message.version)
    return obj
  },
}

const baseAgentCommand: object = {}

export const AgentCommand = {
  fromJSON(object: any): AgentCommand {
    const message = { ...baseAgentCommand } as AgentCommand
    message.deploy =
      object.deploy !== undefined && object.deploy !== null ? VersionDeployRequest.fromJSON(object.deploy) : undefined
    message.containerStatus =
      object.containerStatus !== undefined && object.containerStatus !== null
        ? ContainerStatusRequest.fromJSON(object.containerStatus)
        : undefined
    message.containerDelete =
      object.containerDelete !== undefined && object.containerDelete !== null
        ? ContainerDeleteRequest.fromJSON(object.containerDelete)
        : undefined
    message.deployLegacy =
      object.deployLegacy !== undefined && object.deployLegacy !== null
        ? DeployRequestLegacy.fromJSON(object.deployLegacy)
        : undefined
    return message
  },

  toJSON(message: AgentCommand): unknown {
    const obj: any = {}
    message.deploy !== undefined &&
      (obj.deploy = message.deploy ? VersionDeployRequest.toJSON(message.deploy) : undefined)
    message.containerStatus !== undefined &&
      (obj.containerStatus = message.containerStatus
        ? ContainerStatusRequest.toJSON(message.containerStatus)
        : undefined)
    message.containerDelete !== undefined &&
      (obj.containerDelete = message.containerDelete
        ? ContainerDeleteRequest.toJSON(message.containerDelete)
        : undefined)
    message.deployLegacy !== undefined &&
      (obj.deployLegacy = message.deployLegacy ? DeployRequestLegacy.toJSON(message.deployLegacy) : undefined)
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

const baseDeployRequest: object = { id: '', imageName: '', tag: '' }

export const DeployRequest = {
  fromJSON(object: any): DeployRequest {
    const message = { ...baseDeployRequest } as DeployRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.instanceConfig =
      object.instanceConfig !== undefined && object.instanceConfig !== null
        ? DeployRequest_InstanceConfig.fromJSON(object.instanceConfig)
        : undefined
    message.containerConfig =
      object.containerConfig !== undefined && object.containerConfig !== null
        ? DeployRequest_ContainerConfig.fromJSON(object.containerConfig)
        : undefined
    message.runtimeConfig =
      object.runtimeConfig !== undefined && object.runtimeConfig !== null ? String(object.runtimeConfig) : undefined
    message.registry = object.registry !== undefined && object.registry !== null ? String(object.registry) : undefined
    message.imageName = object.imageName !== undefined && object.imageName !== null ? String(object.imageName) : ''
    message.tag = object.tag !== undefined && object.tag !== null ? String(object.tag) : ''
    message.registryAuth =
      object.registryAuth !== undefined && object.registryAuth !== null
        ? DeployRequest_RegistryAuth.fromJSON(object.registryAuth)
        : undefined
    return message
  },

  toJSON(message: DeployRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.instanceConfig !== undefined &&
      (obj.instanceConfig = message.instanceConfig
        ? DeployRequest_InstanceConfig.toJSON(message.instanceConfig)
        : undefined)
    message.containerConfig !== undefined &&
      (obj.containerConfig = message.containerConfig
        ? DeployRequest_ContainerConfig.toJSON(message.containerConfig)
        : undefined)
    message.runtimeConfig !== undefined && (obj.runtimeConfig = message.runtimeConfig)
    message.registry !== undefined && (obj.registry = message.registry)
    message.imageName !== undefined && (obj.imageName = message.imageName)
    message.tag !== undefined && (obj.tag = message.tag)
    message.registryAuth !== undefined &&
      (obj.registryAuth = message.registryAuth ? DeployRequest_RegistryAuth.toJSON(message.registryAuth) : undefined)
    return obj
  },
}

const baseDeployRequest_InstanceConfig: object = { prefix: '' }

export const DeployRequest_InstanceConfig = {
  fromJSON(object: any): DeployRequest_InstanceConfig {
    const message = {
      ...baseDeployRequest_InstanceConfig,
    } as DeployRequest_InstanceConfig
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : ''
    message.mountPath =
      object.mountPath !== undefined && object.mountPath !== null ? String(object.mountPath) : undefined
    message.environment =
      object.environment !== undefined && object.environment !== null
        ? DeployRequest_InstanceConfig_Environment.fromJSON(object.environment)
        : undefined
    message.repositoryPrefix =
      object.repositoryPrefix !== undefined && object.repositoryPrefix !== null
        ? String(object.repositoryPrefix)
        : undefined
    return message
  },

  toJSON(message: DeployRequest_InstanceConfig): unknown {
    const obj: any = {}
    message.prefix !== undefined && (obj.prefix = message.prefix)
    message.mountPath !== undefined && (obj.mountPath = message.mountPath)
    message.environment !== undefined &&
      (obj.environment = message.environment
        ? DeployRequest_InstanceConfig_Environment.toJSON(message.environment)
        : undefined)
    message.repositoryPrefix !== undefined && (obj.repositoryPrefix = message.repositoryPrefix)
    return obj
  },
}

const baseDeployRequest_InstanceConfig_Environment: object = { env: '' }

export const DeployRequest_InstanceConfig_Environment = {
  fromJSON(object: any): DeployRequest_InstanceConfig_Environment {
    const message = {
      ...baseDeployRequest_InstanceConfig_Environment,
    } as DeployRequest_InstanceConfig_Environment
    message.env = (object.env ?? []).map((e: any) => String(e))
    return message
  },

  toJSON(message: DeployRequest_InstanceConfig_Environment): unknown {
    const obj: any = {}
    if (message.env) {
      obj.env = message.env.map(e => e)
    } else {
      obj.env = []
    }
    return obj
  },
}

const baseDeployRequest_ContainerConfig: object = {
  name: '',
  mounts: '',
  environments: '',
  user: 0,
}

export const DeployRequest_ContainerConfig = {
  fromJSON(object: any): DeployRequest_ContainerConfig {
    const message = {
      ...baseDeployRequest_ContainerConfig,
    } as DeployRequest_ContainerConfig
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : undefined
    message.ports = (object.ports ?? []).map((e: any) => DeployRequest_ContainerConfig_Port.fromJSON(e))
    message.mounts = (object.mounts ?? []).map((e: any) => String(e))
    message.environments = (object.environments ?? []).map((e: any) => String(e))
    message.networkMode =
      object.networkMode !== undefined && object.networkMode !== null ? String(object.networkMode) : undefined
    message.runtimeConfigType =
      object.runtimeConfigType !== undefined && object.runtimeConfigType !== null
        ? deployRequest_ContainerConfig_RuntimeConfigTypeFromJSON(object.runtimeConfigType)
        : undefined
    message.expose =
      object.expose !== undefined && object.expose !== null
        ? DeployRequest_ContainerConfig_Expose.fromJSON(object.expose)
        : undefined
    message.configContainer =
      object.configContainer !== undefined && object.configContainer !== null
        ? DeployRequest_ContainerConfig_ConfigContainer.fromJSON(object.configContainer)
        : undefined
    message.user = object.user !== undefined && object.user !== null ? Number(object.user) : 0
    return message
  },

  toJSON(message: DeployRequest_ContainerConfig): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.prefix !== undefined && (obj.prefix = message.prefix)
    if (message.ports) {
      obj.ports = message.ports.map(e => (e ? DeployRequest_ContainerConfig_Port.toJSON(e) : undefined))
    } else {
      obj.ports = []
    }
    if (message.mounts) {
      obj.mounts = message.mounts.map(e => e)
    } else {
      obj.mounts = []
    }
    if (message.environments) {
      obj.environments = message.environments.map(e => e)
    } else {
      obj.environments = []
    }
    message.networkMode !== undefined && (obj.networkMode = message.networkMode)
    message.runtimeConfigType !== undefined &&
      (obj.runtimeConfigType =
        message.runtimeConfigType !== undefined
          ? deployRequest_ContainerConfig_RuntimeConfigTypeToJSON(message.runtimeConfigType)
          : undefined)
    message.expose !== undefined &&
      (obj.expose = message.expose ? DeployRequest_ContainerConfig_Expose.toJSON(message.expose) : undefined)
    message.configContainer !== undefined &&
      (obj.configContainer = message.configContainer
        ? DeployRequest_ContainerConfig_ConfigContainer.toJSON(message.configContainer)
        : undefined)
    message.user !== undefined && (obj.user = Math.round(message.user))
    return obj
  },
}

const baseDeployRequest_ContainerConfig_Port: object = {
  internal: 0,
  external: 0,
}

export const DeployRequest_ContainerConfig_Port = {
  fromJSON(object: any): DeployRequest_ContainerConfig_Port {
    const message = {
      ...baseDeployRequest_ContainerConfig_Port,
    } as DeployRequest_ContainerConfig_Port
    message.internal = object.internal !== undefined && object.internal !== null ? Number(object.internal) : 0
    message.external = object.external !== undefined && object.external !== null ? Number(object.external) : 0
    return message
  },

  toJSON(message: DeployRequest_ContainerConfig_Port): unknown {
    const obj: any = {}
    message.internal !== undefined && (obj.internal = Math.round(message.internal))
    message.external !== undefined && (obj.external = Math.round(message.external))
    return obj
  },
}

const baseDeployRequest_ContainerConfig_Expose: object = {
  public: false,
  tls: false,
}

export const DeployRequest_ContainerConfig_Expose = {
  fromJSON(object: any): DeployRequest_ContainerConfig_Expose {
    const message = {
      ...baseDeployRequest_ContainerConfig_Expose,
    } as DeployRequest_ContainerConfig_Expose
    message.public = object.public !== undefined && object.public !== null ? Boolean(object.public) : false
    message.tls = object.tls !== undefined && object.tls !== null ? Boolean(object.tls) : false
    return message
  },

  toJSON(message: DeployRequest_ContainerConfig_Expose): unknown {
    const obj: any = {}
    message.public !== undefined && (obj.public = message.public)
    message.tls !== undefined && (obj.tls = message.tls)
    return obj
  },
}

const baseDeployRequest_ContainerConfig_ConfigContainer: object = {
  image: '',
  volume: '',
  path: '',
  keepFiles: false,
}

export const DeployRequest_ContainerConfig_ConfigContainer = {
  fromJSON(object: any): DeployRequest_ContainerConfig_ConfigContainer {
    const message = {
      ...baseDeployRequest_ContainerConfig_ConfigContainer,
    } as DeployRequest_ContainerConfig_ConfigContainer
    message.image = object.image !== undefined && object.image !== null ? String(object.image) : ''
    message.volume = object.volume !== undefined && object.volume !== null ? String(object.volume) : ''
    message.path = object.path !== undefined && object.path !== null ? String(object.path) : ''
    message.keepFiles = object.keepFiles !== undefined && object.keepFiles !== null ? Boolean(object.keepFiles) : false
    return message
  },

  toJSON(message: DeployRequest_ContainerConfig_ConfigContainer): unknown {
    const obj: any = {}
    message.image !== undefined && (obj.image = message.image)
    message.volume !== undefined && (obj.volume = message.volume)
    message.path !== undefined && (obj.path = message.path)
    message.keepFiles !== undefined && (obj.keepFiles = message.keepFiles)
    return obj
  },
}

const baseDeployRequest_RegistryAuth: object = {
  name: '',
  url: '',
  user: '',
  password: '',
}

export const DeployRequest_RegistryAuth = {
  fromJSON(object: any): DeployRequest_RegistryAuth {
    const message = {
      ...baseDeployRequest_RegistryAuth,
    } as DeployRequest_RegistryAuth
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.url = object.url !== undefined && object.url !== null ? String(object.url) : ''
    message.user = object.user !== undefined && object.user !== null ? String(object.user) : ''
    message.password = object.password !== undefined && object.password !== null ? String(object.password) : ''
    return message
  },

  toJSON(message: DeployRequest_RegistryAuth): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.url !== undefined && (obj.url = message.url)
    message.user !== undefined && (obj.user = message.user)
    message.password !== undefined && (obj.password = message.password)
    return obj
  },
}

const baseContainerStatusRequest: object = {}

export const ContainerStatusRequest = {
  fromJSON(object: any): ContainerStatusRequest {
    const message = { ...baseContainerStatusRequest } as ContainerStatusRequest
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : undefined
    message.oneShot = object.oneShot !== undefined && object.oneShot !== null ? Boolean(object.oneShot) : undefined
    return message
  },

  toJSON(message: ContainerStatusRequest): unknown {
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
   * For prefix status reports, should be closed by the server.
   */

  connect(request: AgentInfo, metadata: Metadata, ...rest: any): Observable<AgentCommand>

  deploymentStatus(request: Observable<DeploymentStatusMessage>, metadata: Metadata, ...rest: any): Observable<Empty>

  containerStatus(request: Observable<ContainerStatusListMessage>, metadata: Metadata, ...rest: any): Observable<Empty>
}

/** Service handling deployment of containers and fetching statuses */

export interface AgentController {
  /**
   * Subscribe with pre-assigned AgentID, waiting for incoming
   * deploy requests and prefix status requests.
   * In both cases, separate, shorter-living channels are opened.
   * For deployment status reports, closed when ended.
   * For prefix status reports, should be closed by the server.
   */

  connect(request: AgentInfo, metadata: Metadata, ...rest: any): Observable<AgentCommand>

  deploymentStatus(
    request: Observable<DeploymentStatusMessage>,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty

  containerStatus(
    request: Observable<ContainerStatusListMessage>,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty
}

export function AgentControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['connect']
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('Agent', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = ['deploymentStatus', 'containerStatus']
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
