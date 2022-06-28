/* eslint-disable */
import {
  makeGenericClientConstructor,
  ChannelCredentials,
  ChannelOptions,
  UntypedServiceImplementation,
  handleUnaryCall,
  Client,
  ClientUnaryCall,
  Metadata,
  CallOptions,
  handleServerStreamingCall,
  ClientReadableStream,
  ServiceError,
} from "@grpc/grpc-js";
import { Timestamp } from "../../google/protobuf/timestamp";
import Long from "long";
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "crux";

/** CRUX Protobuf definitions */

export enum UserRole {
  UNKNOWN_USER_ROLE = 0,
  USER = 1,
  OWNER = 2,
  UNRECOGNIZED = -1,
}

export function userRoleFromJSON(object: any): UserRole {
  switch (object) {
    case 0:
    case "UNKNOWN_USER_ROLE":
      return UserRole.UNKNOWN_USER_ROLE;
    case 1:
    case "USER":
      return UserRole.USER;
    case 2:
    case "OWNER":
      return UserRole.OWNER;
    case -1:
    case "UNRECOGNIZED":
    default:
      return UserRole.UNRECOGNIZED;
  }
}

export function userRoleToJSON(object: UserRole): string {
  switch (object) {
    case UserRole.UNKNOWN_USER_ROLE:
      return "UNKNOWN_USER_ROLE";
    case UserRole.USER:
      return "USER";
    case UserRole.OWNER:
      return "OWNER";
    case UserRole.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum UserStatus {
  UNKNOWN_USER_STATUS = 0,
  PENDING = 1,
  VERIFIED = 2,
  UNRECOGNIZED = -1,
}

export function userStatusFromJSON(object: any): UserStatus {
  switch (object) {
    case 0:
    case "UNKNOWN_USER_STATUS":
      return UserStatus.UNKNOWN_USER_STATUS;
    case 1:
    case "PENDING":
      return UserStatus.PENDING;
    case 2:
    case "VERIFIED":
      return UserStatus.VERIFIED;
    case -1:
    case "UNRECOGNIZED":
    default:
      return UserStatus.UNRECOGNIZED;
  }
}

export function userStatusToJSON(object: UserStatus): string {
  switch (object) {
    case UserStatus.UNKNOWN_USER_STATUS:
      return "UNKNOWN_USER_STATUS";
    case UserStatus.PENDING:
      return "PENDING";
    case UserStatus.VERIFIED:
      return "VERIFIED";
    case UserStatus.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/** PRODUCT */
export enum ProductType {
  UNKNOWN_PRODUCT_TYPE = 0,
  SIMPLE = 1,
  COMPLEX = 2,
  UNRECOGNIZED = -1,
}

export function productTypeFromJSON(object: any): ProductType {
  switch (object) {
    case 0:
    case "UNKNOWN_PRODUCT_TYPE":
      return ProductType.UNKNOWN_PRODUCT_TYPE;
    case 1:
    case "SIMPLE":
      return ProductType.SIMPLE;
    case 2:
    case "COMPLEX":
      return ProductType.COMPLEX;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ProductType.UNRECOGNIZED;
  }
}

export function productTypeToJSON(object: ProductType): string {
  switch (object) {
    case ProductType.UNKNOWN_PRODUCT_TYPE:
      return "UNKNOWN_PRODUCT_TYPE";
    case ProductType.SIMPLE:
      return "SIMPLE";
    case ProductType.COMPLEX:
      return "COMPLEX";
    case ProductType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum VersionType {
  UNKNOWN_VERSION_TYPE = 0,
  INCREMENTAL = 1,
  ROLLING = 2,
  UNRECOGNIZED = -1,
}

export function versionTypeFromJSON(object: any): VersionType {
  switch (object) {
    case 0:
    case "UNKNOWN_VERSION_TYPE":
      return VersionType.UNKNOWN_VERSION_TYPE;
    case 1:
    case "INCREMENTAL":
      return VersionType.INCREMENTAL;
    case 2:
    case "ROLLING":
      return VersionType.ROLLING;
    case -1:
    case "UNRECOGNIZED":
    default:
      return VersionType.UNRECOGNIZED;
  }
}

export function versionTypeToJSON(object: VersionType): string {
  switch (object) {
    case VersionType.UNKNOWN_VERSION_TYPE:
      return "UNKNOWN_VERSION_TYPE";
    case VersionType.INCREMENTAL:
      return "INCREMENTAL";
    case VersionType.ROLLING:
      return "ROLLING";
    case VersionType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum RegistryType {
  UNKNOWN_REGISTRY_TYPE = 0,
  V2 = 1,
  HUB = 2,
  UNRECOGNIZED = -1,
}

export function registryTypeFromJSON(object: any): RegistryType {
  switch (object) {
    case 0:
    case "UNKNOWN_REGISTRY_TYPE":
      return RegistryType.UNKNOWN_REGISTRY_TYPE;
    case 1:
    case "V2":
      return RegistryType.V2;
    case 2:
    case "HUB":
      return RegistryType.HUB;
    case -1:
    case "UNRECOGNIZED":
    default:
      return RegistryType.UNRECOGNIZED;
  }
}

export function registryTypeToJSON(object: RegistryType): string {
  switch (object) {
    case RegistryType.UNKNOWN_REGISTRY_TYPE:
      return "UNKNOWN_REGISTRY_TYPE";
    case RegistryType.V2:
      return "V2";
    case RegistryType.HUB:
      return "HUB";
    case RegistryType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/**
 * Lifecycle:
 * When a node connection is alive, the status is CONNECTED.
 * If it disconnects, the status will be UNREACHABLE.
 * When a node created, it is UNREACHEABLE until the user completes
 * the install process.
 */
export enum NodeConnectionStatus {
  UNKNOWN_CONNECTION_STATUS = 0,
  /** UNREACHABLE - Node was not yet connected or became unreachable */
  UNREACHABLE = 1,
  /** CONNECTED - Node is running and connected */
  CONNECTED = 2,
  UNRECOGNIZED = -1,
}

export function nodeConnectionStatusFromJSON(
  object: any
): NodeConnectionStatus {
  switch (object) {
    case 0:
    case "UNKNOWN_CONNECTION_STATUS":
      return NodeConnectionStatus.UNKNOWN_CONNECTION_STATUS;
    case 1:
    case "UNREACHABLE":
      return NodeConnectionStatus.UNREACHABLE;
    case 2:
    case "CONNECTED":
      return NodeConnectionStatus.CONNECTED;
    case -1:
    case "UNRECOGNIZED":
    default:
      return NodeConnectionStatus.UNRECOGNIZED;
  }
}

export function nodeConnectionStatusToJSON(
  object: NodeConnectionStatus
): string {
  switch (object) {
    case NodeConnectionStatus.UNKNOWN_CONNECTION_STATUS:
      return "UNKNOWN_CONNECTION_STATUS";
    case NodeConnectionStatus.UNREACHABLE:
      return "UNREACHABLE";
    case NodeConnectionStatus.CONNECTED:
      return "CONNECTED";
    case NodeConnectionStatus.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
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
    case "UNKNOWN_DEPLOYMENT_STATUS":
      return DeploymentStatus.UNKNOWN_DEPLOYMENT_STATUS;
    case 1:
    case "PREPARING":
      return DeploymentStatus.PREPARING;
    case 2:
    case "IN_PROGRESS":
      return DeploymentStatus.IN_PROGRESS;
    case 3:
    case "SUCCESSFUL":
      return DeploymentStatus.SUCCESSFUL;
    case 4:
    case "FAILED":
      return DeploymentStatus.FAILED;
    case 5:
    case "OBSOLATE":
      return DeploymentStatus.OBSOLATE;
    case 6:
    case "DOWNGRADED":
      return DeploymentStatus.DOWNGRADED;
    case -1:
    case "UNRECOGNIZED":
    default:
      return DeploymentStatus.UNRECOGNIZED;
  }
}

export function deploymentStatusToJSON(object: DeploymentStatus): string {
  switch (object) {
    case DeploymentStatus.UNKNOWN_DEPLOYMENT_STATUS:
      return "UNKNOWN_DEPLOYMENT_STATUS";
    case DeploymentStatus.PREPARING:
      return "PREPARING";
    case DeploymentStatus.IN_PROGRESS:
      return "IN_PROGRESS";
    case DeploymentStatus.SUCCESSFUL:
      return "SUCCESSFUL";
    case DeploymentStatus.FAILED:
      return "FAILED";
    case DeploymentStatus.OBSOLATE:
      return "OBSOLATE";
    case DeploymentStatus.DOWNGRADED:
      return "DOWNGRADED";
    case DeploymentStatus.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum DeploymentEventType {
  UNKNOWN_DEPLOYMENT_EVENT_TYPE = 0,
  DEPLOYMENT_LOG = 1,
  DEPLOYMENT_STATUS = 2,
  CONTAINER_STATUS = 3,
  UNRECOGNIZED = -1,
}

export function deploymentEventTypeFromJSON(object: any): DeploymentEventType {
  switch (object) {
    case 0:
    case "UNKNOWN_DEPLOYMENT_EVENT_TYPE":
      return DeploymentEventType.UNKNOWN_DEPLOYMENT_EVENT_TYPE;
    case 1:
    case "DEPLOYMENT_LOG":
      return DeploymentEventType.DEPLOYMENT_LOG;
    case 2:
    case "DEPLOYMENT_STATUS":
      return DeploymentEventType.DEPLOYMENT_STATUS;
    case 3:
    case "CONTAINER_STATUS":
      return DeploymentEventType.CONTAINER_STATUS;
    case -1:
    case "UNRECOGNIZED":
    default:
      return DeploymentEventType.UNRECOGNIZED;
  }
}

export function deploymentEventTypeToJSON(object: DeploymentEventType): string {
  switch (object) {
    case DeploymentEventType.UNKNOWN_DEPLOYMENT_EVENT_TYPE:
      return "UNKNOWN_DEPLOYMENT_EVENT_TYPE";
    case DeploymentEventType.DEPLOYMENT_LOG:
      return "DEPLOYMENT_LOG";
    case DeploymentEventType.DEPLOYMENT_STATUS:
      return "DEPLOYMENT_STATUS";
    case DeploymentEventType.CONTAINER_STATUS:
      return "CONTAINER_STATUS";
    case DeploymentEventType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum ContainerStatus {
  UNKNOWN_CONTAINER_STATUS = 0,
  CREATED = 1,
  RESTARTING = 2,
  RUNNING = 3,
  REMOVING = 4,
  PAUSED = 5,
  EXITED = 6,
  DEAD = 7,
  UNRECOGNIZED = -1,
}

export function containerStatusFromJSON(object: any): ContainerStatus {
  switch (object) {
    case 0:
    case "UNKNOWN_CONTAINER_STATUS":
      return ContainerStatus.UNKNOWN_CONTAINER_STATUS;
    case 1:
    case "CREATED":
      return ContainerStatus.CREATED;
    case 2:
    case "RESTARTING":
      return ContainerStatus.RESTARTING;
    case 3:
    case "RUNNING":
      return ContainerStatus.RUNNING;
    case 4:
    case "REMOVING":
      return ContainerStatus.REMOVING;
    case 5:
    case "PAUSED":
      return ContainerStatus.PAUSED;
    case 6:
    case "EXITED":
      return ContainerStatus.EXITED;
    case 7:
    case "DEAD":
      return ContainerStatus.DEAD;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ContainerStatus.UNRECOGNIZED;
  }
}

export function containerStatusToJSON(object: ContainerStatus): string {
  switch (object) {
    case ContainerStatus.UNKNOWN_CONTAINER_STATUS:
      return "UNKNOWN_CONTAINER_STATUS";
    case ContainerStatus.CREATED:
      return "CREATED";
    case ContainerStatus.RESTARTING:
      return "RESTARTING";
    case ContainerStatus.RUNNING:
      return "RUNNING";
    case ContainerStatus.REMOVING:
      return "REMOVING";
    case ContainerStatus.PAUSED:
      return "PAUSED";
    case ContainerStatus.EXITED:
      return "EXITED";
    case ContainerStatus.DEAD:
      return "DEAD";
    case ContainerStatus.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/** Common messages */
export interface Empty {}

export interface ServiceIdRequest {
  id: string;
}

export interface IdRequest {
  id: string;
  accessedBy: string;
}

export interface AuditResponse {
  createdBy: string;
  createdAt: Timestamp | undefined;
  updatedBy?: string | undefined;
  updatedAt?: Timestamp | undefined;
}

export interface CreateEntityResponse {
  id: string;
  createdAt: Timestamp | undefined;
}

export interface UpdateEntityResponse {
  updatedAt: Timestamp | undefined;
}

/** AUDIT */
export interface AuditLogResponse {
  createdAt: Timestamp | undefined;
  userId: string;
  identityName: string;
  serviceCall: string;
  data?: string | undefined;
}

export interface AuditLogListResponse {
  data: AuditLogResponse[];
}

/** TEAM */
export interface CreateTeamRequest {
  accessedBy: string;
  name: string;
}

export interface UpdateActiveTeamRequest {
  accessedBy: string;
  name: string;
}

export interface UserInviteRequest {
  accessedBy: string;
  email: string;
}

export interface AccessRequest {
  accessedBy: string;
}

export interface UserMetaResponse {
  user: ActiveTeamUser | undefined;
  teams: TeamResponse[];
  invitations: TeamResponse[];
}

export interface ActiveTeamUser {
  activeTeamId: string;
  role: UserRole;
  status: UserStatus;
}

export interface TeamResponse {
  id: string;
  name: string;
}

export interface TeamDetailsResponse {
  id: string;
  name: string;
  users: UserResponse[];
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface ProductDetailsReponse {
  id: string;
  audit: AuditResponse | undefined;
  name: string;
  description?: string | undefined;
  type: ProductType;
  versions: VersionResponse[];
}

export interface ProductReponse {
  id: string;
  audit: AuditResponse | undefined;
  name: string;
  description?: string | undefined;
  type: ProductType;
}

export interface ProductListResponse {
  data: ProductReponse[];
}

export interface CreateProductRequest {
  accessedBy: string;
  name: string;
  description?: string | undefined;
  type: ProductType;
}

export interface UpdateProductRequest {
  id: string;
  accessedBy: string;
  name: string;
  description?: string | undefined;
  changelog?: string | undefined;
}

export interface RegistryResponse {
  id: string;
  audit: AuditResponse | undefined;
  name: string;
  description?: string | undefined;
  icon?: string | undefined;
  url: string;
}

export interface RegistryListResponse {
  data: RegistryResponse[];
}

export interface CreateRegistryRequest {
  accessedBy: string;
  name: string;
  description?: string | undefined;
  icon?: string | undefined;
  url: string;
  user?: string | undefined;
  token?: string | undefined;
  type: RegistryType;
}

export interface UpdateRegistryRequest {
  id: string;
  accessedBy: string;
  name: string;
  description?: string | undefined;
  icon?: string | undefined;
  url: string;
  user?: string | undefined;
  token?: string | undefined;
  type: RegistryType;
}

export interface RegistryDetailsResponse {
  id: string;
  audit: AuditResponse | undefined;
  name: string;
  description?: string | undefined;
  icon?: string | undefined;
  url: string;
  user?: string | undefined;
  token?: string | undefined;
  type: RegistryType;
}

export interface CreateVersionRequest {
  accessedBy: string;
  productId: string;
  name: string;
  changelog?: string | undefined;
  default: boolean;
  type: VersionType;
}

export interface UpdateVersionRequest {
  id: string;
  accessedBy: string;
  name: string;
  changelog?: string | undefined;
  default: boolean;
}

export interface VersionResponse {
  id: string;
  audit: AuditResponse | undefined;
  name: string;
  changelog: string;
  default: boolean;
  type: VersionType;
  increasable: boolean;
}

export interface VersionListResponse {
  data: VersionResponse[];
}

export interface VersionDetailsResponse {
  id: string;
  audit: AuditResponse | undefined;
  name: string;
  changelog: string;
  default: boolean;
  type: VersionType;
  mutable: boolean;
  increasable: boolean;
  images: ImageResponse[];
  deployments: DeploymentResponse[];
}

export interface IncreaseVersionRequest {
  id: string;
  accessedBy: string;
  name: string;
  changelog?: string | undefined;
}

export interface ExplicitContainerConfig {
  /** container ports */
  ports: ExplicitContainerConfig_Port[];
  /** volume mounts in a piped format */
  mounts: string[];
  /** could be enum, i'm not sure if it is in use */
  networkMode?: ExplicitContainerConfig_NetworkMode | undefined;
  /** exposure configuration */
  expose?: ExplicitContainerConfig_Expose | undefined;
  user?: number | undefined;
}

export enum ExplicitContainerConfig_NetworkMode {
  UNKNOWN_NETWORK_MODE = 0,
  NONE = 1,
  HOST = 2,
  UNRECOGNIZED = -1,
}

export function explicitContainerConfig_NetworkModeFromJSON(
  object: any
): ExplicitContainerConfig_NetworkMode {
  switch (object) {
    case 0:
    case "UNKNOWN_NETWORK_MODE":
      return ExplicitContainerConfig_NetworkMode.UNKNOWN_NETWORK_MODE;
    case 1:
    case "NONE":
      return ExplicitContainerConfig_NetworkMode.NONE;
    case 2:
    case "HOST":
      return ExplicitContainerConfig_NetworkMode.HOST;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ExplicitContainerConfig_NetworkMode.UNRECOGNIZED;
  }
}

export function explicitContainerConfig_NetworkModeToJSON(
  object: ExplicitContainerConfig_NetworkMode
): string {
  switch (object) {
    case ExplicitContainerConfig_NetworkMode.UNKNOWN_NETWORK_MODE:
      return "UNKNOWN_NETWORK_MODE";
    case ExplicitContainerConfig_NetworkMode.NONE:
      return "NONE";
    case ExplicitContainerConfig_NetworkMode.HOST:
      return "HOST";
    case ExplicitContainerConfig_NetworkMode.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface ExplicitContainerConfig_Port {
  /** internal that is bound by the container */
  internal: number;
  /** external is docker only */
  external: number;
}

export interface ExplicitContainerConfig_Expose {
  /** if expose is needed */
  public: boolean;
  /** if tls is needed */
  tls: boolean;
}

export interface ContainerConfig {
  config: ExplicitContainerConfig | undefined;
  capabilities: UniqueKeyValue[];
  environment: UniqueKeyValue[];
}

export interface ImageResponse {
  id: string;
  name: string;
  tag: string;
  order: number;
  registryId: string;
  config: ContainerConfig | undefined;
}

export interface ImageListResponse {
  data: ImageResponse[];
}

export interface OrderVersionImagesRequest {
  accessedBy: string;
  versionId: string;
  imageIds: string[];
}

export interface AddImagesToVersionRequest {
  accessedBy: string;
  versionId: string;
  registryId: string;
  imageIds: string[];
}

export interface UniqueKeyValue {
  id: string;
  key: string;
  value: string;
}

export interface KeyValueList {
  data: UniqueKeyValue[];
}

export interface PatchContainerConfig {
  capabilities?: KeyValueList | undefined;
  environment?: KeyValueList | undefined;
  config?: ExplicitContainerConfig | undefined;
}

export interface PatchImageRequest {
  id: string;
  accessedBy: string;
  name?: string | undefined;
  tag?: string | undefined;
  config?: PatchContainerConfig | undefined;
}

export interface NodeResponse {
  id: string;
  audit: AuditResponse | undefined;
  name: string;
  description?: string | undefined;
  icon?: string | undefined;
  address?: string | undefined;
  status: NodeConnectionStatus;
  connectedAt?: Timestamp | undefined;
}

export interface NodeDetailsResponse {
  id: string;
  audit: AuditResponse | undefined;
  name: string;
  description?: string | undefined;
  icon?: string | undefined;
  address?: string | undefined;
  status: NodeConnectionStatus;
  hasToken: boolean;
  connectedAt?: Timestamp | undefined;
  install?: NodeInstallResponse | undefined;
  script?: NodeScriptResponse | undefined;
}

export interface NodeListResponse {
  data: NodeResponse[];
}

export interface CreateNodeRequest {
  accessedBy: string;
  name: string;
  description?: string | undefined;
  icon?: string | undefined;
}

export interface UpdateNodeRequest {
  id: string;
  accessedBy: string;
  name: string;
  description?: string | undefined;
  icon?: string | undefined;
}

export interface NodeInstallResponse {
  command: string;
  expireAt: Timestamp | undefined;
}

export interface NodeScriptResponse {
  content: string;
}

export interface NodeEventMessage {
  id: string;
  status: NodeConnectionStatus;
  address?: string | undefined;
}

export interface WatchContainerStatusRequest {
  accessedBy: string;
  nodeId: string;
  prefix?: string | undefined;
}

export interface ContainerPort {
  internal: number;
  external: number;
}

export interface ContainerStatusItem {
  containerId: string;
  name: string;
  command: string;
  createdAt: Timestamp | undefined;
  status: ContainerStatus;
  ports: ContainerPort[];
}

export interface ContainerStatusListMessage {
  prefix?: string | undefined;
  data: ContainerStatusItem[];
}

export interface InstanceDeploymentItem {
  instanceId: string;
  status: ContainerStatus;
}

export interface DeploymentStatusMessage {
  instance: InstanceDeploymentItem | undefined;
  deploymentStatus: DeploymentStatus | undefined;
  log: string[];
}

export interface DeploymentProgressMessage {
  id: string;
  status?: DeploymentStatus | undefined;
  instance?: InstanceDeploymentItem | undefined;
  log: string[];
}

export interface InstancesCreatedEventList {
  data: InstanceResponse[];
}

export interface DeploymentEditEventMessage {
  instancesCreated: InstancesCreatedEventList | undefined;
  imageIdDeleted: string | undefined;
}

export interface CreateDeploymentRequest {
  accessedBy: string;
  versionId: string;
  nodeId: string;
}

export interface UpdateDeploymentRequest {
  id: string;
  accessedBy: string;
  name: string;
  descripion?: string | undefined;
  prefix: string;
}

export interface PatchDeploymentRequest {
  id: string;
  accessedBy: string;
  environment?: KeyValueList | undefined;
  instance?: PatchInstanceRequest | undefined;
}

export interface InstanceResponse {
  id: string;
  audit: AuditResponse | undefined;
  image: ImageResponse | undefined;
  status?: ContainerStatus | undefined;
  config?: ContainerConfig | undefined;
}

export interface PatchInstanceRequest {
  id: string;
  accessedBy: string;
  environment?: KeyValueList | undefined;
  capabilities?: KeyValueList | undefined;
  config?: ExplicitContainerConfig | undefined;
}

export interface DeploymentListResponse {
  data: DeploymentResponse[];
}

export interface DeploymentResponse {
  id: string;
  audit: AuditResponse | undefined;
  name: string;
  prefix: string;
  nodeId: string;
  nodeName: string;
  status: DeploymentStatus;
}

export interface DeploymentDetailsResponse {
  id: string;
  audit: AuditResponse | undefined;
  productVersionId: string;
  nodeId: string;
  name: string;
  description?: string | undefined;
  prefix: string;
  environment: UniqueKeyValue[];
  status: DeploymentStatus;
  instances: InstanceResponse[];
}

export interface DeploymentEventContainerStatus {
  instanceId: string;
  status: ContainerStatus;
}

export interface DeploymentEventLog {
  log: string[];
}

export interface DeploymentEventResponse {
  type: DeploymentEventType;
  createdAt: Timestamp | undefined;
  log: DeploymentEventLog | undefined;
  deploymentStatus: DeploymentStatus | undefined;
  containerStatus: DeploymentEventContainerStatus | undefined;
}

export interface DeploymentEventListResponse {
  data: DeploymentEventResponse[];
}

function createBaseEmpty(): Empty {
  return {};
}

export const Empty = {
  encode(_: Empty, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Empty {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEmpty();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): Empty {
    return {};
  },

  toJSON(_: Empty): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Empty>, I>>(_: I): Empty {
    const message = createBaseEmpty();
    return message;
  },
};

function createBaseServiceIdRequest(): ServiceIdRequest {
  return { id: "" };
}

export const ServiceIdRequest = {
  encode(
    message: ServiceIdRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ServiceIdRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseServiceIdRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ServiceIdRequest {
    return {
      id: isSet(object.id) ? String(object.id) : "",
    };
  },

  toJSON(message: ServiceIdRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ServiceIdRequest>, I>>(
    object: I
  ): ServiceIdRequest {
    const message = createBaseServiceIdRequest();
    message.id = object.id ?? "";
    return message;
  },
};

function createBaseIdRequest(): IdRequest {
  return { id: "", accessedBy: "" };
}

export const IdRequest = {
  encode(
    message: IdRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IdRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIdRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.accessedBy = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): IdRequest {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
    };
  },

  toJSON(message: IdRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<IdRequest>, I>>(
    object: I
  ): IdRequest {
    const message = createBaseIdRequest();
    message.id = object.id ?? "";
    message.accessedBy = object.accessedBy ?? "";
    return message;
  },
};

function createBaseAuditResponse(): AuditResponse {
  return {
    createdBy: "",
    createdAt: undefined,
    updatedBy: undefined,
    updatedAt: undefined,
  };
}

export const AuditResponse = {
  encode(
    message: AuditResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.createdBy !== "") {
      writer.uint32(802).string(message.createdBy);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(message.createdAt, writer.uint32(810).fork()).ldelim();
    }
    if (message.updatedBy !== undefined) {
      writer.uint32(818).string(message.updatedBy);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(message.updatedAt, writer.uint32(826).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AuditResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAuditResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 100:
          message.createdBy = reader.string();
          break;
        case 101:
          message.createdAt = Timestamp.decode(reader, reader.uint32());
          break;
        case 102:
          message.updatedBy = reader.string();
          break;
        case 103:
          message.updatedAt = Timestamp.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AuditResponse {
    return {
      createdBy: isSet(object.createdBy) ? String(object.createdBy) : "",
      createdAt: isSet(object.createdAt)
        ? fromJsonTimestamp(object.createdAt)
        : undefined,
      updatedBy: isSet(object.updatedBy) ? String(object.updatedBy) : undefined,
      updatedAt: isSet(object.updatedAt)
        ? fromJsonTimestamp(object.updatedAt)
        : undefined,
    };
  },

  toJSON(message: AuditResponse): unknown {
    const obj: any = {};
    message.createdBy !== undefined && (obj.createdBy = message.createdBy);
    message.createdAt !== undefined &&
      (obj.createdAt = fromTimestamp(message.createdAt).toISOString());
    message.updatedBy !== undefined && (obj.updatedBy = message.updatedBy);
    message.updatedAt !== undefined &&
      (obj.updatedAt = fromTimestamp(message.updatedAt).toISOString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<AuditResponse>, I>>(
    object: I
  ): AuditResponse {
    const message = createBaseAuditResponse();
    message.createdBy = object.createdBy ?? "";
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null
        ? Timestamp.fromPartial(object.createdAt)
        : undefined;
    message.updatedBy = object.updatedBy ?? undefined;
    message.updatedAt =
      object.updatedAt !== undefined && object.updatedAt !== null
        ? Timestamp.fromPartial(object.updatedAt)
        : undefined;
    return message;
  },
};

function createBaseCreateEntityResponse(): CreateEntityResponse {
  return { id: "", createdAt: undefined };
}

export const CreateEntityResponse = {
  encode(
    message: CreateEntityResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(message.createdAt, writer.uint32(802).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): CreateEntityResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateEntityResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 100:
          message.createdAt = Timestamp.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CreateEntityResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      createdAt: isSet(object.createdAt)
        ? fromJsonTimestamp(object.createdAt)
        : undefined,
    };
  },

  toJSON(message: CreateEntityResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.createdAt !== undefined &&
      (obj.createdAt = fromTimestamp(message.createdAt).toISOString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<CreateEntityResponse>, I>>(
    object: I
  ): CreateEntityResponse {
    const message = createBaseCreateEntityResponse();
    message.id = object.id ?? "";
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null
        ? Timestamp.fromPartial(object.createdAt)
        : undefined;
    return message;
  },
};

function createBaseUpdateEntityResponse(): UpdateEntityResponse {
  return { updatedAt: undefined };
}

export const UpdateEntityResponse = {
  encode(
    message: UpdateEntityResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.updatedAt !== undefined) {
      Timestamp.encode(message.updatedAt, writer.uint32(802).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): UpdateEntityResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateEntityResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 100:
          message.updatedAt = Timestamp.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UpdateEntityResponse {
    return {
      updatedAt: isSet(object.updatedAt)
        ? fromJsonTimestamp(object.updatedAt)
        : undefined,
    };
  },

  toJSON(message: UpdateEntityResponse): unknown {
    const obj: any = {};
    message.updatedAt !== undefined &&
      (obj.updatedAt = fromTimestamp(message.updatedAt).toISOString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UpdateEntityResponse>, I>>(
    object: I
  ): UpdateEntityResponse {
    const message = createBaseUpdateEntityResponse();
    message.updatedAt =
      object.updatedAt !== undefined && object.updatedAt !== null
        ? Timestamp.fromPartial(object.updatedAt)
        : undefined;
    return message;
  },
};

function createBaseAuditLogResponse(): AuditLogResponse {
  return {
    createdAt: undefined,
    userId: "",
    identityName: "",
    serviceCall: "",
    data: undefined,
  };
}

export const AuditLogResponse = {
  encode(
    message: AuditLogResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.createdAt !== undefined) {
      Timestamp.encode(message.createdAt, writer.uint32(802).fork()).ldelim();
    }
    if (message.userId !== "") {
      writer.uint32(810).string(message.userId);
    }
    if (message.identityName !== "") {
      writer.uint32(818).string(message.identityName);
    }
    if (message.serviceCall !== "") {
      writer.uint32(826).string(message.serviceCall);
    }
    if (message.data !== undefined) {
      writer.uint32(834).string(message.data);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AuditLogResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAuditLogResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 100:
          message.createdAt = Timestamp.decode(reader, reader.uint32());
          break;
        case 101:
          message.userId = reader.string();
          break;
        case 102:
          message.identityName = reader.string();
          break;
        case 103:
          message.serviceCall = reader.string();
          break;
        case 104:
          message.data = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AuditLogResponse {
    return {
      createdAt: isSet(object.createdAt)
        ? fromJsonTimestamp(object.createdAt)
        : undefined,
      userId: isSet(object.userId) ? String(object.userId) : "",
      identityName: isSet(object.identityName)
        ? String(object.identityName)
        : "",
      serviceCall: isSet(object.serviceCall) ? String(object.serviceCall) : "",
      data: isSet(object.data) ? String(object.data) : undefined,
    };
  },

  toJSON(message: AuditLogResponse): unknown {
    const obj: any = {};
    message.createdAt !== undefined &&
      (obj.createdAt = fromTimestamp(message.createdAt).toISOString());
    message.userId !== undefined && (obj.userId = message.userId);
    message.identityName !== undefined &&
      (obj.identityName = message.identityName);
    message.serviceCall !== undefined &&
      (obj.serviceCall = message.serviceCall);
    message.data !== undefined && (obj.data = message.data);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<AuditLogResponse>, I>>(
    object: I
  ): AuditLogResponse {
    const message = createBaseAuditLogResponse();
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null
        ? Timestamp.fromPartial(object.createdAt)
        : undefined;
    message.userId = object.userId ?? "";
    message.identityName = object.identityName ?? "";
    message.serviceCall = object.serviceCall ?? "";
    message.data = object.data ?? undefined;
    return message;
  },
};

function createBaseAuditLogListResponse(): AuditLogListResponse {
  return { data: [] };
}

export const AuditLogListResponse = {
  encode(
    message: AuditLogListResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.data) {
      AuditLogResponse.encode(v!, writer.uint32(8002).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AuditLogListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAuditLogListResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1000:
          message.data.push(AuditLogResponse.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AuditLogListResponse {
    return {
      data: Array.isArray(object?.data)
        ? object.data.map((e: any) => AuditLogResponse.fromJSON(e))
        : [],
    };
  },

  toJSON(message: AuditLogListResponse): unknown {
    const obj: any = {};
    if (message.data) {
      obj.data = message.data.map((e) =>
        e ? AuditLogResponse.toJSON(e) : undefined
      );
    } else {
      obj.data = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<AuditLogListResponse>, I>>(
    object: I
  ): AuditLogListResponse {
    const message = createBaseAuditLogListResponse();
    message.data =
      object.data?.map((e) => AuditLogResponse.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCreateTeamRequest(): CreateTeamRequest {
  return { accessedBy: "", name: "" };
}

export const CreateTeamRequest = {
  encode(
    message: CreateTeamRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateTeamRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateTeamRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.name = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CreateTeamRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      name: isSet(object.name) ? String(object.name) : "",
    };
  },

  toJSON(message: CreateTeamRequest): unknown {
    const obj: any = {};
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.name !== undefined && (obj.name = message.name);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<CreateTeamRequest>, I>>(
    object: I
  ): CreateTeamRequest {
    const message = createBaseCreateTeamRequest();
    message.accessedBy = object.accessedBy ?? "";
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseUpdateActiveTeamRequest(): UpdateActiveTeamRequest {
  return { accessedBy: "", name: "" };
}

export const UpdateActiveTeamRequest = {
  encode(
    message: UpdateActiveTeamRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): UpdateActiveTeamRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateActiveTeamRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.name = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UpdateActiveTeamRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      name: isSet(object.name) ? String(object.name) : "",
    };
  },

  toJSON(message: UpdateActiveTeamRequest): unknown {
    const obj: any = {};
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.name !== undefined && (obj.name = message.name);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UpdateActiveTeamRequest>, I>>(
    object: I
  ): UpdateActiveTeamRequest {
    const message = createBaseUpdateActiveTeamRequest();
    message.accessedBy = object.accessedBy ?? "";
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseUserInviteRequest(): UserInviteRequest {
  return { accessedBy: "", email: "" };
}

export const UserInviteRequest = {
  encode(
    message: UserInviteRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.email !== "") {
      writer.uint32(802).string(message.email);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserInviteRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserInviteRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.email = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UserInviteRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      email: isSet(object.email) ? String(object.email) : "",
    };
  },

  toJSON(message: UserInviteRequest): unknown {
    const obj: any = {};
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.email !== undefined && (obj.email = message.email);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UserInviteRequest>, I>>(
    object: I
  ): UserInviteRequest {
    const message = createBaseUserInviteRequest();
    message.accessedBy = object.accessedBy ?? "";
    message.email = object.email ?? "";
    return message;
  },
};

function createBaseAccessRequest(): AccessRequest {
  return { accessedBy: "" };
}

export const AccessRequest = {
  encode(
    message: AccessRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AccessRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAccessRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AccessRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
    };
  },

  toJSON(message: AccessRequest): unknown {
    const obj: any = {};
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<AccessRequest>, I>>(
    object: I
  ): AccessRequest {
    const message = createBaseAccessRequest();
    message.accessedBy = object.accessedBy ?? "";
    return message;
  },
};

function createBaseUserMetaResponse(): UserMetaResponse {
  return { user: undefined, teams: [], invitations: [] };
}

export const UserMetaResponse = {
  encode(
    message: UserMetaResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.user !== undefined) {
      ActiveTeamUser.encode(message.user, writer.uint32(802).fork()).ldelim();
    }
    for (const v of message.teams) {
      TeamResponse.encode(v!, writer.uint32(8002).fork()).ldelim();
    }
    for (const v of message.invitations) {
      TeamResponse.encode(v!, writer.uint32(8010).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserMetaResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserMetaResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 100:
          message.user = ActiveTeamUser.decode(reader, reader.uint32());
          break;
        case 1000:
          message.teams.push(TeamResponse.decode(reader, reader.uint32()));
          break;
        case 1001:
          message.invitations.push(
            TeamResponse.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UserMetaResponse {
    return {
      user: isSet(object.user)
        ? ActiveTeamUser.fromJSON(object.user)
        : undefined,
      teams: Array.isArray(object?.teams)
        ? object.teams.map((e: any) => TeamResponse.fromJSON(e))
        : [],
      invitations: Array.isArray(object?.invitations)
        ? object.invitations.map((e: any) => TeamResponse.fromJSON(e))
        : [],
    };
  },

  toJSON(message: UserMetaResponse): unknown {
    const obj: any = {};
    message.user !== undefined &&
      (obj.user = message.user
        ? ActiveTeamUser.toJSON(message.user)
        : undefined);
    if (message.teams) {
      obj.teams = message.teams.map((e) =>
        e ? TeamResponse.toJSON(e) : undefined
      );
    } else {
      obj.teams = [];
    }
    if (message.invitations) {
      obj.invitations = message.invitations.map((e) =>
        e ? TeamResponse.toJSON(e) : undefined
      );
    } else {
      obj.invitations = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UserMetaResponse>, I>>(
    object: I
  ): UserMetaResponse {
    const message = createBaseUserMetaResponse();
    message.user =
      object.user !== undefined && object.user !== null
        ? ActiveTeamUser.fromPartial(object.user)
        : undefined;
    message.teams = object.teams?.map((e) => TeamResponse.fromPartial(e)) || [];
    message.invitations =
      object.invitations?.map((e) => TeamResponse.fromPartial(e)) || [];
    return message;
  },
};

function createBaseActiveTeamUser(): ActiveTeamUser {
  return { activeTeamId: "", role: 0, status: 0 };
}

export const ActiveTeamUser = {
  encode(
    message: ActiveTeamUser,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.activeTeamId !== "") {
      writer.uint32(802).string(message.activeTeamId);
    }
    if (message.role !== 0) {
      writer.uint32(808).int32(message.role);
    }
    if (message.status !== 0) {
      writer.uint32(816).int32(message.status);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ActiveTeamUser {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseActiveTeamUser();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 100:
          message.activeTeamId = reader.string();
          break;
        case 101:
          message.role = reader.int32() as any;
          break;
        case 102:
          message.status = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ActiveTeamUser {
    return {
      activeTeamId: isSet(object.activeTeamId)
        ? String(object.activeTeamId)
        : "",
      role: isSet(object.role) ? userRoleFromJSON(object.role) : 0,
      status: isSet(object.status) ? userStatusFromJSON(object.status) : 0,
    };
  },

  toJSON(message: ActiveTeamUser): unknown {
    const obj: any = {};
    message.activeTeamId !== undefined &&
      (obj.activeTeamId = message.activeTeamId);
    message.role !== undefined && (obj.role = userRoleToJSON(message.role));
    message.status !== undefined &&
      (obj.status = userStatusToJSON(message.status));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ActiveTeamUser>, I>>(
    object: I
  ): ActiveTeamUser {
    const message = createBaseActiveTeamUser();
    message.activeTeamId = object.activeTeamId ?? "";
    message.role = object.role ?? 0;
    message.status = object.status ?? 0;
    return message;
  },
};

function createBaseTeamResponse(): TeamResponse {
  return { id: "", name: "" };
}

export const TeamResponse = {
  encode(
    message: TeamResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TeamResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTeamResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 100:
          message.name = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TeamResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      name: isSet(object.name) ? String(object.name) : "",
    };
  },

  toJSON(message: TeamResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.name !== undefined && (obj.name = message.name);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<TeamResponse>, I>>(
    object: I
  ): TeamResponse {
    const message = createBaseTeamResponse();
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseTeamDetailsResponse(): TeamDetailsResponse {
  return { id: "", name: "", users: [] };
}

export const TeamDetailsResponse = {
  encode(
    message: TeamDetailsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    for (const v of message.users) {
      UserResponse.encode(v!, writer.uint32(8002).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TeamDetailsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTeamDetailsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 100:
          message.name = reader.string();
          break;
        case 1000:
          message.users.push(UserResponse.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TeamDetailsResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      name: isSet(object.name) ? String(object.name) : "",
      users: Array.isArray(object?.users)
        ? object.users.map((e: any) => UserResponse.fromJSON(e))
        : [],
    };
  },

  toJSON(message: TeamDetailsResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.name !== undefined && (obj.name = message.name);
    if (message.users) {
      obj.users = message.users.map((e) =>
        e ? UserResponse.toJSON(e) : undefined
      );
    } else {
      obj.users = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<TeamDetailsResponse>, I>>(
    object: I
  ): TeamDetailsResponse {
    const message = createBaseTeamDetailsResponse();
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    message.users = object.users?.map((e) => UserResponse.fromPartial(e)) || [];
    return message;
  },
};

function createBaseUserResponse(): UserResponse {
  return { id: "", name: "", email: "", role: 0, status: 0 };
}

export const UserResponse = {
  encode(
    message: UserResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.email !== "") {
      writer.uint32(810).string(message.email);
    }
    if (message.role !== 0) {
      writer.uint32(816).int32(message.role);
    }
    if (message.status !== 0) {
      writer.uint32(824).int32(message.status);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.email = reader.string();
          break;
        case 102:
          message.role = reader.int32() as any;
          break;
        case 103:
          message.status = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UserResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      name: isSet(object.name) ? String(object.name) : "",
      email: isSet(object.email) ? String(object.email) : "",
      role: isSet(object.role) ? userRoleFromJSON(object.role) : 0,
      status: isSet(object.status) ? userStatusFromJSON(object.status) : 0,
    };
  },

  toJSON(message: UserResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.name !== undefined && (obj.name = message.name);
    message.email !== undefined && (obj.email = message.email);
    message.role !== undefined && (obj.role = userRoleToJSON(message.role));
    message.status !== undefined &&
      (obj.status = userStatusToJSON(message.status));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UserResponse>, I>>(
    object: I
  ): UserResponse {
    const message = createBaseUserResponse();
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    message.email = object.email ?? "";
    message.role = object.role ?? 0;
    message.status = object.status ?? 0;
    return message;
  },
};

function createBaseProductDetailsReponse(): ProductDetailsReponse {
  return {
    id: "",
    audit: undefined,
    name: "",
    description: undefined,
    type: 0,
    versions: [],
  };
}

export const ProductDetailsReponse = {
  encode(
    message: ProductDetailsReponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(810).string(message.description);
    }
    if (message.type !== 0) {
      writer.uint32(816).int32(message.type);
    }
    for (const v of message.versions) {
      VersionResponse.encode(v!, writer.uint32(8002).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ProductDetailsReponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProductDetailsReponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.audit = AuditResponse.decode(reader, reader.uint32());
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.description = reader.string();
          break;
        case 102:
          message.type = reader.int32() as any;
          break;
        case 1000:
          message.versions.push(
            VersionResponse.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProductDetailsReponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      audit: isSet(object.audit)
        ? AuditResponse.fromJSON(object.audit)
        : undefined,
      name: isSet(object.name) ? String(object.name) : "",
      description: isSet(object.description)
        ? String(object.description)
        : undefined,
      type: isSet(object.type) ? productTypeFromJSON(object.type) : 0,
      versions: Array.isArray(object?.versions)
        ? object.versions.map((e: any) => VersionResponse.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ProductDetailsReponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.audit !== undefined &&
      (obj.audit = message.audit
        ? AuditResponse.toJSON(message.audit)
        : undefined);
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined &&
      (obj.description = message.description);
    message.type !== undefined && (obj.type = productTypeToJSON(message.type));
    if (message.versions) {
      obj.versions = message.versions.map((e) =>
        e ? VersionResponse.toJSON(e) : undefined
      );
    } else {
      obj.versions = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ProductDetailsReponse>, I>>(
    object: I
  ): ProductDetailsReponse {
    const message = createBaseProductDetailsReponse();
    message.id = object.id ?? "";
    message.audit =
      object.audit !== undefined && object.audit !== null
        ? AuditResponse.fromPartial(object.audit)
        : undefined;
    message.name = object.name ?? "";
    message.description = object.description ?? undefined;
    message.type = object.type ?? 0;
    message.versions =
      object.versions?.map((e) => VersionResponse.fromPartial(e)) || [];
    return message;
  },
};

function createBaseProductReponse(): ProductReponse {
  return {
    id: "",
    audit: undefined,
    name: "",
    description: undefined,
    type: 0,
  };
}

export const ProductReponse = {
  encode(
    message: ProductReponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(810).string(message.description);
    }
    if (message.type !== 0) {
      writer.uint32(816).int32(message.type);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProductReponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProductReponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.audit = AuditResponse.decode(reader, reader.uint32());
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.description = reader.string();
          break;
        case 102:
          message.type = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProductReponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      audit: isSet(object.audit)
        ? AuditResponse.fromJSON(object.audit)
        : undefined,
      name: isSet(object.name) ? String(object.name) : "",
      description: isSet(object.description)
        ? String(object.description)
        : undefined,
      type: isSet(object.type) ? productTypeFromJSON(object.type) : 0,
    };
  },

  toJSON(message: ProductReponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.audit !== undefined &&
      (obj.audit = message.audit
        ? AuditResponse.toJSON(message.audit)
        : undefined);
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined &&
      (obj.description = message.description);
    message.type !== undefined && (obj.type = productTypeToJSON(message.type));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ProductReponse>, I>>(
    object: I
  ): ProductReponse {
    const message = createBaseProductReponse();
    message.id = object.id ?? "";
    message.audit =
      object.audit !== undefined && object.audit !== null
        ? AuditResponse.fromPartial(object.audit)
        : undefined;
    message.name = object.name ?? "";
    message.description = object.description ?? undefined;
    message.type = object.type ?? 0;
    return message;
  },
};

function createBaseProductListResponse(): ProductListResponse {
  return { data: [] };
}

export const ProductListResponse = {
  encode(
    message: ProductListResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.data) {
      ProductReponse.encode(v!, writer.uint32(8002).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProductListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProductListResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1000:
          message.data.push(ProductReponse.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProductListResponse {
    return {
      data: Array.isArray(object?.data)
        ? object.data.map((e: any) => ProductReponse.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ProductListResponse): unknown {
    const obj: any = {};
    if (message.data) {
      obj.data = message.data.map((e) =>
        e ? ProductReponse.toJSON(e) : undefined
      );
    } else {
      obj.data = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ProductListResponse>, I>>(
    object: I
  ): ProductListResponse {
    const message = createBaseProductListResponse();
    message.data = object.data?.map((e) => ProductReponse.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCreateProductRequest(): CreateProductRequest {
  return { accessedBy: "", name: "", description: undefined, type: 0 };
}

export const CreateProductRequest = {
  encode(
    message: CreateProductRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(810).string(message.description);
    }
    if (message.type !== 0) {
      writer.uint32(816).int32(message.type);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): CreateProductRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateProductRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.description = reader.string();
          break;
        case 102:
          message.type = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CreateProductRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      name: isSet(object.name) ? String(object.name) : "",
      description: isSet(object.description)
        ? String(object.description)
        : undefined,
      type: isSet(object.type) ? productTypeFromJSON(object.type) : 0,
    };
  },

  toJSON(message: CreateProductRequest): unknown {
    const obj: any = {};
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined &&
      (obj.description = message.description);
    message.type !== undefined && (obj.type = productTypeToJSON(message.type));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<CreateProductRequest>, I>>(
    object: I
  ): CreateProductRequest {
    const message = createBaseCreateProductRequest();
    message.accessedBy = object.accessedBy ?? "";
    message.name = object.name ?? "";
    message.description = object.description ?? undefined;
    message.type = object.type ?? 0;
    return message;
  },
};

function createBaseUpdateProductRequest(): UpdateProductRequest {
  return {
    id: "",
    accessedBy: "",
    name: "",
    description: undefined,
    changelog: undefined,
  };
}

export const UpdateProductRequest = {
  encode(
    message: UpdateProductRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(810).string(message.description);
    }
    if (message.changelog !== undefined) {
      writer.uint32(818).string(message.changelog);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): UpdateProductRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateProductRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.description = reader.string();
          break;
        case 102:
          message.changelog = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UpdateProductRequest {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      name: isSet(object.name) ? String(object.name) : "",
      description: isSet(object.description)
        ? String(object.description)
        : undefined,
      changelog: isSet(object.changelog) ? String(object.changelog) : undefined,
    };
  },

  toJSON(message: UpdateProductRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined &&
      (obj.description = message.description);
    message.changelog !== undefined && (obj.changelog = message.changelog);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UpdateProductRequest>, I>>(
    object: I
  ): UpdateProductRequest {
    const message = createBaseUpdateProductRequest();
    message.id = object.id ?? "";
    message.accessedBy = object.accessedBy ?? "";
    message.name = object.name ?? "";
    message.description = object.description ?? undefined;
    message.changelog = object.changelog ?? undefined;
    return message;
  },
};

function createBaseRegistryResponse(): RegistryResponse {
  return {
    id: "",
    audit: undefined,
    name: "",
    description: undefined,
    icon: undefined,
    url: "",
  };
}

export const RegistryResponse = {
  encode(
    message: RegistryResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(810).string(message.description);
    }
    if (message.icon !== undefined) {
      writer.uint32(818).string(message.icon);
    }
    if (message.url !== "") {
      writer.uint32(826).string(message.url);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegistryResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRegistryResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.audit = AuditResponse.decode(reader, reader.uint32());
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.description = reader.string();
          break;
        case 102:
          message.icon = reader.string();
          break;
        case 103:
          message.url = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RegistryResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      audit: isSet(object.audit)
        ? AuditResponse.fromJSON(object.audit)
        : undefined,
      name: isSet(object.name) ? String(object.name) : "",
      description: isSet(object.description)
        ? String(object.description)
        : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
      url: isSet(object.url) ? String(object.url) : "",
    };
  },

  toJSON(message: RegistryResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.audit !== undefined &&
      (obj.audit = message.audit
        ? AuditResponse.toJSON(message.audit)
        : undefined);
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined &&
      (obj.description = message.description);
    message.icon !== undefined && (obj.icon = message.icon);
    message.url !== undefined && (obj.url = message.url);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RegistryResponse>, I>>(
    object: I
  ): RegistryResponse {
    const message = createBaseRegistryResponse();
    message.id = object.id ?? "";
    message.audit =
      object.audit !== undefined && object.audit !== null
        ? AuditResponse.fromPartial(object.audit)
        : undefined;
    message.name = object.name ?? "";
    message.description = object.description ?? undefined;
    message.icon = object.icon ?? undefined;
    message.url = object.url ?? "";
    return message;
  },
};

function createBaseRegistryListResponse(): RegistryListResponse {
  return { data: [] };
}

export const RegistryListResponse = {
  encode(
    message: RegistryListResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.data) {
      RegistryResponse.encode(v!, writer.uint32(8002).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): RegistryListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRegistryListResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1000:
          message.data.push(RegistryResponse.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RegistryListResponse {
    return {
      data: Array.isArray(object?.data)
        ? object.data.map((e: any) => RegistryResponse.fromJSON(e))
        : [],
    };
  },

  toJSON(message: RegistryListResponse): unknown {
    const obj: any = {};
    if (message.data) {
      obj.data = message.data.map((e) =>
        e ? RegistryResponse.toJSON(e) : undefined
      );
    } else {
      obj.data = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RegistryListResponse>, I>>(
    object: I
  ): RegistryListResponse {
    const message = createBaseRegistryListResponse();
    message.data =
      object.data?.map((e) => RegistryResponse.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCreateRegistryRequest(): CreateRegistryRequest {
  return {
    accessedBy: "",
    name: "",
    description: undefined,
    icon: undefined,
    url: "",
    user: undefined,
    token: undefined,
    type: 0,
  };
}

export const CreateRegistryRequest = {
  encode(
    message: CreateRegistryRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(810).string(message.description);
    }
    if (message.icon !== undefined) {
      writer.uint32(818).string(message.icon);
    }
    if (message.url !== "") {
      writer.uint32(826).string(message.url);
    }
    if (message.user !== undefined) {
      writer.uint32(834).string(message.user);
    }
    if (message.token !== undefined) {
      writer.uint32(842).string(message.token);
    }
    if (message.type !== 0) {
      writer.uint32(848).int32(message.type);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): CreateRegistryRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateRegistryRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.description = reader.string();
          break;
        case 102:
          message.icon = reader.string();
          break;
        case 103:
          message.url = reader.string();
          break;
        case 104:
          message.user = reader.string();
          break;
        case 105:
          message.token = reader.string();
          break;
        case 106:
          message.type = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CreateRegistryRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      name: isSet(object.name) ? String(object.name) : "",
      description: isSet(object.description)
        ? String(object.description)
        : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
      url: isSet(object.url) ? String(object.url) : "",
      user: isSet(object.user) ? String(object.user) : undefined,
      token: isSet(object.token) ? String(object.token) : undefined,
      type: isSet(object.type) ? registryTypeFromJSON(object.type) : 0,
    };
  },

  toJSON(message: CreateRegistryRequest): unknown {
    const obj: any = {};
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined &&
      (obj.description = message.description);
    message.icon !== undefined && (obj.icon = message.icon);
    message.url !== undefined && (obj.url = message.url);
    message.user !== undefined && (obj.user = message.user);
    message.token !== undefined && (obj.token = message.token);
    message.type !== undefined && (obj.type = registryTypeToJSON(message.type));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<CreateRegistryRequest>, I>>(
    object: I
  ): CreateRegistryRequest {
    const message = createBaseCreateRegistryRequest();
    message.accessedBy = object.accessedBy ?? "";
    message.name = object.name ?? "";
    message.description = object.description ?? undefined;
    message.icon = object.icon ?? undefined;
    message.url = object.url ?? "";
    message.user = object.user ?? undefined;
    message.token = object.token ?? undefined;
    message.type = object.type ?? 0;
    return message;
  },
};

function createBaseUpdateRegistryRequest(): UpdateRegistryRequest {
  return {
    id: "",
    accessedBy: "",
    name: "",
    description: undefined,
    icon: undefined,
    url: "",
    user: undefined,
    token: undefined,
    type: 0,
  };
}

export const UpdateRegistryRequest = {
  encode(
    message: UpdateRegistryRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(810).string(message.description);
    }
    if (message.icon !== undefined) {
      writer.uint32(818).string(message.icon);
    }
    if (message.url !== "") {
      writer.uint32(826).string(message.url);
    }
    if (message.user !== undefined) {
      writer.uint32(834).string(message.user);
    }
    if (message.token !== undefined) {
      writer.uint32(842).string(message.token);
    }
    if (message.type !== 0) {
      writer.uint32(848).int32(message.type);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): UpdateRegistryRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateRegistryRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.description = reader.string();
          break;
        case 102:
          message.icon = reader.string();
          break;
        case 103:
          message.url = reader.string();
          break;
        case 104:
          message.user = reader.string();
          break;
        case 105:
          message.token = reader.string();
          break;
        case 106:
          message.type = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UpdateRegistryRequest {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      name: isSet(object.name) ? String(object.name) : "",
      description: isSet(object.description)
        ? String(object.description)
        : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
      url: isSet(object.url) ? String(object.url) : "",
      user: isSet(object.user) ? String(object.user) : undefined,
      token: isSet(object.token) ? String(object.token) : undefined,
      type: isSet(object.type) ? registryTypeFromJSON(object.type) : 0,
    };
  },

  toJSON(message: UpdateRegistryRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined &&
      (obj.description = message.description);
    message.icon !== undefined && (obj.icon = message.icon);
    message.url !== undefined && (obj.url = message.url);
    message.user !== undefined && (obj.user = message.user);
    message.token !== undefined && (obj.token = message.token);
    message.type !== undefined && (obj.type = registryTypeToJSON(message.type));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UpdateRegistryRequest>, I>>(
    object: I
  ): UpdateRegistryRequest {
    const message = createBaseUpdateRegistryRequest();
    message.id = object.id ?? "";
    message.accessedBy = object.accessedBy ?? "";
    message.name = object.name ?? "";
    message.description = object.description ?? undefined;
    message.icon = object.icon ?? undefined;
    message.url = object.url ?? "";
    message.user = object.user ?? undefined;
    message.token = object.token ?? undefined;
    message.type = object.type ?? 0;
    return message;
  },
};

function createBaseRegistryDetailsResponse(): RegistryDetailsResponse {
  return {
    id: "",
    audit: undefined,
    name: "",
    description: undefined,
    icon: undefined,
    url: "",
    user: undefined,
    token: undefined,
    type: 0,
  };
}

export const RegistryDetailsResponse = {
  encode(
    message: RegistryDetailsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(810).string(message.description);
    }
    if (message.icon !== undefined) {
      writer.uint32(818).string(message.icon);
    }
    if (message.url !== "") {
      writer.uint32(826).string(message.url);
    }
    if (message.user !== undefined) {
      writer.uint32(834).string(message.user);
    }
    if (message.token !== undefined) {
      writer.uint32(842).string(message.token);
    }
    if (message.type !== 0) {
      writer.uint32(848).int32(message.type);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): RegistryDetailsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRegistryDetailsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.audit = AuditResponse.decode(reader, reader.uint32());
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.description = reader.string();
          break;
        case 102:
          message.icon = reader.string();
          break;
        case 103:
          message.url = reader.string();
          break;
        case 104:
          message.user = reader.string();
          break;
        case 105:
          message.token = reader.string();
          break;
        case 106:
          message.type = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RegistryDetailsResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      audit: isSet(object.audit)
        ? AuditResponse.fromJSON(object.audit)
        : undefined,
      name: isSet(object.name) ? String(object.name) : "",
      description: isSet(object.description)
        ? String(object.description)
        : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
      url: isSet(object.url) ? String(object.url) : "",
      user: isSet(object.user) ? String(object.user) : undefined,
      token: isSet(object.token) ? String(object.token) : undefined,
      type: isSet(object.type) ? registryTypeFromJSON(object.type) : 0,
    };
  },

  toJSON(message: RegistryDetailsResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.audit !== undefined &&
      (obj.audit = message.audit
        ? AuditResponse.toJSON(message.audit)
        : undefined);
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined &&
      (obj.description = message.description);
    message.icon !== undefined && (obj.icon = message.icon);
    message.url !== undefined && (obj.url = message.url);
    message.user !== undefined && (obj.user = message.user);
    message.token !== undefined && (obj.token = message.token);
    message.type !== undefined && (obj.type = registryTypeToJSON(message.type));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RegistryDetailsResponse>, I>>(
    object: I
  ): RegistryDetailsResponse {
    const message = createBaseRegistryDetailsResponse();
    message.id = object.id ?? "";
    message.audit =
      object.audit !== undefined && object.audit !== null
        ? AuditResponse.fromPartial(object.audit)
        : undefined;
    message.name = object.name ?? "";
    message.description = object.description ?? undefined;
    message.icon = object.icon ?? undefined;
    message.url = object.url ?? "";
    message.user = object.user ?? undefined;
    message.token = object.token ?? undefined;
    message.type = object.type ?? 0;
    return message;
  },
};

function createBaseCreateVersionRequest(): CreateVersionRequest {
  return {
    accessedBy: "",
    productId: "",
    name: "",
    changelog: undefined,
    default: false,
    type: 0,
  };
}

export const CreateVersionRequest = {
  encode(
    message: CreateVersionRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.productId !== "") {
      writer.uint32(802).string(message.productId);
    }
    if (message.name !== "") {
      writer.uint32(810).string(message.name);
    }
    if (message.changelog !== undefined) {
      writer.uint32(818).string(message.changelog);
    }
    if (message.default === true) {
      writer.uint32(824).bool(message.default);
    }
    if (message.type !== 0) {
      writer.uint32(832).int32(message.type);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): CreateVersionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateVersionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.productId = reader.string();
          break;
        case 101:
          message.name = reader.string();
          break;
        case 102:
          message.changelog = reader.string();
          break;
        case 103:
          message.default = reader.bool();
          break;
        case 104:
          message.type = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CreateVersionRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      productId: isSet(object.productId) ? String(object.productId) : "",
      name: isSet(object.name) ? String(object.name) : "",
      changelog: isSet(object.changelog) ? String(object.changelog) : undefined,
      default: isSet(object.default) ? Boolean(object.default) : false,
      type: isSet(object.type) ? versionTypeFromJSON(object.type) : 0,
    };
  },

  toJSON(message: CreateVersionRequest): unknown {
    const obj: any = {};
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.productId !== undefined && (obj.productId = message.productId);
    message.name !== undefined && (obj.name = message.name);
    message.changelog !== undefined && (obj.changelog = message.changelog);
    message.default !== undefined && (obj.default = message.default);
    message.type !== undefined && (obj.type = versionTypeToJSON(message.type));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<CreateVersionRequest>, I>>(
    object: I
  ): CreateVersionRequest {
    const message = createBaseCreateVersionRequest();
    message.accessedBy = object.accessedBy ?? "";
    message.productId = object.productId ?? "";
    message.name = object.name ?? "";
    message.changelog = object.changelog ?? undefined;
    message.default = object.default ?? false;
    message.type = object.type ?? 0;
    return message;
  },
};

function createBaseUpdateVersionRequest(): UpdateVersionRequest {
  return {
    id: "",
    accessedBy: "",
    name: "",
    changelog: undefined,
    default: false,
  };
}

export const UpdateVersionRequest = {
  encode(
    message: UpdateVersionRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.changelog !== undefined) {
      writer.uint32(810).string(message.changelog);
    }
    if (message.default === true) {
      writer.uint32(816).bool(message.default);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): UpdateVersionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateVersionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.changelog = reader.string();
          break;
        case 102:
          message.default = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UpdateVersionRequest {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      name: isSet(object.name) ? String(object.name) : "",
      changelog: isSet(object.changelog) ? String(object.changelog) : undefined,
      default: isSet(object.default) ? Boolean(object.default) : false,
    };
  },

  toJSON(message: UpdateVersionRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.name !== undefined && (obj.name = message.name);
    message.changelog !== undefined && (obj.changelog = message.changelog);
    message.default !== undefined && (obj.default = message.default);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UpdateVersionRequest>, I>>(
    object: I
  ): UpdateVersionRequest {
    const message = createBaseUpdateVersionRequest();
    message.id = object.id ?? "";
    message.accessedBy = object.accessedBy ?? "";
    message.name = object.name ?? "";
    message.changelog = object.changelog ?? undefined;
    message.default = object.default ?? false;
    return message;
  },
};

function createBaseVersionResponse(): VersionResponse {
  return {
    id: "",
    audit: undefined,
    name: "",
    changelog: "",
    default: false,
    type: 0,
    increasable: false,
  };
}

export const VersionResponse = {
  encode(
    message: VersionResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.changelog !== "") {
      writer.uint32(810).string(message.changelog);
    }
    if (message.default === true) {
      writer.uint32(816).bool(message.default);
    }
    if (message.type !== 0) {
      writer.uint32(824).int32(message.type);
    }
    if (message.increasable === true) {
      writer.uint32(832).bool(message.increasable);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): VersionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVersionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.audit = AuditResponse.decode(reader, reader.uint32());
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.changelog = reader.string();
          break;
        case 102:
          message.default = reader.bool();
          break;
        case 103:
          message.type = reader.int32() as any;
          break;
        case 104:
          message.increasable = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): VersionResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      audit: isSet(object.audit)
        ? AuditResponse.fromJSON(object.audit)
        : undefined,
      name: isSet(object.name) ? String(object.name) : "",
      changelog: isSet(object.changelog) ? String(object.changelog) : "",
      default: isSet(object.default) ? Boolean(object.default) : false,
      type: isSet(object.type) ? versionTypeFromJSON(object.type) : 0,
      increasable: isSet(object.increasable)
        ? Boolean(object.increasable)
        : false,
    };
  },

  toJSON(message: VersionResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.audit !== undefined &&
      (obj.audit = message.audit
        ? AuditResponse.toJSON(message.audit)
        : undefined);
    message.name !== undefined && (obj.name = message.name);
    message.changelog !== undefined && (obj.changelog = message.changelog);
    message.default !== undefined && (obj.default = message.default);
    message.type !== undefined && (obj.type = versionTypeToJSON(message.type));
    message.increasable !== undefined &&
      (obj.increasable = message.increasable);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<VersionResponse>, I>>(
    object: I
  ): VersionResponse {
    const message = createBaseVersionResponse();
    message.id = object.id ?? "";
    message.audit =
      object.audit !== undefined && object.audit !== null
        ? AuditResponse.fromPartial(object.audit)
        : undefined;
    message.name = object.name ?? "";
    message.changelog = object.changelog ?? "";
    message.default = object.default ?? false;
    message.type = object.type ?? 0;
    message.increasable = object.increasable ?? false;
    return message;
  },
};

function createBaseVersionListResponse(): VersionListResponse {
  return { data: [] };
}

export const VersionListResponse = {
  encode(
    message: VersionListResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.data) {
      VersionResponse.encode(v!, writer.uint32(8002).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): VersionListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVersionListResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1000:
          message.data.push(VersionResponse.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): VersionListResponse {
    return {
      data: Array.isArray(object?.data)
        ? object.data.map((e: any) => VersionResponse.fromJSON(e))
        : [],
    };
  },

  toJSON(message: VersionListResponse): unknown {
    const obj: any = {};
    if (message.data) {
      obj.data = message.data.map((e) =>
        e ? VersionResponse.toJSON(e) : undefined
      );
    } else {
      obj.data = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<VersionListResponse>, I>>(
    object: I
  ): VersionListResponse {
    const message = createBaseVersionListResponse();
    message.data =
      object.data?.map((e) => VersionResponse.fromPartial(e)) || [];
    return message;
  },
};

function createBaseVersionDetailsResponse(): VersionDetailsResponse {
  return {
    id: "",
    audit: undefined,
    name: "",
    changelog: "",
    default: false,
    type: 0,
    mutable: false,
    increasable: false,
    images: [],
    deployments: [],
  };
}

export const VersionDetailsResponse = {
  encode(
    message: VersionDetailsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.changelog !== "") {
      writer.uint32(810).string(message.changelog);
    }
    if (message.default === true) {
      writer.uint32(816).bool(message.default);
    }
    if (message.type !== 0) {
      writer.uint32(824).int32(message.type);
    }
    if (message.mutable === true) {
      writer.uint32(832).bool(message.mutable);
    }
    if (message.increasable === true) {
      writer.uint32(840).bool(message.increasable);
    }
    for (const v of message.images) {
      ImageResponse.encode(v!, writer.uint32(8002).fork()).ldelim();
    }
    for (const v of message.deployments) {
      DeploymentResponse.encode(v!, writer.uint32(8010).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): VersionDetailsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVersionDetailsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.audit = AuditResponse.decode(reader, reader.uint32());
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.changelog = reader.string();
          break;
        case 102:
          message.default = reader.bool();
          break;
        case 103:
          message.type = reader.int32() as any;
          break;
        case 104:
          message.mutable = reader.bool();
          break;
        case 105:
          message.increasable = reader.bool();
          break;
        case 1000:
          message.images.push(ImageResponse.decode(reader, reader.uint32()));
          break;
        case 1001:
          message.deployments.push(
            DeploymentResponse.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): VersionDetailsResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      audit: isSet(object.audit)
        ? AuditResponse.fromJSON(object.audit)
        : undefined,
      name: isSet(object.name) ? String(object.name) : "",
      changelog: isSet(object.changelog) ? String(object.changelog) : "",
      default: isSet(object.default) ? Boolean(object.default) : false,
      type: isSet(object.type) ? versionTypeFromJSON(object.type) : 0,
      mutable: isSet(object.mutable) ? Boolean(object.mutable) : false,
      increasable: isSet(object.increasable)
        ? Boolean(object.increasable)
        : false,
      images: Array.isArray(object?.images)
        ? object.images.map((e: any) => ImageResponse.fromJSON(e))
        : [],
      deployments: Array.isArray(object?.deployments)
        ? object.deployments.map((e: any) => DeploymentResponse.fromJSON(e))
        : [],
    };
  },

  toJSON(message: VersionDetailsResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.audit !== undefined &&
      (obj.audit = message.audit
        ? AuditResponse.toJSON(message.audit)
        : undefined);
    message.name !== undefined && (obj.name = message.name);
    message.changelog !== undefined && (obj.changelog = message.changelog);
    message.default !== undefined && (obj.default = message.default);
    message.type !== undefined && (obj.type = versionTypeToJSON(message.type));
    message.mutable !== undefined && (obj.mutable = message.mutable);
    message.increasable !== undefined &&
      (obj.increasable = message.increasable);
    if (message.images) {
      obj.images = message.images.map((e) =>
        e ? ImageResponse.toJSON(e) : undefined
      );
    } else {
      obj.images = [];
    }
    if (message.deployments) {
      obj.deployments = message.deployments.map((e) =>
        e ? DeploymentResponse.toJSON(e) : undefined
      );
    } else {
      obj.deployments = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<VersionDetailsResponse>, I>>(
    object: I
  ): VersionDetailsResponse {
    const message = createBaseVersionDetailsResponse();
    message.id = object.id ?? "";
    message.audit =
      object.audit !== undefined && object.audit !== null
        ? AuditResponse.fromPartial(object.audit)
        : undefined;
    message.name = object.name ?? "";
    message.changelog = object.changelog ?? "";
    message.default = object.default ?? false;
    message.type = object.type ?? 0;
    message.mutable = object.mutable ?? false;
    message.increasable = object.increasable ?? false;
    message.images =
      object.images?.map((e) => ImageResponse.fromPartial(e)) || [];
    message.deployments =
      object.deployments?.map((e) => DeploymentResponse.fromPartial(e)) || [];
    return message;
  },
};

function createBaseIncreaseVersionRequest(): IncreaseVersionRequest {
  return { id: "", accessedBy: "", name: "", changelog: undefined };
}

export const IncreaseVersionRequest = {
  encode(
    message: IncreaseVersionRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.changelog !== undefined) {
      writer.uint32(810).string(message.changelog);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): IncreaseVersionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIncreaseVersionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.changelog = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): IncreaseVersionRequest {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      name: isSet(object.name) ? String(object.name) : "",
      changelog: isSet(object.changelog) ? String(object.changelog) : undefined,
    };
  },

  toJSON(message: IncreaseVersionRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.name !== undefined && (obj.name = message.name);
    message.changelog !== undefined && (obj.changelog = message.changelog);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<IncreaseVersionRequest>, I>>(
    object: I
  ): IncreaseVersionRequest {
    const message = createBaseIncreaseVersionRequest();
    message.id = object.id ?? "";
    message.accessedBy = object.accessedBy ?? "";
    message.name = object.name ?? "";
    message.changelog = object.changelog ?? undefined;
    return message;
  },
};

function createBaseExplicitContainerConfig(): ExplicitContainerConfig {
  return {
    ports: [],
    mounts: [],
    networkMode: undefined,
    expose: undefined,
    user: undefined,
  };
}

export const ExplicitContainerConfig = {
  encode(
    message: ExplicitContainerConfig,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.ports) {
      ExplicitContainerConfig_Port.encode(
        v!,
        writer.uint32(10).fork()
      ).ldelim();
    }
    for (const v of message.mounts) {
      writer.uint32(18).string(v!);
    }
    if (message.networkMode !== undefined) {
      writer.uint32(32).int32(message.networkMode);
    }
    if (message.expose !== undefined) {
      ExplicitContainerConfig_Expose.encode(
        message.expose,
        writer.uint32(42).fork()
      ).ldelim();
    }
    if (message.user !== undefined) {
      writer.uint32(48).uint64(message.user);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ExplicitContainerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExplicitContainerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.ports.push(
            ExplicitContainerConfig_Port.decode(reader, reader.uint32())
          );
          break;
        case 2:
          message.mounts.push(reader.string());
          break;
        case 4:
          message.networkMode = reader.int32() as any;
          break;
        case 5:
          message.expose = ExplicitContainerConfig_Expose.decode(
            reader,
            reader.uint32()
          );
          break;
        case 6:
          message.user = longToNumber(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ExplicitContainerConfig {
    return {
      ports: Array.isArray(object?.ports)
        ? object.ports.map((e: any) => ExplicitContainerConfig_Port.fromJSON(e))
        : [],
      mounts: Array.isArray(object?.mounts)
        ? object.mounts.map((e: any) => String(e))
        : [],
      networkMode: isSet(object.networkMode)
        ? explicitContainerConfig_NetworkModeFromJSON(object.networkMode)
        : undefined,
      expose: isSet(object.expose)
        ? ExplicitContainerConfig_Expose.fromJSON(object.expose)
        : undefined,
      user: isSet(object.user) ? Number(object.user) : undefined,
    };
  },

  toJSON(message: ExplicitContainerConfig): unknown {
    const obj: any = {};
    if (message.ports) {
      obj.ports = message.ports.map((e) =>
        e ? ExplicitContainerConfig_Port.toJSON(e) : undefined
      );
    } else {
      obj.ports = [];
    }
    if (message.mounts) {
      obj.mounts = message.mounts.map((e) => e);
    } else {
      obj.mounts = [];
    }
    message.networkMode !== undefined &&
      (obj.networkMode =
        message.networkMode !== undefined
          ? explicitContainerConfig_NetworkModeToJSON(message.networkMode)
          : undefined);
    message.expose !== undefined &&
      (obj.expose = message.expose
        ? ExplicitContainerConfig_Expose.toJSON(message.expose)
        : undefined);
    message.user !== undefined && (obj.user = Math.round(message.user));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ExplicitContainerConfig>, I>>(
    object: I
  ): ExplicitContainerConfig {
    const message = createBaseExplicitContainerConfig();
    message.ports =
      object.ports?.map((e) => ExplicitContainerConfig_Port.fromPartial(e)) ||
      [];
    message.mounts = object.mounts?.map((e) => e) || [];
    message.networkMode = object.networkMode ?? undefined;
    message.expose =
      object.expose !== undefined && object.expose !== null
        ? ExplicitContainerConfig_Expose.fromPartial(object.expose)
        : undefined;
    message.user = object.user ?? undefined;
    return message;
  },
};

function createBaseExplicitContainerConfig_Port(): ExplicitContainerConfig_Port {
  return { internal: 0, external: 0 };
}

export const ExplicitContainerConfig_Port = {
  encode(
    message: ExplicitContainerConfig_Port,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.internal !== 0) {
      writer.uint32(8).int32(message.internal);
    }
    if (message.external !== 0) {
      writer.uint32(16).int32(message.external);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ExplicitContainerConfig_Port {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExplicitContainerConfig_Port();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.internal = reader.int32();
          break;
        case 2:
          message.external = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ExplicitContainerConfig_Port {
    return {
      internal: isSet(object.internal) ? Number(object.internal) : 0,
      external: isSet(object.external) ? Number(object.external) : 0,
    };
  },

  toJSON(message: ExplicitContainerConfig_Port): unknown {
    const obj: any = {};
    message.internal !== undefined &&
      (obj.internal = Math.round(message.internal));
    message.external !== undefined &&
      (obj.external = Math.round(message.external));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ExplicitContainerConfig_Port>, I>>(
    object: I
  ): ExplicitContainerConfig_Port {
    const message = createBaseExplicitContainerConfig_Port();
    message.internal = object.internal ?? 0;
    message.external = object.external ?? 0;
    return message;
  },
};

function createBaseExplicitContainerConfig_Expose(): ExplicitContainerConfig_Expose {
  return { public: false, tls: false };
}

export const ExplicitContainerConfig_Expose = {
  encode(
    message: ExplicitContainerConfig_Expose,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.public === true) {
      writer.uint32(8).bool(message.public);
    }
    if (message.tls === true) {
      writer.uint32(16).bool(message.tls);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ExplicitContainerConfig_Expose {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExplicitContainerConfig_Expose();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.public = reader.bool();
          break;
        case 2:
          message.tls = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ExplicitContainerConfig_Expose {
    return {
      public: isSet(object.public) ? Boolean(object.public) : false,
      tls: isSet(object.tls) ? Boolean(object.tls) : false,
    };
  },

  toJSON(message: ExplicitContainerConfig_Expose): unknown {
    const obj: any = {};
    message.public !== undefined && (obj.public = message.public);
    message.tls !== undefined && (obj.tls = message.tls);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ExplicitContainerConfig_Expose>, I>>(
    object: I
  ): ExplicitContainerConfig_Expose {
    const message = createBaseExplicitContainerConfig_Expose();
    message.public = object.public ?? false;
    message.tls = object.tls ?? false;
    return message;
  },
};

function createBaseContainerConfig(): ContainerConfig {
  return { config: undefined, capabilities: [], environment: [] };
}

export const ContainerConfig = {
  encode(
    message: ContainerConfig,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.config !== undefined) {
      ExplicitContainerConfig.encode(
        message.config,
        writer.uint32(802).fork()
      ).ldelim();
    }
    for (const v of message.capabilities) {
      UniqueKeyValue.encode(v!, writer.uint32(8002).fork()).ldelim();
    }
    for (const v of message.environment) {
      UniqueKeyValue.encode(v!, writer.uint32(8010).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ContainerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContainerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 100:
          message.config = ExplicitContainerConfig.decode(
            reader,
            reader.uint32()
          );
          break;
        case 1000:
          message.capabilities.push(
            UniqueKeyValue.decode(reader, reader.uint32())
          );
          break;
        case 1001:
          message.environment.push(
            UniqueKeyValue.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ContainerConfig {
    return {
      config: isSet(object.config)
        ? ExplicitContainerConfig.fromJSON(object.config)
        : undefined,
      capabilities: Array.isArray(object?.capabilities)
        ? object.capabilities.map((e: any) => UniqueKeyValue.fromJSON(e))
        : [],
      environment: Array.isArray(object?.environment)
        ? object.environment.map((e: any) => UniqueKeyValue.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ContainerConfig): unknown {
    const obj: any = {};
    message.config !== undefined &&
      (obj.config = message.config
        ? ExplicitContainerConfig.toJSON(message.config)
        : undefined);
    if (message.capabilities) {
      obj.capabilities = message.capabilities.map((e) =>
        e ? UniqueKeyValue.toJSON(e) : undefined
      );
    } else {
      obj.capabilities = [];
    }
    if (message.environment) {
      obj.environment = message.environment.map((e) =>
        e ? UniqueKeyValue.toJSON(e) : undefined
      );
    } else {
      obj.environment = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ContainerConfig>, I>>(
    object: I
  ): ContainerConfig {
    const message = createBaseContainerConfig();
    message.config =
      object.config !== undefined && object.config !== null
        ? ExplicitContainerConfig.fromPartial(object.config)
        : undefined;
    message.capabilities =
      object.capabilities?.map((e) => UniqueKeyValue.fromPartial(e)) || [];
    message.environment =
      object.environment?.map((e) => UniqueKeyValue.fromPartial(e)) || [];
    return message;
  },
};

function createBaseImageResponse(): ImageResponse {
  return {
    id: "",
    name: "",
    tag: "",
    order: 0,
    registryId: "",
    config: undefined,
  };
}

export const ImageResponse = {
  encode(
    message: ImageResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.tag !== "") {
      writer.uint32(810).string(message.tag);
    }
    if (message.order !== 0) {
      writer.uint32(816).uint32(message.order);
    }
    if (message.registryId !== "") {
      writer.uint32(826).string(message.registryId);
    }
    if (message.config !== undefined) {
      ContainerConfig.encode(
        message.config,
        writer.uint32(834).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ImageResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseImageResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.tag = reader.string();
          break;
        case 102:
          message.order = reader.uint32();
          break;
        case 103:
          message.registryId = reader.string();
          break;
        case 104:
          message.config = ContainerConfig.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ImageResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      name: isSet(object.name) ? String(object.name) : "",
      tag: isSet(object.tag) ? String(object.tag) : "",
      order: isSet(object.order) ? Number(object.order) : 0,
      registryId: isSet(object.registryId) ? String(object.registryId) : "",
      config: isSet(object.config)
        ? ContainerConfig.fromJSON(object.config)
        : undefined,
    };
  },

  toJSON(message: ImageResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.name !== undefined && (obj.name = message.name);
    message.tag !== undefined && (obj.tag = message.tag);
    message.order !== undefined && (obj.order = Math.round(message.order));
    message.registryId !== undefined && (obj.registryId = message.registryId);
    message.config !== undefined &&
      (obj.config = message.config
        ? ContainerConfig.toJSON(message.config)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ImageResponse>, I>>(
    object: I
  ): ImageResponse {
    const message = createBaseImageResponse();
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    message.tag = object.tag ?? "";
    message.order = object.order ?? 0;
    message.registryId = object.registryId ?? "";
    message.config =
      object.config !== undefined && object.config !== null
        ? ContainerConfig.fromPartial(object.config)
        : undefined;
    return message;
  },
};

function createBaseImageListResponse(): ImageListResponse {
  return { data: [] };
}

export const ImageListResponse = {
  encode(
    message: ImageListResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.data) {
      ImageResponse.encode(v!, writer.uint32(802).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ImageListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseImageListResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 100:
          message.data.push(ImageResponse.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ImageListResponse {
    return {
      data: Array.isArray(object?.data)
        ? object.data.map((e: any) => ImageResponse.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ImageListResponse): unknown {
    const obj: any = {};
    if (message.data) {
      obj.data = message.data.map((e) =>
        e ? ImageResponse.toJSON(e) : undefined
      );
    } else {
      obj.data = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ImageListResponse>, I>>(
    object: I
  ): ImageListResponse {
    const message = createBaseImageListResponse();
    message.data = object.data?.map((e) => ImageResponse.fromPartial(e)) || [];
    return message;
  },
};

function createBaseOrderVersionImagesRequest(): OrderVersionImagesRequest {
  return { accessedBy: "", versionId: "", imageIds: [] };
}

export const OrderVersionImagesRequest = {
  encode(
    message: OrderVersionImagesRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.versionId !== "") {
      writer.uint32(802).string(message.versionId);
    }
    for (const v of message.imageIds) {
      writer.uint32(810).string(v!);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): OrderVersionImagesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrderVersionImagesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.versionId = reader.string();
          break;
        case 101:
          message.imageIds.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): OrderVersionImagesRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      versionId: isSet(object.versionId) ? String(object.versionId) : "",
      imageIds: Array.isArray(object?.imageIds)
        ? object.imageIds.map((e: any) => String(e))
        : [],
    };
  },

  toJSON(message: OrderVersionImagesRequest): unknown {
    const obj: any = {};
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.versionId !== undefined && (obj.versionId = message.versionId);
    if (message.imageIds) {
      obj.imageIds = message.imageIds.map((e) => e);
    } else {
      obj.imageIds = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<OrderVersionImagesRequest>, I>>(
    object: I
  ): OrderVersionImagesRequest {
    const message = createBaseOrderVersionImagesRequest();
    message.accessedBy = object.accessedBy ?? "";
    message.versionId = object.versionId ?? "";
    message.imageIds = object.imageIds?.map((e) => e) || [];
    return message;
  },
};

function createBaseAddImagesToVersionRequest(): AddImagesToVersionRequest {
  return { accessedBy: "", versionId: "", registryId: "", imageIds: [] };
}

export const AddImagesToVersionRequest = {
  encode(
    message: AddImagesToVersionRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.versionId !== "") {
      writer.uint32(802).string(message.versionId);
    }
    if (message.registryId !== "") {
      writer.uint32(810).string(message.registryId);
    }
    for (const v of message.imageIds) {
      writer.uint32(818).string(v!);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AddImagesToVersionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAddImagesToVersionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.versionId = reader.string();
          break;
        case 101:
          message.registryId = reader.string();
          break;
        case 102:
          message.imageIds.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AddImagesToVersionRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      versionId: isSet(object.versionId) ? String(object.versionId) : "",
      registryId: isSet(object.registryId) ? String(object.registryId) : "",
      imageIds: Array.isArray(object?.imageIds)
        ? object.imageIds.map((e: any) => String(e))
        : [],
    };
  },

  toJSON(message: AddImagesToVersionRequest): unknown {
    const obj: any = {};
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.versionId !== undefined && (obj.versionId = message.versionId);
    message.registryId !== undefined && (obj.registryId = message.registryId);
    if (message.imageIds) {
      obj.imageIds = message.imageIds.map((e) => e);
    } else {
      obj.imageIds = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<AddImagesToVersionRequest>, I>>(
    object: I
  ): AddImagesToVersionRequest {
    const message = createBaseAddImagesToVersionRequest();
    message.accessedBy = object.accessedBy ?? "";
    message.versionId = object.versionId ?? "";
    message.registryId = object.registryId ?? "";
    message.imageIds = object.imageIds?.map((e) => e) || [];
    return message;
  },
};

function createBaseUniqueKeyValue(): UniqueKeyValue {
  return { id: "", key: "", value: "" };
}

export const UniqueKeyValue = {
  encode(
    message: UniqueKeyValue,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(802).string(message.id);
    }
    if (message.key !== "") {
      writer.uint32(810).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(818).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UniqueKeyValue {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUniqueKeyValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 100:
          message.id = reader.string();
          break;
        case 101:
          message.key = reader.string();
          break;
        case 102:
          message.value = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UniqueKeyValue {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      key: isSet(object.key) ? String(object.key) : "",
      value: isSet(object.value) ? String(object.value) : "",
    };
  },

  toJSON(message: UniqueKeyValue): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UniqueKeyValue>, I>>(
    object: I
  ): UniqueKeyValue {
    const message = createBaseUniqueKeyValue();
    message.id = object.id ?? "";
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseKeyValueList(): KeyValueList {
  return { data: [] };
}

export const KeyValueList = {
  encode(
    message: KeyValueList,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.data) {
      UniqueKeyValue.encode(v!, writer.uint32(8002).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): KeyValueList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseKeyValueList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1000:
          message.data.push(UniqueKeyValue.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): KeyValueList {
    return {
      data: Array.isArray(object?.data)
        ? object.data.map((e: any) => UniqueKeyValue.fromJSON(e))
        : [],
    };
  },

  toJSON(message: KeyValueList): unknown {
    const obj: any = {};
    if (message.data) {
      obj.data = message.data.map((e) =>
        e ? UniqueKeyValue.toJSON(e) : undefined
      );
    } else {
      obj.data = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<KeyValueList>, I>>(
    object: I
  ): KeyValueList {
    const message = createBaseKeyValueList();
    message.data = object.data?.map((e) => UniqueKeyValue.fromPartial(e)) || [];
    return message;
  },
};

function createBasePatchContainerConfig(): PatchContainerConfig {
  return { capabilities: undefined, environment: undefined, config: undefined };
}

export const PatchContainerConfig = {
  encode(
    message: PatchContainerConfig,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.capabilities !== undefined) {
      KeyValueList.encode(
        message.capabilities,
        writer.uint32(802).fork()
      ).ldelim();
    }
    if (message.environment !== undefined) {
      KeyValueList.encode(
        message.environment,
        writer.uint32(810).fork()
      ).ldelim();
    }
    if (message.config !== undefined) {
      ExplicitContainerConfig.encode(
        message.config,
        writer.uint32(826).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): PatchContainerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePatchContainerConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 100:
          message.capabilities = KeyValueList.decode(reader, reader.uint32());
          break;
        case 101:
          message.environment = KeyValueList.decode(reader, reader.uint32());
          break;
        case 103:
          message.config = ExplicitContainerConfig.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PatchContainerConfig {
    return {
      capabilities: isSet(object.capabilities)
        ? KeyValueList.fromJSON(object.capabilities)
        : undefined,
      environment: isSet(object.environment)
        ? KeyValueList.fromJSON(object.environment)
        : undefined,
      config: isSet(object.config)
        ? ExplicitContainerConfig.fromJSON(object.config)
        : undefined,
    };
  },

  toJSON(message: PatchContainerConfig): unknown {
    const obj: any = {};
    message.capabilities !== undefined &&
      (obj.capabilities = message.capabilities
        ? KeyValueList.toJSON(message.capabilities)
        : undefined);
    message.environment !== undefined &&
      (obj.environment = message.environment
        ? KeyValueList.toJSON(message.environment)
        : undefined);
    message.config !== undefined &&
      (obj.config = message.config
        ? ExplicitContainerConfig.toJSON(message.config)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PatchContainerConfig>, I>>(
    object: I
  ): PatchContainerConfig {
    const message = createBasePatchContainerConfig();
    message.capabilities =
      object.capabilities !== undefined && object.capabilities !== null
        ? KeyValueList.fromPartial(object.capabilities)
        : undefined;
    message.environment =
      object.environment !== undefined && object.environment !== null
        ? KeyValueList.fromPartial(object.environment)
        : undefined;
    message.config =
      object.config !== undefined && object.config !== null
        ? ExplicitContainerConfig.fromPartial(object.config)
        : undefined;
    return message;
  },
};

function createBasePatchImageRequest(): PatchImageRequest {
  return {
    id: "",
    accessedBy: "",
    name: undefined,
    tag: undefined,
    config: undefined,
  };
}

export const PatchImageRequest = {
  encode(
    message: PatchImageRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.name !== undefined) {
      writer.uint32(802).string(message.name);
    }
    if (message.tag !== undefined) {
      writer.uint32(810).string(message.tag);
    }
    if (message.config !== undefined) {
      PatchContainerConfig.encode(
        message.config,
        writer.uint32(818).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PatchImageRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePatchImageRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.tag = reader.string();
          break;
        case 102:
          message.config = PatchContainerConfig.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PatchImageRequest {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      name: isSet(object.name) ? String(object.name) : undefined,
      tag: isSet(object.tag) ? String(object.tag) : undefined,
      config: isSet(object.config)
        ? PatchContainerConfig.fromJSON(object.config)
        : undefined,
    };
  },

  toJSON(message: PatchImageRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.name !== undefined && (obj.name = message.name);
    message.tag !== undefined && (obj.tag = message.tag);
    message.config !== undefined &&
      (obj.config = message.config
        ? PatchContainerConfig.toJSON(message.config)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PatchImageRequest>, I>>(
    object: I
  ): PatchImageRequest {
    const message = createBasePatchImageRequest();
    message.id = object.id ?? "";
    message.accessedBy = object.accessedBy ?? "";
    message.name = object.name ?? undefined;
    message.tag = object.tag ?? undefined;
    message.config =
      object.config !== undefined && object.config !== null
        ? PatchContainerConfig.fromPartial(object.config)
        : undefined;
    return message;
  },
};

function createBaseNodeResponse(): NodeResponse {
  return {
    id: "",
    audit: undefined,
    name: "",
    description: undefined,
    icon: undefined,
    address: undefined,
    status: 0,
    connectedAt: undefined,
  };
}

export const NodeResponse = {
  encode(
    message: NodeResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(810).string(message.description);
    }
    if (message.icon !== undefined) {
      writer.uint32(818).string(message.icon);
    }
    if (message.address !== undefined) {
      writer.uint32(826).string(message.address);
    }
    if (message.status !== 0) {
      writer.uint32(832).int32(message.status);
    }
    if (message.connectedAt !== undefined) {
      Timestamp.encode(message.connectedAt, writer.uint32(842).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNodeResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.audit = AuditResponse.decode(reader, reader.uint32());
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.description = reader.string();
          break;
        case 102:
          message.icon = reader.string();
          break;
        case 103:
          message.address = reader.string();
          break;
        case 104:
          message.status = reader.int32() as any;
          break;
        case 105:
          message.connectedAt = Timestamp.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): NodeResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      audit: isSet(object.audit)
        ? AuditResponse.fromJSON(object.audit)
        : undefined,
      name: isSet(object.name) ? String(object.name) : "",
      description: isSet(object.description)
        ? String(object.description)
        : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
      address: isSet(object.address) ? String(object.address) : undefined,
      status: isSet(object.status)
        ? nodeConnectionStatusFromJSON(object.status)
        : 0,
      connectedAt: isSet(object.connectedAt)
        ? fromJsonTimestamp(object.connectedAt)
        : undefined,
    };
  },

  toJSON(message: NodeResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.audit !== undefined &&
      (obj.audit = message.audit
        ? AuditResponse.toJSON(message.audit)
        : undefined);
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined &&
      (obj.description = message.description);
    message.icon !== undefined && (obj.icon = message.icon);
    message.address !== undefined && (obj.address = message.address);
    message.status !== undefined &&
      (obj.status = nodeConnectionStatusToJSON(message.status));
    message.connectedAt !== undefined &&
      (obj.connectedAt = fromTimestamp(message.connectedAt).toISOString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<NodeResponse>, I>>(
    object: I
  ): NodeResponse {
    const message = createBaseNodeResponse();
    message.id = object.id ?? "";
    message.audit =
      object.audit !== undefined && object.audit !== null
        ? AuditResponse.fromPartial(object.audit)
        : undefined;
    message.name = object.name ?? "";
    message.description = object.description ?? undefined;
    message.icon = object.icon ?? undefined;
    message.address = object.address ?? undefined;
    message.status = object.status ?? 0;
    message.connectedAt =
      object.connectedAt !== undefined && object.connectedAt !== null
        ? Timestamp.fromPartial(object.connectedAt)
        : undefined;
    return message;
  },
};

function createBaseNodeDetailsResponse(): NodeDetailsResponse {
  return {
    id: "",
    audit: undefined,
    name: "",
    description: undefined,
    icon: undefined,
    address: undefined,
    status: 0,
    hasToken: false,
    connectedAt: undefined,
    install: undefined,
    script: undefined,
  };
}

export const NodeDetailsResponse = {
  encode(
    message: NodeDetailsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(810).string(message.description);
    }
    if (message.icon !== undefined) {
      writer.uint32(818).string(message.icon);
    }
    if (message.address !== undefined) {
      writer.uint32(826).string(message.address);
    }
    if (message.status !== 0) {
      writer.uint32(832).int32(message.status);
    }
    if (message.hasToken === true) {
      writer.uint32(840).bool(message.hasToken);
    }
    if (message.connectedAt !== undefined) {
      Timestamp.encode(message.connectedAt, writer.uint32(850).fork()).ldelim();
    }
    if (message.install !== undefined) {
      NodeInstallResponse.encode(
        message.install,
        writer.uint32(858).fork()
      ).ldelim();
    }
    if (message.script !== undefined) {
      NodeScriptResponse.encode(
        message.script,
        writer.uint32(866).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeDetailsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNodeDetailsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.audit = AuditResponse.decode(reader, reader.uint32());
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.description = reader.string();
          break;
        case 102:
          message.icon = reader.string();
          break;
        case 103:
          message.address = reader.string();
          break;
        case 104:
          message.status = reader.int32() as any;
          break;
        case 105:
          message.hasToken = reader.bool();
          break;
        case 106:
          message.connectedAt = Timestamp.decode(reader, reader.uint32());
          break;
        case 107:
          message.install = NodeInstallResponse.decode(reader, reader.uint32());
          break;
        case 108:
          message.script = NodeScriptResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): NodeDetailsResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      audit: isSet(object.audit)
        ? AuditResponse.fromJSON(object.audit)
        : undefined,
      name: isSet(object.name) ? String(object.name) : "",
      description: isSet(object.description)
        ? String(object.description)
        : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
      address: isSet(object.address) ? String(object.address) : undefined,
      status: isSet(object.status)
        ? nodeConnectionStatusFromJSON(object.status)
        : 0,
      hasToken: isSet(object.hasToken) ? Boolean(object.hasToken) : false,
      connectedAt: isSet(object.connectedAt)
        ? fromJsonTimestamp(object.connectedAt)
        : undefined,
      install: isSet(object.install)
        ? NodeInstallResponse.fromJSON(object.install)
        : undefined,
      script: isSet(object.script)
        ? NodeScriptResponse.fromJSON(object.script)
        : undefined,
    };
  },

  toJSON(message: NodeDetailsResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.audit !== undefined &&
      (obj.audit = message.audit
        ? AuditResponse.toJSON(message.audit)
        : undefined);
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined &&
      (obj.description = message.description);
    message.icon !== undefined && (obj.icon = message.icon);
    message.address !== undefined && (obj.address = message.address);
    message.status !== undefined &&
      (obj.status = nodeConnectionStatusToJSON(message.status));
    message.hasToken !== undefined && (obj.hasToken = message.hasToken);
    message.connectedAt !== undefined &&
      (obj.connectedAt = fromTimestamp(message.connectedAt).toISOString());
    message.install !== undefined &&
      (obj.install = message.install
        ? NodeInstallResponse.toJSON(message.install)
        : undefined);
    message.script !== undefined &&
      (obj.script = message.script
        ? NodeScriptResponse.toJSON(message.script)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<NodeDetailsResponse>, I>>(
    object: I
  ): NodeDetailsResponse {
    const message = createBaseNodeDetailsResponse();
    message.id = object.id ?? "";
    message.audit =
      object.audit !== undefined && object.audit !== null
        ? AuditResponse.fromPartial(object.audit)
        : undefined;
    message.name = object.name ?? "";
    message.description = object.description ?? undefined;
    message.icon = object.icon ?? undefined;
    message.address = object.address ?? undefined;
    message.status = object.status ?? 0;
    message.hasToken = object.hasToken ?? false;
    message.connectedAt =
      object.connectedAt !== undefined && object.connectedAt !== null
        ? Timestamp.fromPartial(object.connectedAt)
        : undefined;
    message.install =
      object.install !== undefined && object.install !== null
        ? NodeInstallResponse.fromPartial(object.install)
        : undefined;
    message.script =
      object.script !== undefined && object.script !== null
        ? NodeScriptResponse.fromPartial(object.script)
        : undefined;
    return message;
  },
};

function createBaseNodeListResponse(): NodeListResponse {
  return { data: [] };
}

export const NodeListResponse = {
  encode(
    message: NodeListResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.data) {
      NodeResponse.encode(v!, writer.uint32(8002).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNodeListResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1000:
          message.data.push(NodeResponse.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): NodeListResponse {
    return {
      data: Array.isArray(object?.data)
        ? object.data.map((e: any) => NodeResponse.fromJSON(e))
        : [],
    };
  },

  toJSON(message: NodeListResponse): unknown {
    const obj: any = {};
    if (message.data) {
      obj.data = message.data.map((e) =>
        e ? NodeResponse.toJSON(e) : undefined
      );
    } else {
      obj.data = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<NodeListResponse>, I>>(
    object: I
  ): NodeListResponse {
    const message = createBaseNodeListResponse();
    message.data = object.data?.map((e) => NodeResponse.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCreateNodeRequest(): CreateNodeRequest {
  return { accessedBy: "", name: "", description: undefined, icon: undefined };
}

export const CreateNodeRequest = {
  encode(
    message: CreateNodeRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(810).string(message.description);
    }
    if (message.icon !== undefined) {
      writer.uint32(818).string(message.icon);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateNodeRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateNodeRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.description = reader.string();
          break;
        case 102:
          message.icon = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CreateNodeRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      name: isSet(object.name) ? String(object.name) : "",
      description: isSet(object.description)
        ? String(object.description)
        : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
    };
  },

  toJSON(message: CreateNodeRequest): unknown {
    const obj: any = {};
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined &&
      (obj.description = message.description);
    message.icon !== undefined && (obj.icon = message.icon);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<CreateNodeRequest>, I>>(
    object: I
  ): CreateNodeRequest {
    const message = createBaseCreateNodeRequest();
    message.accessedBy = object.accessedBy ?? "";
    message.name = object.name ?? "";
    message.description = object.description ?? undefined;
    message.icon = object.icon ?? undefined;
    return message;
  },
};

function createBaseUpdateNodeRequest(): UpdateNodeRequest {
  return {
    id: "",
    accessedBy: "",
    name: "",
    description: undefined,
    icon: undefined,
  };
}

export const UpdateNodeRequest = {
  encode(
    message: UpdateNodeRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(810).string(message.description);
    }
    if (message.icon !== undefined) {
      writer.uint32(818).string(message.icon);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateNodeRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateNodeRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.description = reader.string();
          break;
        case 102:
          message.icon = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UpdateNodeRequest {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      name: isSet(object.name) ? String(object.name) : "",
      description: isSet(object.description)
        ? String(object.description)
        : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
    };
  },

  toJSON(message: UpdateNodeRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined &&
      (obj.description = message.description);
    message.icon !== undefined && (obj.icon = message.icon);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UpdateNodeRequest>, I>>(
    object: I
  ): UpdateNodeRequest {
    const message = createBaseUpdateNodeRequest();
    message.id = object.id ?? "";
    message.accessedBy = object.accessedBy ?? "";
    message.name = object.name ?? "";
    message.description = object.description ?? undefined;
    message.icon = object.icon ?? undefined;
    return message;
  },
};

function createBaseNodeInstallResponse(): NodeInstallResponse {
  return { command: "", expireAt: undefined };
}

export const NodeInstallResponse = {
  encode(
    message: NodeInstallResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.command !== "") {
      writer.uint32(802).string(message.command);
    }
    if (message.expireAt !== undefined) {
      Timestamp.encode(message.expireAt, writer.uint32(810).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeInstallResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNodeInstallResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 100:
          message.command = reader.string();
          break;
        case 101:
          message.expireAt = Timestamp.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): NodeInstallResponse {
    return {
      command: isSet(object.command) ? String(object.command) : "",
      expireAt: isSet(object.expireAt)
        ? fromJsonTimestamp(object.expireAt)
        : undefined,
    };
  },

  toJSON(message: NodeInstallResponse): unknown {
    const obj: any = {};
    message.command !== undefined && (obj.command = message.command);
    message.expireAt !== undefined &&
      (obj.expireAt = fromTimestamp(message.expireAt).toISOString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<NodeInstallResponse>, I>>(
    object: I
  ): NodeInstallResponse {
    const message = createBaseNodeInstallResponse();
    message.command = object.command ?? "";
    message.expireAt =
      object.expireAt !== undefined && object.expireAt !== null
        ? Timestamp.fromPartial(object.expireAt)
        : undefined;
    return message;
  },
};

function createBaseNodeScriptResponse(): NodeScriptResponse {
  return { content: "" };
}

export const NodeScriptResponse = {
  encode(
    message: NodeScriptResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.content !== "") {
      writer.uint32(802).string(message.content);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeScriptResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNodeScriptResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 100:
          message.content = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): NodeScriptResponse {
    return {
      content: isSet(object.content) ? String(object.content) : "",
    };
  },

  toJSON(message: NodeScriptResponse): unknown {
    const obj: any = {};
    message.content !== undefined && (obj.content = message.content);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<NodeScriptResponse>, I>>(
    object: I
  ): NodeScriptResponse {
    const message = createBaseNodeScriptResponse();
    message.content = object.content ?? "";
    return message;
  },
};

function createBaseNodeEventMessage(): NodeEventMessage {
  return { id: "", status: 0, address: undefined };
}

export const NodeEventMessage = {
  encode(
    message: NodeEventMessage,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.status !== 0) {
      writer.uint32(800).int32(message.status);
    }
    if (message.address !== undefined) {
      writer.uint32(810).string(message.address);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeEventMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNodeEventMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 100:
          message.status = reader.int32() as any;
          break;
        case 101:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): NodeEventMessage {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      status: isSet(object.status)
        ? nodeConnectionStatusFromJSON(object.status)
        : 0,
      address: isSet(object.address) ? String(object.address) : undefined,
    };
  },

  toJSON(message: NodeEventMessage): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.status !== undefined &&
      (obj.status = nodeConnectionStatusToJSON(message.status));
    message.address !== undefined && (obj.address = message.address);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<NodeEventMessage>, I>>(
    object: I
  ): NodeEventMessage {
    const message = createBaseNodeEventMessage();
    message.id = object.id ?? "";
    message.status = object.status ?? 0;
    message.address = object.address ?? undefined;
    return message;
  },
};

function createBaseWatchContainerStatusRequest(): WatchContainerStatusRequest {
  return { accessedBy: "", nodeId: "", prefix: undefined };
}

export const WatchContainerStatusRequest = {
  encode(
    message: WatchContainerStatusRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.nodeId !== "") {
      writer.uint32(802).string(message.nodeId);
    }
    if (message.prefix !== undefined) {
      writer.uint32(810).string(message.prefix);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): WatchContainerStatusRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWatchContainerStatusRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.nodeId = reader.string();
          break;
        case 101:
          message.prefix = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WatchContainerStatusRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      nodeId: isSet(object.nodeId) ? String(object.nodeId) : "",
      prefix: isSet(object.prefix) ? String(object.prefix) : undefined,
    };
  },

  toJSON(message: WatchContainerStatusRequest): unknown {
    const obj: any = {};
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.nodeId !== undefined && (obj.nodeId = message.nodeId);
    message.prefix !== undefined && (obj.prefix = message.prefix);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<WatchContainerStatusRequest>, I>>(
    object: I
  ): WatchContainerStatusRequest {
    const message = createBaseWatchContainerStatusRequest();
    message.accessedBy = object.accessedBy ?? "";
    message.nodeId = object.nodeId ?? "";
    message.prefix = object.prefix ?? undefined;
    return message;
  },
};

function createBaseContainerPort(): ContainerPort {
  return { internal: 0, external: 0 };
}

export const ContainerPort = {
  encode(
    message: ContainerPort,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.internal !== 0) {
      writer.uint32(8).int32(message.internal);
    }
    if (message.external !== 0) {
      writer.uint32(16).int32(message.external);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ContainerPort {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContainerPort();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.internal = reader.int32();
          break;
        case 2:
          message.external = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ContainerPort {
    return {
      internal: isSet(object.internal) ? Number(object.internal) : 0,
      external: isSet(object.external) ? Number(object.external) : 0,
    };
  },

  toJSON(message: ContainerPort): unknown {
    const obj: any = {};
    message.internal !== undefined &&
      (obj.internal = Math.round(message.internal));
    message.external !== undefined &&
      (obj.external = Math.round(message.external));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ContainerPort>, I>>(
    object: I
  ): ContainerPort {
    const message = createBaseContainerPort();
    message.internal = object.internal ?? 0;
    message.external = object.external ?? 0;
    return message;
  },
};

function createBaseContainerStatusItem(): ContainerStatusItem {
  return {
    containerId: "",
    name: "",
    command: "",
    createdAt: undefined,
    status: 0,
    ports: [],
  };
}

export const ContainerStatusItem = {
  encode(
    message: ContainerStatusItem,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.containerId !== "") {
      writer.uint32(802).string(message.containerId);
    }
    if (message.name !== "") {
      writer.uint32(810).string(message.name);
    }
    if (message.command !== "") {
      writer.uint32(826).string(message.command);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(message.createdAt, writer.uint32(834).fork()).ldelim();
    }
    if (message.status !== 0) {
      writer.uint32(840).int32(message.status);
    }
    for (const v of message.ports) {
      ContainerPort.encode(v!, writer.uint32(8002).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ContainerStatusItem {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContainerStatusItem();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 100:
          message.containerId = reader.string();
          break;
        case 101:
          message.name = reader.string();
          break;
        case 103:
          message.command = reader.string();
          break;
        case 104:
          message.createdAt = Timestamp.decode(reader, reader.uint32());
          break;
        case 105:
          message.status = reader.int32() as any;
          break;
        case 1000:
          message.ports.push(ContainerPort.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ContainerStatusItem {
    return {
      containerId: isSet(object.containerId) ? String(object.containerId) : "",
      name: isSet(object.name) ? String(object.name) : "",
      command: isSet(object.command) ? String(object.command) : "",
      createdAt: isSet(object.createdAt)
        ? fromJsonTimestamp(object.createdAt)
        : undefined,
      status: isSet(object.status) ? containerStatusFromJSON(object.status) : 0,
      ports: Array.isArray(object?.ports)
        ? object.ports.map((e: any) => ContainerPort.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ContainerStatusItem): unknown {
    const obj: any = {};
    message.containerId !== undefined &&
      (obj.containerId = message.containerId);
    message.name !== undefined && (obj.name = message.name);
    message.command !== undefined && (obj.command = message.command);
    message.createdAt !== undefined &&
      (obj.createdAt = fromTimestamp(message.createdAt).toISOString());
    message.status !== undefined &&
      (obj.status = containerStatusToJSON(message.status));
    if (message.ports) {
      obj.ports = message.ports.map((e) =>
        e ? ContainerPort.toJSON(e) : undefined
      );
    } else {
      obj.ports = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ContainerStatusItem>, I>>(
    object: I
  ): ContainerStatusItem {
    const message = createBaseContainerStatusItem();
    message.containerId = object.containerId ?? "";
    message.name = object.name ?? "";
    message.command = object.command ?? "";
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null
        ? Timestamp.fromPartial(object.createdAt)
        : undefined;
    message.status = object.status ?? 0;
    message.ports =
      object.ports?.map((e) => ContainerPort.fromPartial(e)) || [];
    return message;
  },
};

function createBaseContainerStatusListMessage(): ContainerStatusListMessage {
  return { prefix: undefined, data: [] };
}

export const ContainerStatusListMessage = {
  encode(
    message: ContainerStatusListMessage,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.prefix !== undefined) {
      writer.uint32(802).string(message.prefix);
    }
    for (const v of message.data) {
      ContainerStatusItem.encode(v!, writer.uint32(8002).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ContainerStatusListMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContainerStatusListMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 100:
          message.prefix = reader.string();
          break;
        case 1000:
          message.data.push(
            ContainerStatusItem.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ContainerStatusListMessage {
    return {
      prefix: isSet(object.prefix) ? String(object.prefix) : undefined,
      data: Array.isArray(object?.data)
        ? object.data.map((e: any) => ContainerStatusItem.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ContainerStatusListMessage): unknown {
    const obj: any = {};
    message.prefix !== undefined && (obj.prefix = message.prefix);
    if (message.data) {
      obj.data = message.data.map((e) =>
        e ? ContainerStatusItem.toJSON(e) : undefined
      );
    } else {
      obj.data = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ContainerStatusListMessage>, I>>(
    object: I
  ): ContainerStatusListMessage {
    const message = createBaseContainerStatusListMessage();
    message.prefix = object.prefix ?? undefined;
    message.data =
      object.data?.map((e) => ContainerStatusItem.fromPartial(e)) || [];
    return message;
  },
};

function createBaseInstanceDeploymentItem(): InstanceDeploymentItem {
  return { instanceId: "", status: 0 };
}

export const InstanceDeploymentItem = {
  encode(
    message: InstanceDeploymentItem,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.instanceId !== "") {
      writer.uint32(802).string(message.instanceId);
    }
    if (message.status !== 0) {
      writer.uint32(808).int32(message.status);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): InstanceDeploymentItem {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInstanceDeploymentItem();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 100:
          message.instanceId = reader.string();
          break;
        case 101:
          message.status = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): InstanceDeploymentItem {
    return {
      instanceId: isSet(object.instanceId) ? String(object.instanceId) : "",
      status: isSet(object.status) ? containerStatusFromJSON(object.status) : 0,
    };
  },

  toJSON(message: InstanceDeploymentItem): unknown {
    const obj: any = {};
    message.instanceId !== undefined && (obj.instanceId = message.instanceId);
    message.status !== undefined &&
      (obj.status = containerStatusToJSON(message.status));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<InstanceDeploymentItem>, I>>(
    object: I
  ): InstanceDeploymentItem {
    const message = createBaseInstanceDeploymentItem();
    message.instanceId = object.instanceId ?? "";
    message.status = object.status ?? 0;
    return message;
  },
};

function createBaseDeploymentStatusMessage(): DeploymentStatusMessage {
  return { instance: undefined, deploymentStatus: undefined, log: [] };
}

export const DeploymentStatusMessage = {
  encode(
    message: DeploymentStatusMessage,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.instance !== undefined) {
      InstanceDeploymentItem.encode(
        message.instance,
        writer.uint32(1602).fork()
      ).ldelim();
    }
    if (message.deploymentStatus !== undefined) {
      writer.uint32(1608).int32(message.deploymentStatus);
    }
    for (const v of message.log) {
      writer.uint32(8002).string(v!);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): DeploymentStatusMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeploymentStatusMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 200:
          message.instance = InstanceDeploymentItem.decode(
            reader,
            reader.uint32()
          );
          break;
        case 201:
          message.deploymentStatus = reader.int32() as any;
          break;
        case 1000:
          message.log.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeploymentStatusMessage {
    return {
      instance: isSet(object.instance)
        ? InstanceDeploymentItem.fromJSON(object.instance)
        : undefined,
      deploymentStatus: isSet(object.deploymentStatus)
        ? deploymentStatusFromJSON(object.deploymentStatus)
        : undefined,
      log: Array.isArray(object?.log)
        ? object.log.map((e: any) => String(e))
        : [],
    };
  },

  toJSON(message: DeploymentStatusMessage): unknown {
    const obj: any = {};
    message.instance !== undefined &&
      (obj.instance = message.instance
        ? InstanceDeploymentItem.toJSON(message.instance)
        : undefined);
    message.deploymentStatus !== undefined &&
      (obj.deploymentStatus =
        message.deploymentStatus !== undefined
          ? deploymentStatusToJSON(message.deploymentStatus)
          : undefined);
    if (message.log) {
      obj.log = message.log.map((e) => e);
    } else {
      obj.log = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentStatusMessage>, I>>(
    object: I
  ): DeploymentStatusMessage {
    const message = createBaseDeploymentStatusMessage();
    message.instance =
      object.instance !== undefined && object.instance !== null
        ? InstanceDeploymentItem.fromPartial(object.instance)
        : undefined;
    message.deploymentStatus = object.deploymentStatus ?? undefined;
    message.log = object.log?.map((e) => e) || [];
    return message;
  },
};

function createBaseDeploymentProgressMessage(): DeploymentProgressMessage {
  return { id: "", status: undefined, instance: undefined, log: [] };
}

export const DeploymentProgressMessage = {
  encode(
    message: DeploymentProgressMessage,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.status !== undefined) {
      writer.uint32(800).int32(message.status);
    }
    if (message.instance !== undefined) {
      InstanceDeploymentItem.encode(
        message.instance,
        writer.uint32(810).fork()
      ).ldelim();
    }
    for (const v of message.log) {
      writer.uint32(8002).string(v!);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): DeploymentProgressMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeploymentProgressMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 100:
          message.status = reader.int32() as any;
          break;
        case 101:
          message.instance = InstanceDeploymentItem.decode(
            reader,
            reader.uint32()
          );
          break;
        case 1000:
          message.log.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeploymentProgressMessage {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      status: isSet(object.status)
        ? deploymentStatusFromJSON(object.status)
        : undefined,
      instance: isSet(object.instance)
        ? InstanceDeploymentItem.fromJSON(object.instance)
        : undefined,
      log: Array.isArray(object?.log)
        ? object.log.map((e: any) => String(e))
        : [],
    };
  },

  toJSON(message: DeploymentProgressMessage): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.status !== undefined &&
      (obj.status =
        message.status !== undefined
          ? deploymentStatusToJSON(message.status)
          : undefined);
    message.instance !== undefined &&
      (obj.instance = message.instance
        ? InstanceDeploymentItem.toJSON(message.instance)
        : undefined);
    if (message.log) {
      obj.log = message.log.map((e) => e);
    } else {
      obj.log = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentProgressMessage>, I>>(
    object: I
  ): DeploymentProgressMessage {
    const message = createBaseDeploymentProgressMessage();
    message.id = object.id ?? "";
    message.status = object.status ?? undefined;
    message.instance =
      object.instance !== undefined && object.instance !== null
        ? InstanceDeploymentItem.fromPartial(object.instance)
        : undefined;
    message.log = object.log?.map((e) => e) || [];
    return message;
  },
};

function createBaseInstancesCreatedEventList(): InstancesCreatedEventList {
  return { data: [] };
}

export const InstancesCreatedEventList = {
  encode(
    message: InstancesCreatedEventList,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.data) {
      InstanceResponse.encode(v!, writer.uint32(8002).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): InstancesCreatedEventList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInstancesCreatedEventList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1000:
          message.data.push(InstanceResponse.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): InstancesCreatedEventList {
    return {
      data: Array.isArray(object?.data)
        ? object.data.map((e: any) => InstanceResponse.fromJSON(e))
        : [],
    };
  },

  toJSON(message: InstancesCreatedEventList): unknown {
    const obj: any = {};
    if (message.data) {
      obj.data = message.data.map((e) =>
        e ? InstanceResponse.toJSON(e) : undefined
      );
    } else {
      obj.data = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<InstancesCreatedEventList>, I>>(
    object: I
  ): InstancesCreatedEventList {
    const message = createBaseInstancesCreatedEventList();
    message.data =
      object.data?.map((e) => InstanceResponse.fromPartial(e)) || [];
    return message;
  },
};

function createBaseDeploymentEditEventMessage(): DeploymentEditEventMessage {
  return { instancesCreated: undefined, imageIdDeleted: undefined };
}

export const DeploymentEditEventMessage = {
  encode(
    message: DeploymentEditEventMessage,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.instancesCreated !== undefined) {
      InstancesCreatedEventList.encode(
        message.instancesCreated,
        writer.uint32(1602).fork()
      ).ldelim();
    }
    if (message.imageIdDeleted !== undefined) {
      writer.uint32(1610).string(message.imageIdDeleted);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): DeploymentEditEventMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeploymentEditEventMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 200:
          message.instancesCreated = InstancesCreatedEventList.decode(
            reader,
            reader.uint32()
          );
          break;
        case 201:
          message.imageIdDeleted = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeploymentEditEventMessage {
    return {
      instancesCreated: isSet(object.instancesCreated)
        ? InstancesCreatedEventList.fromJSON(object.instancesCreated)
        : undefined,
      imageIdDeleted: isSet(object.imageIdDeleted)
        ? String(object.imageIdDeleted)
        : undefined,
    };
  },

  toJSON(message: DeploymentEditEventMessage): unknown {
    const obj: any = {};
    message.instancesCreated !== undefined &&
      (obj.instancesCreated = message.instancesCreated
        ? InstancesCreatedEventList.toJSON(message.instancesCreated)
        : undefined);
    message.imageIdDeleted !== undefined &&
      (obj.imageIdDeleted = message.imageIdDeleted);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentEditEventMessage>, I>>(
    object: I
  ): DeploymentEditEventMessage {
    const message = createBaseDeploymentEditEventMessage();
    message.instancesCreated =
      object.instancesCreated !== undefined && object.instancesCreated !== null
        ? InstancesCreatedEventList.fromPartial(object.instancesCreated)
        : undefined;
    message.imageIdDeleted = object.imageIdDeleted ?? undefined;
    return message;
  },
};

function createBaseCreateDeploymentRequest(): CreateDeploymentRequest {
  return { accessedBy: "", versionId: "", nodeId: "" };
}

export const CreateDeploymentRequest = {
  encode(
    message: CreateDeploymentRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.versionId !== "") {
      writer.uint32(802).string(message.versionId);
    }
    if (message.nodeId !== "") {
      writer.uint32(810).string(message.nodeId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): CreateDeploymentRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateDeploymentRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.versionId = reader.string();
          break;
        case 101:
          message.nodeId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CreateDeploymentRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      versionId: isSet(object.versionId) ? String(object.versionId) : "",
      nodeId: isSet(object.nodeId) ? String(object.nodeId) : "",
    };
  },

  toJSON(message: CreateDeploymentRequest): unknown {
    const obj: any = {};
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.versionId !== undefined && (obj.versionId = message.versionId);
    message.nodeId !== undefined && (obj.nodeId = message.nodeId);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<CreateDeploymentRequest>, I>>(
    object: I
  ): CreateDeploymentRequest {
    const message = createBaseCreateDeploymentRequest();
    message.accessedBy = object.accessedBy ?? "";
    message.versionId = object.versionId ?? "";
    message.nodeId = object.nodeId ?? "";
    return message;
  },
};

function createBaseUpdateDeploymentRequest(): UpdateDeploymentRequest {
  return {
    id: "",
    accessedBy: "",
    name: "",
    descripion: undefined,
    prefix: "",
  };
}

export const UpdateDeploymentRequest = {
  encode(
    message: UpdateDeploymentRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.descripion !== undefined) {
      writer.uint32(810).string(message.descripion);
    }
    if (message.prefix !== "") {
      writer.uint32(818).string(message.prefix);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): UpdateDeploymentRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateDeploymentRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.descripion = reader.string();
          break;
        case 102:
          message.prefix = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UpdateDeploymentRequest {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      name: isSet(object.name) ? String(object.name) : "",
      descripion: isSet(object.descripion)
        ? String(object.descripion)
        : undefined,
      prefix: isSet(object.prefix) ? String(object.prefix) : "",
    };
  },

  toJSON(message: UpdateDeploymentRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.name !== undefined && (obj.name = message.name);
    message.descripion !== undefined && (obj.descripion = message.descripion);
    message.prefix !== undefined && (obj.prefix = message.prefix);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UpdateDeploymentRequest>, I>>(
    object: I
  ): UpdateDeploymentRequest {
    const message = createBaseUpdateDeploymentRequest();
    message.id = object.id ?? "";
    message.accessedBy = object.accessedBy ?? "";
    message.name = object.name ?? "";
    message.descripion = object.descripion ?? undefined;
    message.prefix = object.prefix ?? "";
    return message;
  },
};

function createBasePatchDeploymentRequest(): PatchDeploymentRequest {
  return {
    id: "",
    accessedBy: "",
    environment: undefined,
    instance: undefined,
  };
}

export const PatchDeploymentRequest = {
  encode(
    message: PatchDeploymentRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.environment !== undefined) {
      KeyValueList.encode(
        message.environment,
        writer.uint32(802).fork()
      ).ldelim();
    }
    if (message.instance !== undefined) {
      PatchInstanceRequest.encode(
        message.instance,
        writer.uint32(8010).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): PatchDeploymentRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePatchDeploymentRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.environment = KeyValueList.decode(reader, reader.uint32());
          break;
        case 1001:
          message.instance = PatchInstanceRequest.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PatchDeploymentRequest {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      environment: isSet(object.environment)
        ? KeyValueList.fromJSON(object.environment)
        : undefined,
      instance: isSet(object.instance)
        ? PatchInstanceRequest.fromJSON(object.instance)
        : undefined,
    };
  },

  toJSON(message: PatchDeploymentRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.environment !== undefined &&
      (obj.environment = message.environment
        ? KeyValueList.toJSON(message.environment)
        : undefined);
    message.instance !== undefined &&
      (obj.instance = message.instance
        ? PatchInstanceRequest.toJSON(message.instance)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PatchDeploymentRequest>, I>>(
    object: I
  ): PatchDeploymentRequest {
    const message = createBasePatchDeploymentRequest();
    message.id = object.id ?? "";
    message.accessedBy = object.accessedBy ?? "";
    message.environment =
      object.environment !== undefined && object.environment !== null
        ? KeyValueList.fromPartial(object.environment)
        : undefined;
    message.instance =
      object.instance !== undefined && object.instance !== null
        ? PatchInstanceRequest.fromPartial(object.instance)
        : undefined;
    return message;
  },
};

function createBaseInstanceResponse(): InstanceResponse {
  return {
    id: "",
    audit: undefined,
    image: undefined,
    status: undefined,
    config: undefined,
  };
}

export const InstanceResponse = {
  encode(
    message: InstanceResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim();
    }
    if (message.image !== undefined) {
      ImageResponse.encode(message.image, writer.uint32(802).fork()).ldelim();
    }
    if (message.status !== undefined) {
      writer.uint32(808).int32(message.status);
    }
    if (message.config !== undefined) {
      ContainerConfig.encode(
        message.config,
        writer.uint32(818).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InstanceResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInstanceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.audit = AuditResponse.decode(reader, reader.uint32());
          break;
        case 100:
          message.image = ImageResponse.decode(reader, reader.uint32());
          break;
        case 101:
          message.status = reader.int32() as any;
          break;
        case 102:
          message.config = ContainerConfig.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): InstanceResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      audit: isSet(object.audit)
        ? AuditResponse.fromJSON(object.audit)
        : undefined,
      image: isSet(object.image)
        ? ImageResponse.fromJSON(object.image)
        : undefined,
      status: isSet(object.status)
        ? containerStatusFromJSON(object.status)
        : undefined,
      config: isSet(object.config)
        ? ContainerConfig.fromJSON(object.config)
        : undefined,
    };
  },

  toJSON(message: InstanceResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.audit !== undefined &&
      (obj.audit = message.audit
        ? AuditResponse.toJSON(message.audit)
        : undefined);
    message.image !== undefined &&
      (obj.image = message.image
        ? ImageResponse.toJSON(message.image)
        : undefined);
    message.status !== undefined &&
      (obj.status =
        message.status !== undefined
          ? containerStatusToJSON(message.status)
          : undefined);
    message.config !== undefined &&
      (obj.config = message.config
        ? ContainerConfig.toJSON(message.config)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<InstanceResponse>, I>>(
    object: I
  ): InstanceResponse {
    const message = createBaseInstanceResponse();
    message.id = object.id ?? "";
    message.audit =
      object.audit !== undefined && object.audit !== null
        ? AuditResponse.fromPartial(object.audit)
        : undefined;
    message.image =
      object.image !== undefined && object.image !== null
        ? ImageResponse.fromPartial(object.image)
        : undefined;
    message.status = object.status ?? undefined;
    message.config =
      object.config !== undefined && object.config !== null
        ? ContainerConfig.fromPartial(object.config)
        : undefined;
    return message;
  },
};

function createBasePatchInstanceRequest(): PatchInstanceRequest {
  return {
    id: "",
    accessedBy: "",
    environment: undefined,
    capabilities: undefined,
    config: undefined,
  };
}

export const PatchInstanceRequest = {
  encode(
    message: PatchInstanceRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.accessedBy !== "") {
      writer.uint32(18).string(message.accessedBy);
    }
    if (message.environment !== undefined) {
      KeyValueList.encode(
        message.environment,
        writer.uint32(802).fork()
      ).ldelim();
    }
    if (message.capabilities !== undefined) {
      KeyValueList.encode(
        message.capabilities,
        writer.uint32(810).fork()
      ).ldelim();
    }
    if (message.config !== undefined) {
      ExplicitContainerConfig.encode(
        message.config,
        writer.uint32(818).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): PatchInstanceRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePatchInstanceRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.accessedBy = reader.string();
          break;
        case 100:
          message.environment = KeyValueList.decode(reader, reader.uint32());
          break;
        case 101:
          message.capabilities = KeyValueList.decode(reader, reader.uint32());
          break;
        case 102:
          message.config = ExplicitContainerConfig.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PatchInstanceRequest {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : "",
      environment: isSet(object.environment)
        ? KeyValueList.fromJSON(object.environment)
        : undefined,
      capabilities: isSet(object.capabilities)
        ? KeyValueList.fromJSON(object.capabilities)
        : undefined,
      config: isSet(object.config)
        ? ExplicitContainerConfig.fromJSON(object.config)
        : undefined,
    };
  },

  toJSON(message: PatchInstanceRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy);
    message.environment !== undefined &&
      (obj.environment = message.environment
        ? KeyValueList.toJSON(message.environment)
        : undefined);
    message.capabilities !== undefined &&
      (obj.capabilities = message.capabilities
        ? KeyValueList.toJSON(message.capabilities)
        : undefined);
    message.config !== undefined &&
      (obj.config = message.config
        ? ExplicitContainerConfig.toJSON(message.config)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PatchInstanceRequest>, I>>(
    object: I
  ): PatchInstanceRequest {
    const message = createBasePatchInstanceRequest();
    message.id = object.id ?? "";
    message.accessedBy = object.accessedBy ?? "";
    message.environment =
      object.environment !== undefined && object.environment !== null
        ? KeyValueList.fromPartial(object.environment)
        : undefined;
    message.capabilities =
      object.capabilities !== undefined && object.capabilities !== null
        ? KeyValueList.fromPartial(object.capabilities)
        : undefined;
    message.config =
      object.config !== undefined && object.config !== null
        ? ExplicitContainerConfig.fromPartial(object.config)
        : undefined;
    return message;
  },
};

function createBaseDeploymentListResponse(): DeploymentListResponse {
  return { data: [] };
}

export const DeploymentListResponse = {
  encode(
    message: DeploymentListResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.data) {
      DeploymentResponse.encode(v!, writer.uint32(8002).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): DeploymentListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeploymentListResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1000:
          message.data.push(DeploymentResponse.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeploymentListResponse {
    return {
      data: Array.isArray(object?.data)
        ? object.data.map((e: any) => DeploymentResponse.fromJSON(e))
        : [],
    };
  },

  toJSON(message: DeploymentListResponse): unknown {
    const obj: any = {};
    if (message.data) {
      obj.data = message.data.map((e) =>
        e ? DeploymentResponse.toJSON(e) : undefined
      );
    } else {
      obj.data = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentListResponse>, I>>(
    object: I
  ): DeploymentListResponse {
    const message = createBaseDeploymentListResponse();
    message.data =
      object.data?.map((e) => DeploymentResponse.fromPartial(e)) || [];
    return message;
  },
};

function createBaseDeploymentResponse(): DeploymentResponse {
  return {
    id: "",
    audit: undefined,
    name: "",
    prefix: "",
    nodeId: "",
    nodeName: "",
    status: 0,
  };
}

export const DeploymentResponse = {
  encode(
    message: DeploymentResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(802).string(message.name);
    }
    if (message.prefix !== "") {
      writer.uint32(810).string(message.prefix);
    }
    if (message.nodeId !== "") {
      writer.uint32(818).string(message.nodeId);
    }
    if (message.nodeName !== "") {
      writer.uint32(826).string(message.nodeName);
    }
    if (message.status !== 0) {
      writer.uint32(832).int32(message.status);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeploymentResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeploymentResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.audit = AuditResponse.decode(reader, reader.uint32());
          break;
        case 100:
          message.name = reader.string();
          break;
        case 101:
          message.prefix = reader.string();
          break;
        case 102:
          message.nodeId = reader.string();
          break;
        case 103:
          message.nodeName = reader.string();
          break;
        case 104:
          message.status = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeploymentResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      audit: isSet(object.audit)
        ? AuditResponse.fromJSON(object.audit)
        : undefined,
      name: isSet(object.name) ? String(object.name) : "",
      prefix: isSet(object.prefix) ? String(object.prefix) : "",
      nodeId: isSet(object.nodeId) ? String(object.nodeId) : "",
      nodeName: isSet(object.nodeName) ? String(object.nodeName) : "",
      status: isSet(object.status)
        ? deploymentStatusFromJSON(object.status)
        : 0,
    };
  },

  toJSON(message: DeploymentResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.audit !== undefined &&
      (obj.audit = message.audit
        ? AuditResponse.toJSON(message.audit)
        : undefined);
    message.name !== undefined && (obj.name = message.name);
    message.prefix !== undefined && (obj.prefix = message.prefix);
    message.nodeId !== undefined && (obj.nodeId = message.nodeId);
    message.nodeName !== undefined && (obj.nodeName = message.nodeName);
    message.status !== undefined &&
      (obj.status = deploymentStatusToJSON(message.status));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentResponse>, I>>(
    object: I
  ): DeploymentResponse {
    const message = createBaseDeploymentResponse();
    message.id = object.id ?? "";
    message.audit =
      object.audit !== undefined && object.audit !== null
        ? AuditResponse.fromPartial(object.audit)
        : undefined;
    message.name = object.name ?? "";
    message.prefix = object.prefix ?? "";
    message.nodeId = object.nodeId ?? "";
    message.nodeName = object.nodeName ?? "";
    message.status = object.status ?? 0;
    return message;
  },
};

function createBaseDeploymentDetailsResponse(): DeploymentDetailsResponse {
  return {
    id: "",
    audit: undefined,
    productVersionId: "",
    nodeId: "",
    name: "",
    description: undefined,
    prefix: "",
    environment: [],
    status: 0,
    instances: [],
  };
}

export const DeploymentDetailsResponse = {
  encode(
    message: DeploymentDetailsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim();
    }
    if (message.productVersionId !== "") {
      writer.uint32(802).string(message.productVersionId);
    }
    if (message.nodeId !== "") {
      writer.uint32(810).string(message.nodeId);
    }
    if (message.name !== "") {
      writer.uint32(818).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(826).string(message.description);
    }
    if (message.prefix !== "") {
      writer.uint32(834).string(message.prefix);
    }
    for (const v of message.environment) {
      UniqueKeyValue.encode(v!, writer.uint32(842).fork()).ldelim();
    }
    if (message.status !== 0) {
      writer.uint32(848).int32(message.status);
    }
    for (const v of message.instances) {
      InstanceResponse.encode(v!, writer.uint32(8002).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): DeploymentDetailsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeploymentDetailsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.audit = AuditResponse.decode(reader, reader.uint32());
          break;
        case 100:
          message.productVersionId = reader.string();
          break;
        case 101:
          message.nodeId = reader.string();
          break;
        case 102:
          message.name = reader.string();
          break;
        case 103:
          message.description = reader.string();
          break;
        case 104:
          message.prefix = reader.string();
          break;
        case 105:
          message.environment.push(
            UniqueKeyValue.decode(reader, reader.uint32())
          );
          break;
        case 106:
          message.status = reader.int32() as any;
          break;
        case 1000:
          message.instances.push(
            InstanceResponse.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeploymentDetailsResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      audit: isSet(object.audit)
        ? AuditResponse.fromJSON(object.audit)
        : undefined,
      productVersionId: isSet(object.productVersionId)
        ? String(object.productVersionId)
        : "",
      nodeId: isSet(object.nodeId) ? String(object.nodeId) : "",
      name: isSet(object.name) ? String(object.name) : "",
      description: isSet(object.description)
        ? String(object.description)
        : undefined,
      prefix: isSet(object.prefix) ? String(object.prefix) : "",
      environment: Array.isArray(object?.environment)
        ? object.environment.map((e: any) => UniqueKeyValue.fromJSON(e))
        : [],
      status: isSet(object.status)
        ? deploymentStatusFromJSON(object.status)
        : 0,
      instances: Array.isArray(object?.instances)
        ? object.instances.map((e: any) => InstanceResponse.fromJSON(e))
        : [],
    };
  },

  toJSON(message: DeploymentDetailsResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.audit !== undefined &&
      (obj.audit = message.audit
        ? AuditResponse.toJSON(message.audit)
        : undefined);
    message.productVersionId !== undefined &&
      (obj.productVersionId = message.productVersionId);
    message.nodeId !== undefined && (obj.nodeId = message.nodeId);
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined &&
      (obj.description = message.description);
    message.prefix !== undefined && (obj.prefix = message.prefix);
    if (message.environment) {
      obj.environment = message.environment.map((e) =>
        e ? UniqueKeyValue.toJSON(e) : undefined
      );
    } else {
      obj.environment = [];
    }
    message.status !== undefined &&
      (obj.status = deploymentStatusToJSON(message.status));
    if (message.instances) {
      obj.instances = message.instances.map((e) =>
        e ? InstanceResponse.toJSON(e) : undefined
      );
    } else {
      obj.instances = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentDetailsResponse>, I>>(
    object: I
  ): DeploymentDetailsResponse {
    const message = createBaseDeploymentDetailsResponse();
    message.id = object.id ?? "";
    message.audit =
      object.audit !== undefined && object.audit !== null
        ? AuditResponse.fromPartial(object.audit)
        : undefined;
    message.productVersionId = object.productVersionId ?? "";
    message.nodeId = object.nodeId ?? "";
    message.name = object.name ?? "";
    message.description = object.description ?? undefined;
    message.prefix = object.prefix ?? "";
    message.environment =
      object.environment?.map((e) => UniqueKeyValue.fromPartial(e)) || [];
    message.status = object.status ?? 0;
    message.instances =
      object.instances?.map((e) => InstanceResponse.fromPartial(e)) || [];
    return message;
  },
};

function createBaseDeploymentEventContainerStatus(): DeploymentEventContainerStatus {
  return { instanceId: "", status: 0 };
}

export const DeploymentEventContainerStatus = {
  encode(
    message: DeploymentEventContainerStatus,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.instanceId !== "") {
      writer.uint32(10).string(message.instanceId);
    }
    if (message.status !== 0) {
      writer.uint32(16).int32(message.status);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): DeploymentEventContainerStatus {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeploymentEventContainerStatus();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.instanceId = reader.string();
          break;
        case 2:
          message.status = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeploymentEventContainerStatus {
    return {
      instanceId: isSet(object.instanceId) ? String(object.instanceId) : "",
      status: isSet(object.status) ? containerStatusFromJSON(object.status) : 0,
    };
  },

  toJSON(message: DeploymentEventContainerStatus): unknown {
    const obj: any = {};
    message.instanceId !== undefined && (obj.instanceId = message.instanceId);
    message.status !== undefined &&
      (obj.status = containerStatusToJSON(message.status));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentEventContainerStatus>, I>>(
    object: I
  ): DeploymentEventContainerStatus {
    const message = createBaseDeploymentEventContainerStatus();
    message.instanceId = object.instanceId ?? "";
    message.status = object.status ?? 0;
    return message;
  },
};

function createBaseDeploymentEventLog(): DeploymentEventLog {
  return { log: [] };
}

export const DeploymentEventLog = {
  encode(
    message: DeploymentEventLog,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.log) {
      writer.uint32(8002).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeploymentEventLog {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeploymentEventLog();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1000:
          message.log.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeploymentEventLog {
    return {
      log: Array.isArray(object?.log)
        ? object.log.map((e: any) => String(e))
        : [],
    };
  },

  toJSON(message: DeploymentEventLog): unknown {
    const obj: any = {};
    if (message.log) {
      obj.log = message.log.map((e) => e);
    } else {
      obj.log = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentEventLog>, I>>(
    object: I
  ): DeploymentEventLog {
    const message = createBaseDeploymentEventLog();
    message.log = object.log?.map((e) => e) || [];
    return message;
  },
};

function createBaseDeploymentEventResponse(): DeploymentEventResponse {
  return {
    type: 0,
    createdAt: undefined,
    log: undefined,
    deploymentStatus: undefined,
    containerStatus: undefined,
  };
}

export const DeploymentEventResponse = {
  encode(
    message: DeploymentEventResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.type !== 0) {
      writer.uint32(800).int32(message.type);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(message.createdAt, writer.uint32(810).fork()).ldelim();
    }
    if (message.log !== undefined) {
      DeploymentEventLog.encode(
        message.log,
        writer.uint32(1602).fork()
      ).ldelim();
    }
    if (message.deploymentStatus !== undefined) {
      writer.uint32(1608).int32(message.deploymentStatus);
    }
    if (message.containerStatus !== undefined) {
      DeploymentEventContainerStatus.encode(
        message.containerStatus,
        writer.uint32(1618).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): DeploymentEventResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeploymentEventResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 100:
          message.type = reader.int32() as any;
          break;
        case 101:
          message.createdAt = Timestamp.decode(reader, reader.uint32());
          break;
        case 200:
          message.log = DeploymentEventLog.decode(reader, reader.uint32());
          break;
        case 201:
          message.deploymentStatus = reader.int32() as any;
          break;
        case 202:
          message.containerStatus = DeploymentEventContainerStatus.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeploymentEventResponse {
    return {
      type: isSet(object.type) ? deploymentEventTypeFromJSON(object.type) : 0,
      createdAt: isSet(object.createdAt)
        ? fromJsonTimestamp(object.createdAt)
        : undefined,
      log: isSet(object.log)
        ? DeploymentEventLog.fromJSON(object.log)
        : undefined,
      deploymentStatus: isSet(object.deploymentStatus)
        ? deploymentStatusFromJSON(object.deploymentStatus)
        : undefined,
      containerStatus: isSet(object.containerStatus)
        ? DeploymentEventContainerStatus.fromJSON(object.containerStatus)
        : undefined,
    };
  },

  toJSON(message: DeploymentEventResponse): unknown {
    const obj: any = {};
    message.type !== undefined &&
      (obj.type = deploymentEventTypeToJSON(message.type));
    message.createdAt !== undefined &&
      (obj.createdAt = fromTimestamp(message.createdAt).toISOString());
    message.log !== undefined &&
      (obj.log = message.log
        ? DeploymentEventLog.toJSON(message.log)
        : undefined);
    message.deploymentStatus !== undefined &&
      (obj.deploymentStatus =
        message.deploymentStatus !== undefined
          ? deploymentStatusToJSON(message.deploymentStatus)
          : undefined);
    message.containerStatus !== undefined &&
      (obj.containerStatus = message.containerStatus
        ? DeploymentEventContainerStatus.toJSON(message.containerStatus)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentEventResponse>, I>>(
    object: I
  ): DeploymentEventResponse {
    const message = createBaseDeploymentEventResponse();
    message.type = object.type ?? 0;
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null
        ? Timestamp.fromPartial(object.createdAt)
        : undefined;
    message.log =
      object.log !== undefined && object.log !== null
        ? DeploymentEventLog.fromPartial(object.log)
        : undefined;
    message.deploymentStatus = object.deploymentStatus ?? undefined;
    message.containerStatus =
      object.containerStatus !== undefined && object.containerStatus !== null
        ? DeploymentEventContainerStatus.fromPartial(object.containerStatus)
        : undefined;
    return message;
  },
};

function createBaseDeploymentEventListResponse(): DeploymentEventListResponse {
  return { data: [] };
}

export const DeploymentEventListResponse = {
  encode(
    message: DeploymentEventListResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.data) {
      DeploymentEventResponse.encode(v!, writer.uint32(8002).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): DeploymentEventListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeploymentEventListResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1000:
          message.data.push(
            DeploymentEventResponse.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeploymentEventListResponse {
    return {
      data: Array.isArray(object?.data)
        ? object.data.map((e: any) => DeploymentEventResponse.fromJSON(e))
        : [],
    };
  },

  toJSON(message: DeploymentEventListResponse): unknown {
    const obj: any = {};
    if (message.data) {
      obj.data = message.data.map((e) =>
        e ? DeploymentEventResponse.toJSON(e) : undefined
      );
    } else {
      obj.data = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentEventListResponse>, I>>(
    object: I
  ): DeploymentEventListResponse {
    const message = createBaseDeploymentEventListResponse();
    message.data =
      object.data?.map((e) => DeploymentEventResponse.fromPartial(e)) || [];
    return message;
  },
};

/** Services */
export type CruxProductService = typeof CruxProductService;
export const CruxProductService = {
  /** CRUD */
  getProducts: {
    path: "/crux.CruxProduct/GetProducts",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AccessRequest) =>
      Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
    responseSerialize: (value: ProductListResponse) =>
      Buffer.from(ProductListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ProductListResponse.decode(value),
  },
  createProduct: {
    path: "/crux.CruxProduct/CreateProduct",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateProductRequest) =>
      Buffer.from(CreateProductRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateProductRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) =>
      Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
  updateProduct: {
    path: "/crux.CruxProduct/UpdateProduct",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateProductRequest) =>
      Buffer.from(UpdateProductRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => UpdateProductRequest.decode(value),
    responseSerialize: (value: UpdateEntityResponse) =>
      Buffer.from(UpdateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => UpdateEntityResponse.decode(value),
  },
  deleteProduct: {
    path: "/crux.CruxProduct/DeleteProduct",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) =>
      Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  getProductDetails: {
    path: "/crux.CruxProduct/GetProductDetails",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: ProductDetailsReponse) =>
      Buffer.from(ProductDetailsReponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ProductDetailsReponse.decode(value),
  },
} as const;

export interface CruxProductServer extends UntypedServiceImplementation {
  /** CRUD */
  getProducts: handleUnaryCall<AccessRequest, ProductListResponse>;
  createProduct: handleUnaryCall<CreateProductRequest, CreateEntityResponse>;
  updateProduct: handleUnaryCall<UpdateProductRequest, UpdateEntityResponse>;
  deleteProduct: handleUnaryCall<IdRequest, Empty>;
  getProductDetails: handleUnaryCall<IdRequest, ProductDetailsReponse>;
}

export interface CruxProductClient extends Client {
  /** CRUD */
  getProducts(
    request: AccessRequest,
    callback: (
      error: ServiceError | null,
      response: ProductListResponse
    ) => void
  ): ClientUnaryCall;
  getProducts(
    request: AccessRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: ProductListResponse
    ) => void
  ): ClientUnaryCall;
  getProducts(
    request: AccessRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: ProductListResponse
    ) => void
  ): ClientUnaryCall;
  createProduct(
    request: CreateProductRequest,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  createProduct(
    request: CreateProductRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  createProduct(
    request: CreateProductRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  updateProduct(
    request: UpdateProductRequest,
    callback: (
      error: ServiceError | null,
      response: UpdateEntityResponse
    ) => void
  ): ClientUnaryCall;
  updateProduct(
    request: UpdateProductRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: UpdateEntityResponse
    ) => void
  ): ClientUnaryCall;
  updateProduct(
    request: UpdateProductRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: UpdateEntityResponse
    ) => void
  ): ClientUnaryCall;
  deleteProduct(
    request: IdRequest,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteProduct(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteProduct(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  getProductDetails(
    request: IdRequest,
    callback: (
      error: ServiceError | null,
      response: ProductDetailsReponse
    ) => void
  ): ClientUnaryCall;
  getProductDetails(
    request: IdRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: ProductDetailsReponse
    ) => void
  ): ClientUnaryCall;
  getProductDetails(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: ProductDetailsReponse
    ) => void
  ): ClientUnaryCall;
}

export const CruxProductClient = makeGenericClientConstructor(
  CruxProductService,
  "crux.CruxProduct"
) as unknown as {
  new (
    address: string,
    credentials: ChannelCredentials,
    options?: Partial<ChannelOptions>
  ): CruxProductClient;
  service: typeof CruxProductService;
};

export type CruxRegistryService = typeof CruxRegistryService;
export const CruxRegistryService = {
  /** CRUD */
  getRegistries: {
    path: "/crux.CruxRegistry/GetRegistries",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AccessRequest) =>
      Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
    responseSerialize: (value: RegistryListResponse) =>
      Buffer.from(RegistryListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => RegistryListResponse.decode(value),
  },
  createRegistry: {
    path: "/crux.CruxRegistry/CreateRegistry",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateRegistryRequest) =>
      Buffer.from(CreateRegistryRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateRegistryRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) =>
      Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
  updateRegistry: {
    path: "/crux.CruxRegistry/UpdateRegistry",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateRegistryRequest) =>
      Buffer.from(UpdateRegistryRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => UpdateRegistryRequest.decode(value),
    responseSerialize: (value: UpdateEntityResponse) =>
      Buffer.from(UpdateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => UpdateEntityResponse.decode(value),
  },
  deleteRegistry: {
    path: "/crux.CruxRegistry/DeleteRegistry",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) =>
      Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  getRegistryDetails: {
    path: "/crux.CruxRegistry/GetRegistryDetails",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: RegistryDetailsResponse) =>
      Buffer.from(RegistryDetailsResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) =>
      RegistryDetailsResponse.decode(value),
  },
} as const;

export interface CruxRegistryServer extends UntypedServiceImplementation {
  /** CRUD */
  getRegistries: handleUnaryCall<AccessRequest, RegistryListResponse>;
  createRegistry: handleUnaryCall<CreateRegistryRequest, CreateEntityResponse>;
  updateRegistry: handleUnaryCall<UpdateRegistryRequest, UpdateEntityResponse>;
  deleteRegistry: handleUnaryCall<IdRequest, Empty>;
  getRegistryDetails: handleUnaryCall<IdRequest, RegistryDetailsResponse>;
}

export interface CruxRegistryClient extends Client {
  /** CRUD */
  getRegistries(
    request: AccessRequest,
    callback: (
      error: ServiceError | null,
      response: RegistryListResponse
    ) => void
  ): ClientUnaryCall;
  getRegistries(
    request: AccessRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: RegistryListResponse
    ) => void
  ): ClientUnaryCall;
  getRegistries(
    request: AccessRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: RegistryListResponse
    ) => void
  ): ClientUnaryCall;
  createRegistry(
    request: CreateRegistryRequest,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  createRegistry(
    request: CreateRegistryRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  createRegistry(
    request: CreateRegistryRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  updateRegistry(
    request: UpdateRegistryRequest,
    callback: (
      error: ServiceError | null,
      response: UpdateEntityResponse
    ) => void
  ): ClientUnaryCall;
  updateRegistry(
    request: UpdateRegistryRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: UpdateEntityResponse
    ) => void
  ): ClientUnaryCall;
  updateRegistry(
    request: UpdateRegistryRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: UpdateEntityResponse
    ) => void
  ): ClientUnaryCall;
  deleteRegistry(
    request: IdRequest,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteRegistry(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteRegistry(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  getRegistryDetails(
    request: IdRequest,
    callback: (
      error: ServiceError | null,
      response: RegistryDetailsResponse
    ) => void
  ): ClientUnaryCall;
  getRegistryDetails(
    request: IdRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: RegistryDetailsResponse
    ) => void
  ): ClientUnaryCall;
  getRegistryDetails(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: RegistryDetailsResponse
    ) => void
  ): ClientUnaryCall;
}

export const CruxRegistryClient = makeGenericClientConstructor(
  CruxRegistryService,
  "crux.CruxRegistry"
) as unknown as {
  new (
    address: string,
    credentials: ChannelCredentials,
    options?: Partial<ChannelOptions>
  ): CruxRegistryClient;
  service: typeof CruxRegistryService;
};

export type CruxNodeService = typeof CruxNodeService;
export const CruxNodeService = {
  /** CRUD */
  getNodes: {
    path: "/crux.CruxNode/GetNodes",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AccessRequest) =>
      Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
    responseSerialize: (value: NodeListResponse) =>
      Buffer.from(NodeListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => NodeListResponse.decode(value),
  },
  createNode: {
    path: "/crux.CruxNode/CreateNode",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateNodeRequest) =>
      Buffer.from(CreateNodeRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateNodeRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) =>
      Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
  updateNode: {
    path: "/crux.CruxNode/UpdateNode",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateNodeRequest) =>
      Buffer.from(UpdateNodeRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => UpdateNodeRequest.decode(value),
    responseSerialize: (value: Empty) =>
      Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  deleteNode: {
    path: "/crux.CruxNode/DeleteNode",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) =>
      Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  getNodeDetails: {
    path: "/crux.CruxNode/GetNodeDetails",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: NodeDetailsResponse) =>
      Buffer.from(NodeDetailsResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => NodeDetailsResponse.decode(value),
  },
  generateScript: {
    path: "/crux.CruxNode/GenerateScript",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: NodeInstallResponse) =>
      Buffer.from(NodeInstallResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => NodeInstallResponse.decode(value),
  },
  getScript: {
    path: "/crux.CruxNode/GetScript",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: ServiceIdRequest) =>
      Buffer.from(ServiceIdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => ServiceIdRequest.decode(value),
    responseSerialize: (value: NodeScriptResponse) =>
      Buffer.from(NodeScriptResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => NodeScriptResponse.decode(value),
  },
  discardScript: {
    path: "/crux.CruxNode/DiscardScript",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) =>
      Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  revokeToken: {
    path: "/crux.CruxNode/RevokeToken",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) =>
      Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  subscribeNodeEventChannel: {
    path: "/crux.CruxNode/SubscribeNodeEventChannel",
    requestStream: false,
    responseStream: true,
    requestSerialize: (value: ServiceIdRequest) =>
      Buffer.from(ServiceIdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => ServiceIdRequest.decode(value),
    responseSerialize: (value: NodeEventMessage) =>
      Buffer.from(NodeEventMessage.encode(value).finish()),
    responseDeserialize: (value: Buffer) => NodeEventMessage.decode(value),
  },
  watchContainerStatus: {
    path: "/crux.CruxNode/WatchContainerStatus",
    requestStream: false,
    responseStream: true,
    requestSerialize: (value: WatchContainerStatusRequest) =>
      Buffer.from(WatchContainerStatusRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) =>
      WatchContainerStatusRequest.decode(value),
    responseSerialize: (value: ContainerStatusListMessage) =>
      Buffer.from(ContainerStatusListMessage.encode(value).finish()),
    responseDeserialize: (value: Buffer) =>
      ContainerStatusListMessage.decode(value),
  },
} as const;

export interface CruxNodeServer extends UntypedServiceImplementation {
  /** CRUD */
  getNodes: handleUnaryCall<AccessRequest, NodeListResponse>;
  createNode: handleUnaryCall<CreateNodeRequest, CreateEntityResponse>;
  updateNode: handleUnaryCall<UpdateNodeRequest, Empty>;
  deleteNode: handleUnaryCall<IdRequest, Empty>;
  getNodeDetails: handleUnaryCall<IdRequest, NodeDetailsResponse>;
  generateScript: handleUnaryCall<IdRequest, NodeInstallResponse>;
  getScript: handleUnaryCall<ServiceIdRequest, NodeScriptResponse>;
  discardScript: handleUnaryCall<IdRequest, Empty>;
  revokeToken: handleUnaryCall<IdRequest, Empty>;
  subscribeNodeEventChannel: handleServerStreamingCall<
    ServiceIdRequest,
    NodeEventMessage
  >;
  watchContainerStatus: handleServerStreamingCall<
    WatchContainerStatusRequest,
    ContainerStatusListMessage
  >;
}

export interface CruxNodeClient extends Client {
  /** CRUD */
  getNodes(
    request: AccessRequest,
    callback: (error: ServiceError | null, response: NodeListResponse) => void
  ): ClientUnaryCall;
  getNodes(
    request: AccessRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: NodeListResponse) => void
  ): ClientUnaryCall;
  getNodes(
    request: AccessRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: NodeListResponse) => void
  ): ClientUnaryCall;
  createNode(
    request: CreateNodeRequest,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  createNode(
    request: CreateNodeRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  createNode(
    request: CreateNodeRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  updateNode(
    request: UpdateNodeRequest,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  updateNode(
    request: UpdateNodeRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  updateNode(
    request: UpdateNodeRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteNode(
    request: IdRequest,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteNode(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteNode(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  getNodeDetails(
    request: IdRequest,
    callback: (
      error: ServiceError | null,
      response: NodeDetailsResponse
    ) => void
  ): ClientUnaryCall;
  getNodeDetails(
    request: IdRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: NodeDetailsResponse
    ) => void
  ): ClientUnaryCall;
  getNodeDetails(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: NodeDetailsResponse
    ) => void
  ): ClientUnaryCall;
  generateScript(
    request: IdRequest,
    callback: (
      error: ServiceError | null,
      response: NodeInstallResponse
    ) => void
  ): ClientUnaryCall;
  generateScript(
    request: IdRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: NodeInstallResponse
    ) => void
  ): ClientUnaryCall;
  generateScript(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: NodeInstallResponse
    ) => void
  ): ClientUnaryCall;
  getScript(
    request: ServiceIdRequest,
    callback: (error: ServiceError | null, response: NodeScriptResponse) => void
  ): ClientUnaryCall;
  getScript(
    request: ServiceIdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: NodeScriptResponse) => void
  ): ClientUnaryCall;
  getScript(
    request: ServiceIdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: NodeScriptResponse) => void
  ): ClientUnaryCall;
  discardScript(
    request: IdRequest,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  discardScript(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  discardScript(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  revokeToken(
    request: IdRequest,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  revokeToken(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  revokeToken(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  subscribeNodeEventChannel(
    request: ServiceIdRequest,
    options?: Partial<CallOptions>
  ): ClientReadableStream<NodeEventMessage>;
  subscribeNodeEventChannel(
    request: ServiceIdRequest,
    metadata?: Metadata,
    options?: Partial<CallOptions>
  ): ClientReadableStream<NodeEventMessage>;
  watchContainerStatus(
    request: WatchContainerStatusRequest,
    options?: Partial<CallOptions>
  ): ClientReadableStream<ContainerStatusListMessage>;
  watchContainerStatus(
    request: WatchContainerStatusRequest,
    metadata?: Metadata,
    options?: Partial<CallOptions>
  ): ClientReadableStream<ContainerStatusListMessage>;
}

export const CruxNodeClient = makeGenericClientConstructor(
  CruxNodeService,
  "crux.CruxNode"
) as unknown as {
  new (
    address: string,
    credentials: ChannelCredentials,
    options?: Partial<ChannelOptions>
  ): CruxNodeClient;
  service: typeof CruxNodeService;
};

export type CruxProductVersionService = typeof CruxProductVersionService;
export const CruxProductVersionService = {
  getVersionsByProductId: {
    path: "/crux.CruxProductVersion/GetVersionsByProductId",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: VersionListResponse) =>
      Buffer.from(VersionListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => VersionListResponse.decode(value),
  },
  createVersion: {
    path: "/crux.CruxProductVersion/CreateVersion",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateVersionRequest) =>
      Buffer.from(CreateVersionRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateVersionRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) =>
      Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
  updateVersion: {
    path: "/crux.CruxProductVersion/UpdateVersion",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateVersionRequest) =>
      Buffer.from(UpdateVersionRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => UpdateVersionRequest.decode(value),
    responseSerialize: (value: UpdateEntityResponse) =>
      Buffer.from(UpdateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => UpdateEntityResponse.decode(value),
  },
  deleteVersion: {
    path: "/crux.CruxProductVersion/DeleteVersion",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) =>
      Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  getVersionDetails: {
    path: "/crux.CruxProductVersion/GetVersionDetails",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: VersionDetailsResponse) =>
      Buffer.from(VersionDetailsResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) =>
      VersionDetailsResponse.decode(value),
  },
  increaseVersion: {
    path: "/crux.CruxProductVersion/IncreaseVersion",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IncreaseVersionRequest) =>
      Buffer.from(IncreaseVersionRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IncreaseVersionRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) =>
      Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
} as const;

export interface CruxProductVersionServer extends UntypedServiceImplementation {
  getVersionsByProductId: handleUnaryCall<IdRequest, VersionListResponse>;
  createVersion: handleUnaryCall<CreateVersionRequest, CreateEntityResponse>;
  updateVersion: handleUnaryCall<UpdateVersionRequest, UpdateEntityResponse>;
  deleteVersion: handleUnaryCall<IdRequest, Empty>;
  getVersionDetails: handleUnaryCall<IdRequest, VersionDetailsResponse>;
  increaseVersion: handleUnaryCall<
    IncreaseVersionRequest,
    CreateEntityResponse
  >;
}

export interface CruxProductVersionClient extends Client {
  getVersionsByProductId(
    request: IdRequest,
    callback: (
      error: ServiceError | null,
      response: VersionListResponse
    ) => void
  ): ClientUnaryCall;
  getVersionsByProductId(
    request: IdRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: VersionListResponse
    ) => void
  ): ClientUnaryCall;
  getVersionsByProductId(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: VersionListResponse
    ) => void
  ): ClientUnaryCall;
  createVersion(
    request: CreateVersionRequest,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  createVersion(
    request: CreateVersionRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  createVersion(
    request: CreateVersionRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  updateVersion(
    request: UpdateVersionRequest,
    callback: (
      error: ServiceError | null,
      response: UpdateEntityResponse
    ) => void
  ): ClientUnaryCall;
  updateVersion(
    request: UpdateVersionRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: UpdateEntityResponse
    ) => void
  ): ClientUnaryCall;
  updateVersion(
    request: UpdateVersionRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: UpdateEntityResponse
    ) => void
  ): ClientUnaryCall;
  deleteVersion(
    request: IdRequest,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteVersion(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteVersion(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  getVersionDetails(
    request: IdRequest,
    callback: (
      error: ServiceError | null,
      response: VersionDetailsResponse
    ) => void
  ): ClientUnaryCall;
  getVersionDetails(
    request: IdRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: VersionDetailsResponse
    ) => void
  ): ClientUnaryCall;
  getVersionDetails(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: VersionDetailsResponse
    ) => void
  ): ClientUnaryCall;
  increaseVersion(
    request: IncreaseVersionRequest,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  increaseVersion(
    request: IncreaseVersionRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  increaseVersion(
    request: IncreaseVersionRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
}

export const CruxProductVersionClient = makeGenericClientConstructor(
  CruxProductVersionService,
  "crux.CruxProductVersion"
) as unknown as {
  new (
    address: string,
    credentials: ChannelCredentials,
    options?: Partial<ChannelOptions>
  ): CruxProductVersionClient;
  service: typeof CruxProductVersionService;
};

export type CruxImageService = typeof CruxImageService;
export const CruxImageService = {
  getImagesByVersionId: {
    path: "/crux.CruxImage/GetImagesByVersionId",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: ImageListResponse) =>
      Buffer.from(ImageListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ImageListResponse.decode(value),
  },
  addImagesToVersion: {
    path: "/crux.CruxImage/AddImagesToVersion",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AddImagesToVersionRequest) =>
      Buffer.from(AddImagesToVersionRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) =>
      AddImagesToVersionRequest.decode(value),
    responseSerialize: (value: ImageListResponse) =>
      Buffer.from(ImageListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ImageListResponse.decode(value),
  },
  orderImages: {
    path: "/crux.CruxImage/OrderImages",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: OrderVersionImagesRequest) =>
      Buffer.from(OrderVersionImagesRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) =>
      OrderVersionImagesRequest.decode(value),
    responseSerialize: (value: Empty) =>
      Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  patchImage: {
    path: "/crux.CruxImage/PatchImage",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: PatchImageRequest) =>
      Buffer.from(PatchImageRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => PatchImageRequest.decode(value),
    responseSerialize: (value: Empty) =>
      Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  deleteImage: {
    path: "/crux.CruxImage/DeleteImage",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) =>
      Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  getImageDetails: {
    path: "/crux.CruxImage/GetImageDetails",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: ImageResponse) =>
      Buffer.from(ImageResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ImageResponse.decode(value),
  },
} as const;

export interface CruxImageServer extends UntypedServiceImplementation {
  getImagesByVersionId: handleUnaryCall<IdRequest, ImageListResponse>;
  addImagesToVersion: handleUnaryCall<
    AddImagesToVersionRequest,
    ImageListResponse
  >;
  orderImages: handleUnaryCall<OrderVersionImagesRequest, Empty>;
  patchImage: handleUnaryCall<PatchImageRequest, Empty>;
  deleteImage: handleUnaryCall<IdRequest, Empty>;
  getImageDetails: handleUnaryCall<IdRequest, ImageResponse>;
}

export interface CruxImageClient extends Client {
  getImagesByVersionId(
    request: IdRequest,
    callback: (error: ServiceError | null, response: ImageListResponse) => void
  ): ClientUnaryCall;
  getImagesByVersionId(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ImageListResponse) => void
  ): ClientUnaryCall;
  getImagesByVersionId(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ImageListResponse) => void
  ): ClientUnaryCall;
  addImagesToVersion(
    request: AddImagesToVersionRequest,
    callback: (error: ServiceError | null, response: ImageListResponse) => void
  ): ClientUnaryCall;
  addImagesToVersion(
    request: AddImagesToVersionRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ImageListResponse) => void
  ): ClientUnaryCall;
  addImagesToVersion(
    request: AddImagesToVersionRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ImageListResponse) => void
  ): ClientUnaryCall;
  orderImages(
    request: OrderVersionImagesRequest,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  orderImages(
    request: OrderVersionImagesRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  orderImages(
    request: OrderVersionImagesRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  patchImage(
    request: PatchImageRequest,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  patchImage(
    request: PatchImageRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  patchImage(
    request: PatchImageRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteImage(
    request: IdRequest,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteImage(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteImage(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  getImageDetails(
    request: IdRequest,
    callback: (error: ServiceError | null, response: ImageResponse) => void
  ): ClientUnaryCall;
  getImageDetails(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ImageResponse) => void
  ): ClientUnaryCall;
  getImageDetails(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ImageResponse) => void
  ): ClientUnaryCall;
}

export const CruxImageClient = makeGenericClientConstructor(
  CruxImageService,
  "crux.CruxImage"
) as unknown as {
  new (
    address: string,
    credentials: ChannelCredentials,
    options?: Partial<ChannelOptions>
  ): CruxImageClient;
  service: typeof CruxImageService;
};

export type CruxDeploymentService = typeof CruxDeploymentService;
export const CruxDeploymentService = {
  getDeploymentsByVersionId: {
    path: "/crux.CruxDeployment/GetDeploymentsByVersionId",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: DeploymentListResponse) =>
      Buffer.from(DeploymentListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) =>
      DeploymentListResponse.decode(value),
  },
  createDeployment: {
    path: "/crux.CruxDeployment/CreateDeployment",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateDeploymentRequest) =>
      Buffer.from(CreateDeploymentRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) =>
      CreateDeploymentRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) =>
      Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
  updateDeployment: {
    path: "/crux.CruxDeployment/UpdateDeployment",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateDeploymentRequest) =>
      Buffer.from(UpdateDeploymentRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) =>
      UpdateDeploymentRequest.decode(value),
    responseSerialize: (value: UpdateEntityResponse) =>
      Buffer.from(UpdateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => UpdateEntityResponse.decode(value),
  },
  patchDeployment: {
    path: "/crux.CruxDeployment/PatchDeployment",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: PatchDeploymentRequest) =>
      Buffer.from(PatchDeploymentRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => PatchDeploymentRequest.decode(value),
    responseSerialize: (value: UpdateEntityResponse) =>
      Buffer.from(UpdateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => UpdateEntityResponse.decode(value),
  },
  deleteDeployment: {
    path: "/crux.CruxDeployment/DeleteDeployment",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) =>
      Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  getDeploymentDetails: {
    path: "/crux.CruxDeployment/GetDeploymentDetails",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: DeploymentDetailsResponse) =>
      Buffer.from(DeploymentDetailsResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) =>
      DeploymentDetailsResponse.decode(value),
  },
  getDeploymentEvents: {
    path: "/crux.CruxDeployment/GetDeploymentEvents",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: DeploymentEventListResponse) =>
      Buffer.from(DeploymentEventListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) =>
      DeploymentEventListResponse.decode(value),
  },
  startDeployment: {
    path: "/crux.CruxDeployment/StartDeployment",
    requestStream: false,
    responseStream: true,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: DeploymentProgressMessage) =>
      Buffer.from(DeploymentProgressMessage.encode(value).finish()),
    responseDeserialize: (value: Buffer) =>
      DeploymentProgressMessage.decode(value),
  },
  subscribeToDeploymentEditEvents: {
    path: "/crux.CruxDeployment/SubscribeToDeploymentEditEvents",
    requestStream: false,
    responseStream: true,
    requestSerialize: (value: ServiceIdRequest) =>
      Buffer.from(ServiceIdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => ServiceIdRequest.decode(value),
    responseSerialize: (value: DeploymentEditEventMessage) =>
      Buffer.from(DeploymentEditEventMessage.encode(value).finish()),
    responseDeserialize: (value: Buffer) =>
      DeploymentEditEventMessage.decode(value),
  },
} as const;

export interface CruxDeploymentServer extends UntypedServiceImplementation {
  getDeploymentsByVersionId: handleUnaryCall<IdRequest, DeploymentListResponse>;
  createDeployment: handleUnaryCall<
    CreateDeploymentRequest,
    CreateEntityResponse
  >;
  updateDeployment: handleUnaryCall<
    UpdateDeploymentRequest,
    UpdateEntityResponse
  >;
  patchDeployment: handleUnaryCall<
    PatchDeploymentRequest,
    UpdateEntityResponse
  >;
  deleteDeployment: handleUnaryCall<IdRequest, Empty>;
  getDeploymentDetails: handleUnaryCall<IdRequest, DeploymentDetailsResponse>;
  getDeploymentEvents: handleUnaryCall<IdRequest, DeploymentEventListResponse>;
  startDeployment: handleServerStreamingCall<
    IdRequest,
    DeploymentProgressMessage
  >;
  subscribeToDeploymentEditEvents: handleServerStreamingCall<
    ServiceIdRequest,
    DeploymentEditEventMessage
  >;
}

export interface CruxDeploymentClient extends Client {
  getDeploymentsByVersionId(
    request: IdRequest,
    callback: (
      error: ServiceError | null,
      response: DeploymentListResponse
    ) => void
  ): ClientUnaryCall;
  getDeploymentsByVersionId(
    request: IdRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: DeploymentListResponse
    ) => void
  ): ClientUnaryCall;
  getDeploymentsByVersionId(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: DeploymentListResponse
    ) => void
  ): ClientUnaryCall;
  createDeployment(
    request: CreateDeploymentRequest,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  createDeployment(
    request: CreateDeploymentRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  createDeployment(
    request: CreateDeploymentRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  updateDeployment(
    request: UpdateDeploymentRequest,
    callback: (
      error: ServiceError | null,
      response: UpdateEntityResponse
    ) => void
  ): ClientUnaryCall;
  updateDeployment(
    request: UpdateDeploymentRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: UpdateEntityResponse
    ) => void
  ): ClientUnaryCall;
  updateDeployment(
    request: UpdateDeploymentRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: UpdateEntityResponse
    ) => void
  ): ClientUnaryCall;
  patchDeployment(
    request: PatchDeploymentRequest,
    callback: (
      error: ServiceError | null,
      response: UpdateEntityResponse
    ) => void
  ): ClientUnaryCall;
  patchDeployment(
    request: PatchDeploymentRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: UpdateEntityResponse
    ) => void
  ): ClientUnaryCall;
  patchDeployment(
    request: PatchDeploymentRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: UpdateEntityResponse
    ) => void
  ): ClientUnaryCall;
  deleteDeployment(
    request: IdRequest,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteDeployment(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteDeployment(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  getDeploymentDetails(
    request: IdRequest,
    callback: (
      error: ServiceError | null,
      response: DeploymentDetailsResponse
    ) => void
  ): ClientUnaryCall;
  getDeploymentDetails(
    request: IdRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: DeploymentDetailsResponse
    ) => void
  ): ClientUnaryCall;
  getDeploymentDetails(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: DeploymentDetailsResponse
    ) => void
  ): ClientUnaryCall;
  getDeploymentEvents(
    request: IdRequest,
    callback: (
      error: ServiceError | null,
      response: DeploymentEventListResponse
    ) => void
  ): ClientUnaryCall;
  getDeploymentEvents(
    request: IdRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: DeploymentEventListResponse
    ) => void
  ): ClientUnaryCall;
  getDeploymentEvents(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: DeploymentEventListResponse
    ) => void
  ): ClientUnaryCall;
  startDeployment(
    request: IdRequest,
    options?: Partial<CallOptions>
  ): ClientReadableStream<DeploymentProgressMessage>;
  startDeployment(
    request: IdRequest,
    metadata?: Metadata,
    options?: Partial<CallOptions>
  ): ClientReadableStream<DeploymentProgressMessage>;
  subscribeToDeploymentEditEvents(
    request: ServiceIdRequest,
    options?: Partial<CallOptions>
  ): ClientReadableStream<DeploymentEditEventMessage>;
  subscribeToDeploymentEditEvents(
    request: ServiceIdRequest,
    metadata?: Metadata,
    options?: Partial<CallOptions>
  ): ClientReadableStream<DeploymentEditEventMessage>;
}

export const CruxDeploymentClient = makeGenericClientConstructor(
  CruxDeploymentService,
  "crux.CruxDeployment"
) as unknown as {
  new (
    address: string,
    credentials: ChannelCredentials,
    options?: Partial<ChannelOptions>
  ): CruxDeploymentClient;
  service: typeof CruxDeploymentService;
};

export type CruxTeamService = typeof CruxTeamService;
export const CruxTeamService = {
  createTeam: {
    path: "/crux.CruxTeam/CreateTeam",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateTeamRequest) =>
      Buffer.from(CreateTeamRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateTeamRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) =>
      Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
  getActiveTeamByUser: {
    path: "/crux.CruxTeam/GetActiveTeamByUser",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AccessRequest) =>
      Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
    responseSerialize: (value: TeamDetailsResponse) =>
      Buffer.from(TeamDetailsResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => TeamDetailsResponse.decode(value),
  },
  updateActiveTeam: {
    path: "/crux.CruxTeam/UpdateActiveTeam",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateActiveTeamRequest) =>
      Buffer.from(UpdateActiveTeamRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) =>
      UpdateActiveTeamRequest.decode(value),
    responseSerialize: (value: Empty) =>
      Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  deleteActiveTeam: {
    path: "/crux.CruxTeam/DeleteActiveTeam",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AccessRequest) =>
      Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
    responseSerialize: (value: Empty) =>
      Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  inviteUserToTheActiveTeam: {
    path: "/crux.CruxTeam/InviteUserToTheActiveTeam",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UserInviteRequest) =>
      Buffer.from(UserInviteRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => UserInviteRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) =>
      Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
  deleteUserFromTheActiveTeam: {
    path: "/crux.CruxTeam/DeleteUserFromTheActiveTeam",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) =>
      Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  acceptTeamInvite: {
    path: "/crux.CruxTeam/AcceptTeamInvite",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) =>
      Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  selectTeam: {
    path: "/crux.CruxTeam/SelectTeam",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) =>
      Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) =>
      Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  getUserMeta: {
    path: "/crux.CruxTeam/GetUserMeta",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AccessRequest) =>
      Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
    responseSerialize: (value: UserMetaResponse) =>
      Buffer.from(UserMetaResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => UserMetaResponse.decode(value),
  },
} as const;

export interface CruxTeamServer extends UntypedServiceImplementation {
  createTeam: handleUnaryCall<CreateTeamRequest, CreateEntityResponse>;
  getActiveTeamByUser: handleUnaryCall<AccessRequest, TeamDetailsResponse>;
  updateActiveTeam: handleUnaryCall<UpdateActiveTeamRequest, Empty>;
  deleteActiveTeam: handleUnaryCall<AccessRequest, Empty>;
  inviteUserToTheActiveTeam: handleUnaryCall<
    UserInviteRequest,
    CreateEntityResponse
  >;
  deleteUserFromTheActiveTeam: handleUnaryCall<IdRequest, Empty>;
  acceptTeamInvite: handleUnaryCall<IdRequest, Empty>;
  selectTeam: handleUnaryCall<IdRequest, Empty>;
  getUserMeta: handleUnaryCall<AccessRequest, UserMetaResponse>;
}

export interface CruxTeamClient extends Client {
  createTeam(
    request: CreateTeamRequest,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  createTeam(
    request: CreateTeamRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  createTeam(
    request: CreateTeamRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  getActiveTeamByUser(
    request: AccessRequest,
    callback: (
      error: ServiceError | null,
      response: TeamDetailsResponse
    ) => void
  ): ClientUnaryCall;
  getActiveTeamByUser(
    request: AccessRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: TeamDetailsResponse
    ) => void
  ): ClientUnaryCall;
  getActiveTeamByUser(
    request: AccessRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: TeamDetailsResponse
    ) => void
  ): ClientUnaryCall;
  updateActiveTeam(
    request: UpdateActiveTeamRequest,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  updateActiveTeam(
    request: UpdateActiveTeamRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  updateActiveTeam(
    request: UpdateActiveTeamRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteActiveTeam(
    request: AccessRequest,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteActiveTeam(
    request: AccessRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteActiveTeam(
    request: AccessRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  inviteUserToTheActiveTeam(
    request: UserInviteRequest,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  inviteUserToTheActiveTeam(
    request: UserInviteRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  inviteUserToTheActiveTeam(
    request: UserInviteRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: CreateEntityResponse
    ) => void
  ): ClientUnaryCall;
  deleteUserFromTheActiveTeam(
    request: IdRequest,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteUserFromTheActiveTeam(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  deleteUserFromTheActiveTeam(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  acceptTeamInvite(
    request: IdRequest,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  acceptTeamInvite(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  acceptTeamInvite(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  selectTeam(
    request: IdRequest,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  selectTeam(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  selectTeam(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  getUserMeta(
    request: AccessRequest,
    callback: (error: ServiceError | null, response: UserMetaResponse) => void
  ): ClientUnaryCall;
  getUserMeta(
    request: AccessRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: UserMetaResponse) => void
  ): ClientUnaryCall;
  getUserMeta(
    request: AccessRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: UserMetaResponse) => void
  ): ClientUnaryCall;
}

export const CruxTeamClient = makeGenericClientConstructor(
  CruxTeamService,
  "crux.CruxTeam"
) as unknown as {
  new (
    address: string,
    credentials: ChannelCredentials,
    options?: Partial<ChannelOptions>
  ): CruxTeamClient;
  service: typeof CruxTeamService;
};

export type CruxAuditService = typeof CruxAuditService;
export const CruxAuditService = {
  getAuditLog: {
    path: "/crux.CruxAudit/GetAuditLog",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AccessRequest) =>
      Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
    responseSerialize: (value: AuditLogListResponse) =>
      Buffer.from(AuditLogListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => AuditLogListResponse.decode(value),
  },
} as const;

export interface CruxAuditServer extends UntypedServiceImplementation {
  getAuditLog: handleUnaryCall<AccessRequest, AuditLogListResponse>;
}

export interface CruxAuditClient extends Client {
  getAuditLog(
    request: AccessRequest,
    callback: (
      error: ServiceError | null,
      response: AuditLogListResponse
    ) => void
  ): ClientUnaryCall;
  getAuditLog(
    request: AccessRequest,
    metadata: Metadata,
    callback: (
      error: ServiceError | null,
      response: AuditLogListResponse
    ) => void
  ): ClientUnaryCall;
  getAuditLog(
    request: AccessRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (
      error: ServiceError | null,
      response: AuditLogListResponse
    ) => void
  ): ClientUnaryCall;
}

export const CruxAuditClient = makeGenericClientConstructor(
  CruxAuditService,
  "crux.CruxAudit"
) as unknown as {
  new (
    address: string,
    credentials: ChannelCredentials,
    options?: Partial<ChannelOptions>
  ): CruxAuditClient;
  service: typeof CruxAuditService;
};

export type CruxHealthService = typeof CruxHealthService;
export const CruxHealthService = {
  getHealth: {
    path: "/crux.CruxHealth/getHealth",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: Empty) =>
      Buffer.from(Empty.encode(value).finish()),
    requestDeserialize: (value: Buffer) => Empty.decode(value),
    responseSerialize: (value: Empty) =>
      Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
} as const;

export interface CruxHealthServer extends UntypedServiceImplementation {
  getHealth: handleUnaryCall<Empty, Empty>;
}

export interface CruxHealthClient extends Client {
  getHealth(
    request: Empty,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  getHealth(
    request: Empty,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
  getHealth(
    request: Empty,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void
  ): ClientUnaryCall;
}

export const CruxHealthClient = makeGenericClientConstructor(
  CruxHealthService,
  "crux.CruxHealth"
) as unknown as {
  new (
    address: string,
    credentials: ChannelCredentials,
    options?: Partial<ChannelOptions>
  ): CruxHealthClient;
  service: typeof CruxHealthService;
};

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  throw "Unable to locate global object";
})();

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<
        Exclude<keyof I, KeysOfUnion<P>>,
        never
      >;

function toTimestamp(date: Date): Timestamp {
  const seconds = date.getTime() / 1_000;
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = t.seconds * 1_000;
  millis += t.nanos / 1_000_000;
  return new Date(millis);
}

function fromJsonTimestamp(o: any): Timestamp {
  if (o instanceof Date) {
    return toTimestamp(o);
  } else if (typeof o === "string") {
    return toTimestamp(new Date(o));
  } else {
    return Timestamp.fromJSON(o);
  }
}

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
