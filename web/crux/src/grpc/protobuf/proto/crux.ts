/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { Timestamp } from "../../google/protobuf/timestamp";
import { Metadata } from "@grpc/grpc-js";

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

export const CRUX_PACKAGE_NAME = "crux";

function createBaseEmpty(): Empty {
  return {};
}

export const Empty = {
  fromJSON(_: any): Empty {
    return {};
  },

  toJSON(_: Empty): unknown {
    const obj: any = {};
    return obj;
  },
};

function createBaseServiceIdRequest(): ServiceIdRequest {
  return { id: "" };
}

export const ServiceIdRequest = {
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
};

function createBaseIdRequest(): IdRequest {
  return { id: "", accessedBy: "" };
}

export const IdRequest = {
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
};

function createBaseCreateEntityResponse(): CreateEntityResponse {
  return { id: "", createdAt: undefined };
}

export const CreateEntityResponse = {
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
};

function createBaseUpdateEntityResponse(): UpdateEntityResponse {
  return { updatedAt: undefined };
}

export const UpdateEntityResponse = {
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
};

function createBaseAuditLogListResponse(): AuditLogListResponse {
  return { data: [] };
}

export const AuditLogListResponse = {
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
};

function createBaseCreateTeamRequest(): CreateTeamRequest {
  return { accessedBy: "", name: "" };
}

export const CreateTeamRequest = {
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
};

function createBaseUpdateActiveTeamRequest(): UpdateActiveTeamRequest {
  return { accessedBy: "", name: "" };
}

export const UpdateActiveTeamRequest = {
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
};

function createBaseUserInviteRequest(): UserInviteRequest {
  return { accessedBy: "", email: "" };
}

export const UserInviteRequest = {
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
};

function createBaseAccessRequest(): AccessRequest {
  return { accessedBy: "" };
}

export const AccessRequest = {
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
};

function createBaseUserMetaResponse(): UserMetaResponse {
  return { user: undefined, teams: [], invitations: [] };
}

export const UserMetaResponse = {
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
};

function createBaseActiveTeamUser(): ActiveTeamUser {
  return { activeTeamId: "", role: 0, status: 0 };
}

export const ActiveTeamUser = {
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
};

function createBaseTeamResponse(): TeamResponse {
  return { id: "", name: "" };
}

export const TeamResponse = {
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
};

function createBaseTeamDetailsResponse(): TeamDetailsResponse {
  return { id: "", name: "", users: [] };
}

export const TeamDetailsResponse = {
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
};

function createBaseUserResponse(): UserResponse {
  return { id: "", name: "", email: "", role: 0, status: 0 };
}

export const UserResponse = {
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
};

function createBaseProductListResponse(): ProductListResponse {
  return { data: [] };
}

export const ProductListResponse = {
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
};

function createBaseCreateProductRequest(): CreateProductRequest {
  return { accessedBy: "", name: "", description: undefined, type: 0 };
}

export const CreateProductRequest = {
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
};

function createBaseRegistryListResponse(): RegistryListResponse {
  return { data: [] };
}

export const RegistryListResponse = {
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
};

function createBaseVersionListResponse(): VersionListResponse {
  return { data: [] };
}

export const VersionListResponse = {
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
};

function createBaseIncreaseVersionRequest(): IncreaseVersionRequest {
  return { id: "", accessedBy: "", name: "", changelog: undefined };
}

export const IncreaseVersionRequest = {
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
};

function createBaseExplicitContainerConfig_Port(): ExplicitContainerConfig_Port {
  return { internal: 0, external: 0 };
}

export const ExplicitContainerConfig_Port = {
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
};

function createBaseExplicitContainerConfig_Expose(): ExplicitContainerConfig_Expose {
  return { public: false, tls: false };
}

export const ExplicitContainerConfig_Expose = {
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
};

function createBaseContainerConfig(): ContainerConfig {
  return { config: undefined, capabilities: [], environment: [] };
}

export const ContainerConfig = {
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
};

function createBaseImageListResponse(): ImageListResponse {
  return { data: [] };
}

export const ImageListResponse = {
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
};

function createBaseOrderVersionImagesRequest(): OrderVersionImagesRequest {
  return { accessedBy: "", versionId: "", imageIds: [] };
}

