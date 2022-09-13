/* eslint-disable */
import { Metadata } from '@grpc/grpc-js'
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices'
import { Observable } from 'rxjs'
import {
  ContainerStateListMessage,
  DeploymentStatusMessage,
  ExplicitContainerConfig,
  ListSecretsResponse,
} from './common'

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
}

/** Deploys a single container */
export interface DeployRequest {
  id: string
  containerName: string
  /** InstanceConfig is set for multiple containers */
  instanceConfig: DeployRequest_InstanceConfig | undefined
  /** Runtime info and requirements of a container */
  containerConfig: ExplicitContainerConfig | undefined
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
    case DeployRequest_ContainerConfig_RuntimeConfigType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
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

function createBaseEmpty(): Empty {
  return {}
}

export const Empty = {
  fromJSON(_: any): Empty {
    return {}
  },

  toJSON(_: Empty): unknown {
    const obj: any = {}
    return obj
  },
}

function createBaseAgentInfo(): AgentInfo {
  return { id: '', version: '', publicKey: '' }
}

export const AgentInfo = {
  fromJSON(object: any): AgentInfo {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      version: isSet(object.version) ? String(object.version) : '',
      publicKey: isSet(object.publicKey) ? String(object.publicKey) : '',
    }
  },

  toJSON(message: AgentInfo): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.version !== undefined && (obj.version = message.version)
    message.publicKey !== undefined && (obj.publicKey = message.publicKey)
    return obj
  },
}

function createBaseAgentCommand(): AgentCommand {
  return {
    deploy: undefined,
    containerState: undefined,
    containerDelete: undefined,
    deployLegacy: undefined,
    listSecrets: undefined,
  }
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
  return { prefix: '' }
}

export const ListSecretsRequest = {
  fromJSON(object: any): ListSecretsRequest {
    return { prefix: isSet(object.prefix) ? String(object.prefix) : '' }
  },

  toJSON(message: ListSecretsRequest): unknown {
    const obj: any = {}
    message.prefix !== undefined && (obj.prefix = message.prefix)
    return obj
  },
}

function createBaseDeployRequest(): DeployRequest {
  return { id: '', containerName: '', instanceConfig: undefined, containerConfig: undefined, imageName: '', tag: '' }
}

