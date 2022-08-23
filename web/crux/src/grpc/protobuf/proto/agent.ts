/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices'
import { util, configure } from 'protobufjs/minimal'
import * as Long from 'long'
import { Observable } from 'rxjs'
import { ExplicitContainerConfig, DeploymentStatusMessage, ContainerStateListMessage } from './common'
import { Metadata } from '@grpc/grpc-js'

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
  containerState: ContainerStateRequest | undefined
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
  name: string
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

const baseDeployRequest: object = { id: '', name: '', imageName: '', tag: '' }

export const DeployRequest = {
  fromJSON(object: any): DeployRequest {
    const message = { ...baseDeployRequest } as DeployRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.instanceConfig =
      object.instanceConfig !== undefined && object.instanceConfig !== null
        ? DeployRequest_InstanceConfig.fromJSON(object.instanceConfig)
        : undefined
    message.containerConfig =
      object.containerConfig !== undefined && object.containerConfig !== null
        ? ExplicitContainerConfig.fromJSON(object.containerConfig)
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
    message.name !== undefined && (obj.name = message.name)
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
}

export function AgentControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['connect']
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