export const OrderVersionImagesRequest = {
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
};

function createBaseAddImagesToVersionRequest(): AddImagesToVersionRequest {
  return { accessedBy: "", versionId: "", registryId: "", imageIds: [] };
}

export const AddImagesToVersionRequest = {
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
};

function createBaseUniqueKeyValue(): UniqueKeyValue {
  return { id: "", key: "", value: "" };
}

export const UniqueKeyValue = {
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
};

function createBaseKeyValueList(): KeyValueList {
  return { data: [] };
}

export const KeyValueList = {
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
};

function createBasePatchContainerConfig(): PatchContainerConfig {
  return { capabilities: undefined, environment: undefined, config: undefined };
}

export const PatchContainerConfig = {
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
};

function createBaseNodeListResponse(): NodeListResponse {
  return { data: [] };
}

export const NodeListResponse = {
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
};

function createBaseCreateNodeRequest(): CreateNodeRequest {
  return { accessedBy: "", name: "", description: undefined, icon: undefined };
}

export const CreateNodeRequest = {
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
};

function createBaseNodeInstallResponse(): NodeInstallResponse {
  return { command: "", expireAt: undefined };
}

export const NodeInstallResponse = {
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
};

function createBaseNodeScriptResponse(): NodeScriptResponse {
  return { content: "" };
}

export const NodeScriptResponse = {
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
};

function createBaseNodeEventMessage(): NodeEventMessage {
  return { id: "", status: 0, address: undefined };
}

export const NodeEventMessage = {
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
};

function createBaseWatchContainerStatusRequest(): WatchContainerStatusRequest {
  return { accessedBy: "", nodeId: "", prefix: undefined };
}

export const WatchContainerStatusRequest = {
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
};

function createBaseContainerPort(): ContainerPort {
  return { internal: 0, external: 0 };
}

export const ContainerPort = {
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
};

function createBaseContainerStatusListMessage(): ContainerStatusListMessage {
  return { prefix: undefined, data: [] };
}

export const ContainerStatusListMessage = {
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
};

function createBaseInstanceDeploymentItem(): InstanceDeploymentItem {
  return { instanceId: "", status: 0 };
}

export const InstanceDeploymentItem = {
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
};

function createBaseDeploymentStatusMessage(): DeploymentStatusMessage {
  return { instance: undefined, deploymentStatus: undefined, log: [] };
}

export const DeploymentStatusMessage = {
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
};

function createBaseDeploymentProgressMessage(): DeploymentProgressMessage {
  return { id: "", status: undefined, instance: undefined, log: [] };
}

export const DeploymentProgressMessage = {
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
};

function createBaseInstancesCreatedEventList(): InstancesCreatedEventList {
  return { data: [] };
}

export const InstancesCreatedEventList = {
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
};

function createBaseDeploymentEditEventMessage(): DeploymentEditEventMessage {
  return { instancesCreated: undefined, imageIdDeleted: undefined };
}

export const DeploymentEditEventMessage = {
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
};

function createBaseCreateDeploymentRequest(): CreateDeploymentRequest {
  return { accessedBy: "", versionId: "", nodeId: "" };
}

export const CreateDeploymentRequest = {
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
};

function createBaseDeploymentListResponse(): DeploymentListResponse {
  return { data: [] };
}

export const DeploymentListResponse = {
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
};

function createBaseDeploymentEventContainerStatus(): DeploymentEventContainerStatus {
  return { instanceId: "", status: 0 };
}

export const DeploymentEventContainerStatus = {
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
};

function createBaseDeploymentEventLog(): DeploymentEventLog {
  return { log: [] };
}

export const DeploymentEventLog = {
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
};

function createBaseDeploymentEventListResponse(): DeploymentEventListResponse {
  return { data: [] };
}

export const DeploymentEventListResponse = {
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
};

/** Services */

export interface CruxProductClient {
  /** CRUD */