export const DeployRequest = {
  fromJSON(object: any): DeployRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      containerName: isSet(object.containerName) ? String(object.containerName) : '',
      instanceConfig: isSet(object.instanceConfig)
        ? DeployRequest_InstanceConfig.fromJSON(object.instanceConfig)
        : undefined,
      containerConfig: isSet(object.containerConfig)
        ? ExplicitContainerConfig.fromJSON(object.containerConfig)
        : undefined,
      runtimeConfig: isSet(object.runtimeConfig) ? String(object.runtimeConfig) : undefined,
      registry: isSet(object.registry) ? String(object.registry) : undefined,
      imageName: isSet(object.imageName) ? String(object.imageName) : '',
      tag: isSet(object.tag) ? String(object.tag) : '',
      registryAuth: isSet(object.registryAuth) ? DeployRequest_RegistryAuth.fromJSON(object.registryAuth) : undefined,
    }
  },

  toJSON(message: DeployRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.containerName !== undefined && (obj.containerName = message.containerName)
    message.instanceConfig !== undefined &&
      (obj.instanceConfig = message.instanceConfig
        ? DeployRequest_InstanceConfig.toJSON(message.instanceConfig)
        : undefined)
    message.containerConfig !== undefined &&
      (obj.containerConfig = message.containerConfig
        ? ExplicitContainerConfig.toJSON(message.containerConfig)
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

function createBaseDeployRequest_InstanceConfig(): DeployRequest_InstanceConfig {
  return { prefix: '' }
}

export const DeployRequest_InstanceConfig = {
  fromJSON(object: any): DeployRequest_InstanceConfig {
    return {
      prefix: isSet(object.prefix) ? String(object.prefix) : '',
      mountPath: isSet(object.mountPath) ? String(object.mountPath) : undefined,
      environment: isSet(object.environment)
        ? DeployRequest_InstanceConfig_Environment.fromJSON(object.environment)
        : undefined,
      repositoryPrefix: isSet(object.repositoryPrefix) ? String(object.repositoryPrefix) : undefined,
    }
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

function createBaseDeployRequest_InstanceConfig_Environment(): DeployRequest_InstanceConfig_Environment {
  return { env: [] }
}

export const DeployRequest_InstanceConfig_Environment = {
  fromJSON(object: any): DeployRequest_InstanceConfig_Environment {
    return { env: Array.isArray(object?.env) ? object.env.map((e: any) => String(e)) : [] }
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

function createBaseDeployRequest_ContainerConfig(): DeployRequest_ContainerConfig {
  return { name: '', ports: [], mounts: [], environments: [], user: 0 }
}

export const DeployRequest_ContainerConfig = {
  fromJSON(object: any): DeployRequest_ContainerConfig {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      prefix: isSet(object.prefix) ? String(object.prefix) : undefined,
      ports: Array.isArray(object?.ports)
        ? object.ports.map((e: any) => DeployRequest_ContainerConfig_Port.fromJSON(e))
        : [],
      mounts: Array.isArray(object?.mounts) ? object.mounts.map((e: any) => String(e)) : [],
      environments: Array.isArray(object?.environments) ? object.environments.map((e: any) => String(e)) : [],
      networkMode: isSet(object.networkMode) ? String(object.networkMode) : undefined,
      runtimeConfigType: isSet(object.runtimeConfigType)
        ? deployRequest_ContainerConfig_RuntimeConfigTypeFromJSON(object.runtimeConfigType)
        : undefined,
      expose: isSet(object.expose) ? DeployRequest_ContainerConfig_Expose.fromJSON(object.expose) : undefined,
      configContainer: isSet(object.configContainer)
        ? DeployRequest_ContainerConfig_ConfigContainer.fromJSON(object.configContainer)
        : undefined,
      user: isSet(object.user) ? Number(object.user) : 0,
    }
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

function createBaseDeployRequest_ContainerConfig_Port(): DeployRequest_ContainerConfig_Port {
  return { internal: 0, external: 0 }
}

export const DeployRequest_ContainerConfig_Port = {
  fromJSON(object: any): DeployRequest_ContainerConfig_Port {
    return {
      internal: isSet(object.internal) ? Number(object.internal) : 0,
      external: isSet(object.external) ? Number(object.external) : 0,
    }
  },

  toJSON(message: DeployRequest_ContainerConfig_Port): unknown {
    const obj: any = {}
    message.internal !== undefined && (obj.internal = Math.round(message.internal))
    message.external !== undefined && (obj.external = Math.round(message.external))
    return obj
  },
}

function createBaseDeployRequest_ContainerConfig_Expose(): DeployRequest_ContainerConfig_Expose {
  return { public: false, tls: false }
}

export const DeployRequest_ContainerConfig_Expose = {
  fromJSON(object: any): DeployRequest_ContainerConfig_Expose {
    return {
      public: isSet(object.public) ? Boolean(object.public) : false,
      tls: isSet(object.tls) ? Boolean(object.tls) : false,
    }
  },

  toJSON(message: DeployRequest_ContainerConfig_Expose): unknown {
    const obj: any = {}
    message.public !== undefined && (obj.public = message.public)
    message.tls !== undefined && (obj.tls = message.tls)
    return obj
  },
}

function createBaseDeployRequest_ContainerConfig_ConfigContainer(): DeployRequest_ContainerConfig_ConfigContainer {
  return { image: '', volume: '', path: '', keepFiles: false }
}

export const DeployRequest_ContainerConfig_ConfigContainer = {
  fromJSON(object: any): DeployRequest_ContainerConfig_ConfigContainer {
    return {
      image: isSet(object.image) ? String(object.image) : '',
      volume: isSet(object.volume) ? String(object.volume) : '',
      path: isSet(object.path) ? String(object.path) : '',
      keepFiles: isSet(object.keepFiles) ? Boolean(object.keepFiles) : false,
    }
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

function createBaseDeployRequest_RegistryAuth(): DeployRequest_RegistryAuth {
  return { name: '', url: '', user: '', password: '' }
}

export const DeployRequest_RegistryAuth = {
  fromJSON(object: any): DeployRequest_RegistryAuth {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      url: isSet(object.url) ? String(object.url) : '',
      user: isSet(object.user) ? String(object.user) : '',
      password: isSet(object.password) ? String(object.password) : '',
    }
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

  getSecretList(request: ListSecretsResponse, metadata: Metadata, ...rest: any): Observable<Empty>
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

  getSecretList(
    request: ListSecretsResponse,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty
}

export function AgentControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['connect', 'getSecretList']
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

function isSet(value: any): boolean {
  return value !== null && value !== undefined
}