  getProducts(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<ProductListResponse>;

  createProduct(
    request: CreateProductRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<CreateEntityResponse>;

  updateProduct(
    request: UpdateProductRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<UpdateEntityResponse>;

  deleteProduct(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<Empty>;

  getProductDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<ProductDetailsReponse>;
}

/** Services */

export interface CruxProductController {
  /** CRUD */

  getProducts(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<ProductListResponse>
    | Observable<ProductListResponse>
    | ProductListResponse;

  createProduct(
    request: CreateProductRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<CreateEntityResponse>
    | Observable<CreateEntityResponse>
    | CreateEntityResponse;

  updateProduct(
    request: UpdateProductRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<UpdateEntityResponse>
    | Observable<UpdateEntityResponse>
    | UpdateEntityResponse;

  deleteProduct(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty;

  getProductDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<ProductDetailsReponse>
    | Observable<ProductDetailsReponse>
    | ProductDetailsReponse;
}

export function CruxProductControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "getProducts",
      "createProduct",
      "updateProduct",
      "deleteProduct",
      "getProductDetails",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcMethod("CruxProduct", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcStreamMethod("CruxProduct", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
  };
}

export const CRUX_PRODUCT_SERVICE_NAME = "CruxProduct";

export interface CruxRegistryClient {
  /** CRUD */

  getRegistries(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<RegistryListResponse>;

  createRegistry(
    request: CreateRegistryRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<CreateEntityResponse>;

  updateRegistry(
    request: UpdateRegistryRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<UpdateEntityResponse>;

  deleteRegistry(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<Empty>;

  getRegistryDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<RegistryDetailsResponse>;
}

export interface CruxRegistryController {
  /** CRUD */

  getRegistries(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<RegistryListResponse>
    | Observable<RegistryListResponse>
    | RegistryListResponse;

  createRegistry(
    request: CreateRegistryRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<CreateEntityResponse>
    | Observable<CreateEntityResponse>
    | CreateEntityResponse;

  updateRegistry(
    request: UpdateRegistryRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<UpdateEntityResponse>
    | Observable<UpdateEntityResponse>
    | UpdateEntityResponse;

  deleteRegistry(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty;

  getRegistryDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<RegistryDetailsResponse>
    | Observable<RegistryDetailsResponse>
    | RegistryDetailsResponse;
}

export function CruxRegistryControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "getRegistries",
      "createRegistry",
      "updateRegistry",
      "deleteRegistry",
      "getRegistryDetails",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcMethod("CruxRegistry", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcStreamMethod("CruxRegistry", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
  };
}

export const CRUX_REGISTRY_SERVICE_NAME = "CruxRegistry";

export interface CruxNodeClient {
  /** CRUD */

  getNodes(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<NodeListResponse>;

  createNode(
    request: CreateNodeRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<CreateEntityResponse>;

  updateNode(
    request: UpdateNodeRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<Empty>;

  deleteNode(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<Empty>;

  getNodeDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<NodeDetailsResponse>;

  generateScript(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<NodeInstallResponse>;

  getScript(
    request: ServiceIdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<NodeScriptResponse>;

  discardScript(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<Empty>;

  revokeToken(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<Empty>;

  subscribeNodeEventChannel(
    request: ServiceIdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<NodeEventMessage>;

  watchContainerStatus(
    request: WatchContainerStatusRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<ContainerStatusListMessage>;
}

export interface CruxNodeController {
  /** CRUD */

  getNodes(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<NodeListResponse>
    | Observable<NodeListResponse>
    | NodeListResponse;

  createNode(
    request: CreateNodeRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<CreateEntityResponse>
    | Observable<CreateEntityResponse>
    | CreateEntityResponse;

  updateNode(
    request: UpdateNodeRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty;

  deleteNode(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty;

  getNodeDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<NodeDetailsResponse>
    | Observable<NodeDetailsResponse>
    | NodeDetailsResponse;

  generateScript(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<NodeInstallResponse>
    | Observable<NodeInstallResponse>
    | NodeInstallResponse;

  getScript(
    request: ServiceIdRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<NodeScriptResponse>
    | Observable<NodeScriptResponse>
    | NodeScriptResponse;

  discardScript(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty;

  revokeToken(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty;

  subscribeNodeEventChannel(
    request: ServiceIdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<NodeEventMessage>;

  watchContainerStatus(
    request: WatchContainerStatusRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<ContainerStatusListMessage>;
}

export function CruxNodeControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "getNodes",
      "createNode",
      "updateNode",
      "deleteNode",
      "getNodeDetails",
      "generateScript",
      "getScript",
      "discardScript",
      "revokeToken",
      "subscribeNodeEventChannel",
      "watchContainerStatus",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcMethod("CruxNode", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcStreamMethod("CruxNode", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
  };
}

export const CRUX_NODE_SERVICE_NAME = "CruxNode";

export interface CruxProductVersionClient {
  getVersionsByProductId(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<VersionListResponse>;

  createVersion(
    request: CreateVersionRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<CreateEntityResponse>;

  updateVersion(
    request: UpdateVersionRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<UpdateEntityResponse>;

  deleteVersion(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<Empty>;

  getVersionDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<VersionDetailsResponse>;

  increaseVersion(
    request: IncreaseVersionRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<CreateEntityResponse>;
}

export interface CruxProductVersionController {
  getVersionsByProductId(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<VersionListResponse>
    | Observable<VersionListResponse>
    | VersionListResponse;

  createVersion(
    request: CreateVersionRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<CreateEntityResponse>
    | Observable<CreateEntityResponse>
    | CreateEntityResponse;

  updateVersion(
    request: UpdateVersionRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<UpdateEntityResponse>
    | Observable<UpdateEntityResponse>
    | UpdateEntityResponse;

  deleteVersion(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty;

  getVersionDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<VersionDetailsResponse>
    | Observable<VersionDetailsResponse>
    | VersionDetailsResponse;

  increaseVersion(
    request: IncreaseVersionRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<CreateEntityResponse>
    | Observable<CreateEntityResponse>
    | CreateEntityResponse;
}

export function CruxProductVersionControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "getVersionsByProductId",
      "createVersion",
      "updateVersion",
      "deleteVersion",
      "getVersionDetails",
      "increaseVersion",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcMethod("CruxProductVersion", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcStreamMethod("CruxProductVersion", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
  };
}

export const CRUX_PRODUCT_VERSION_SERVICE_NAME = "CruxProductVersion";

export interface CruxImageClient {
  getImagesByVersionId(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<ImageListResponse>;

  addImagesToVersion(
    request: AddImagesToVersionRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<ImageListResponse>;

  orderImages(
    request: OrderVersionImagesRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<Empty>;

  patchImage(
    request: PatchImageRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<Empty>;

  deleteImage(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<Empty>;

  getImageDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<ImageResponse>;
}

export interface CruxImageController {
  getImagesByVersionId(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<ImageListResponse>
    | Observable<ImageListResponse>
    | ImageListResponse;

  addImagesToVersion(
    request: AddImagesToVersionRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<ImageListResponse>
    | Observable<ImageListResponse>
    | ImageListResponse;

  orderImages(
    request: OrderVersionImagesRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty;

  patchImage(
    request: PatchImageRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty;

  deleteImage(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty;

  getImageDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<ImageResponse> | Observable<ImageResponse> | ImageResponse;
}

export function CruxImageControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "getImagesByVersionId",
      "addImagesToVersion",
      "orderImages",
      "patchImage",
      "deleteImage",
      "getImageDetails",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcMethod("CruxImage", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcStreamMethod("CruxImage", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
  };
}

export const CRUX_IMAGE_SERVICE_NAME = "CruxImage";

export interface CruxDeploymentClient {
  getDeploymentsByVersionId(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<DeploymentListResponse>;

  createDeployment(
    request: CreateDeploymentRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<CreateEntityResponse>;

  updateDeployment(
    request: UpdateDeploymentRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<UpdateEntityResponse>;

  patchDeployment(
    request: PatchDeploymentRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<UpdateEntityResponse>;

  deleteDeployment(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<Empty>;

  getDeploymentDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<DeploymentDetailsResponse>;

  getDeploymentEvents(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<DeploymentEventListResponse>;

  startDeployment(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<DeploymentProgressMessage>;

  subscribeToDeploymentEditEvents(
    request: ServiceIdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<DeploymentEditEventMessage>;
}

export interface CruxDeploymentController {
  getDeploymentsByVersionId(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<DeploymentListResponse>
    | Observable<DeploymentListResponse>
    | DeploymentListResponse;

  createDeployment(
    request: CreateDeploymentRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<CreateEntityResponse>
    | Observable<CreateEntityResponse>
    | CreateEntityResponse;

  updateDeployment(
    request: UpdateDeploymentRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<UpdateEntityResponse>
    | Observable<UpdateEntityResponse>
    | UpdateEntityResponse;

  patchDeployment(
    request: PatchDeploymentRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<UpdateEntityResponse>
    | Observable<UpdateEntityResponse>
    | UpdateEntityResponse;

  deleteDeployment(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty;

  getDeploymentDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<DeploymentDetailsResponse>
    | Observable<DeploymentDetailsResponse>
    | DeploymentDetailsResponse;

  getDeploymentEvents(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<DeploymentEventListResponse>
    | Observable<DeploymentEventListResponse>
    | DeploymentEventListResponse;

  startDeployment(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<DeploymentProgressMessage>;

  subscribeToDeploymentEditEvents(
    request: ServiceIdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<DeploymentEditEventMessage>;
}

export function CruxDeploymentControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "getDeploymentsByVersionId",
      "createDeployment",
      "updateDeployment",
      "patchDeployment",
      "deleteDeployment",
      "getDeploymentDetails",
      "getDeploymentEvents",
      "startDeployment",
      "subscribeToDeploymentEditEvents",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcMethod("CruxDeployment", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcStreamMethod("CruxDeployment", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
  };
}

export const CRUX_DEPLOYMENT_SERVICE_NAME = "CruxDeployment";

export interface CruxTeamClient {
  createTeam(
    request: CreateTeamRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<CreateEntityResponse>;

  getActiveTeamByUser(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<TeamDetailsResponse>;

  updateActiveTeam(
    request: UpdateActiveTeamRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<Empty>;

  deleteActiveTeam(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<Empty>;

  inviteUserToTheActiveTeam(
    request: UserInviteRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<CreateEntityResponse>;

  deleteUserFromTheActiveTeam(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<Empty>;

  acceptTeamInvite(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<Empty>;

  selectTeam(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<Empty>;

  getUserMeta(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<UserMetaResponse>;
}

export interface CruxTeamController {
  createTeam(
    request: CreateTeamRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<CreateEntityResponse>
    | Observable<CreateEntityResponse>
    | CreateEntityResponse;

  getActiveTeamByUser(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<TeamDetailsResponse>
    | Observable<TeamDetailsResponse>
    | TeamDetailsResponse;

  updateActiveTeam(
    request: UpdateActiveTeamRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty;

  deleteActiveTeam(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty;

  inviteUserToTheActiveTeam(
    request: UserInviteRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<CreateEntityResponse>
    | Observable<CreateEntityResponse>
    | CreateEntityResponse;

  deleteUserFromTheActiveTeam(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty;

  acceptTeamInvite(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty;

  selectTeam(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty;

  getUserMeta(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<UserMetaResponse>
    | Observable<UserMetaResponse>
    | UserMetaResponse;
}

export function CruxTeamControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "createTeam",
      "getActiveTeamByUser",
      "updateActiveTeam",
      "deleteActiveTeam",
      "inviteUserToTheActiveTeam",
      "deleteUserFromTheActiveTeam",
      "acceptTeamInvite",
      "selectTeam",
      "getUserMeta",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcMethod("CruxTeam", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcStreamMethod("CruxTeam", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
  };
}

export const CRUX_TEAM_SERVICE_NAME = "CruxTeam";

export interface CruxAuditClient {
  getAuditLog(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<AuditLogListResponse>;
}

export interface CruxAuditController {
  getAuditLog(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ):
    | Promise<AuditLogListResponse>
    | Observable<AuditLogListResponse>
    | AuditLogListResponse;
}

export function CruxAuditControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getAuditLog"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcMethod("CruxAudit", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcStreamMethod("CruxAudit", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
  };
}

export const CRUX_AUDIT_SERVICE_NAME = "CruxAudit";

export interface CruxHealthClient {
  getHealth(
    request: Empty,
    metadata: Metadata,
    ...rest: any
  ): Observable<Empty>;
}

export interface CruxHealthController {
  getHealth(
    request: Empty,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty;
}

export function CruxHealthControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getHealth"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcMethod("CruxHealth", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcStreamMethod("CruxHealth", method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
  };
}

export const CRUX_HEALTH_SERVICE_NAME = "CruxHealth";

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

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
