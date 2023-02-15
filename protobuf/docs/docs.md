# Protocol Documentation
<a name="top"></a>

## Table of Contents

- [proto/agent.proto](#proto/agent.proto)
    - [AgentCommand](#agent.AgentCommand)
    - [AgentInfo](#agent.AgentInfo)
    - [ContainerStatusRequest](#agent.ContainerStatusRequest)
    - [DeployRequest](#agent.DeployRequest)
    - [DeployRequest.ContainerConfig](#agent.DeployRequest.ContainerConfig)
    - [DeployRequest.ContainerConfig.ConfigContainer](#agent.DeployRequest.ContainerConfig.ConfigContainer)
    - [DeployRequest.ContainerConfig.Expose](#agent.DeployRequest.ContainerConfig.Expose)
    - [DeployRequest.ContainerConfig.Port](#agent.DeployRequest.ContainerConfig.Port)
    - [DeployRequest.InstanceConfig](#agent.DeployRequest.InstanceConfig)
    - [DeployRequest.InstanceConfig.Environment](#agent.DeployRequest.InstanceConfig.Environment)
    - [DeployRequest.RegistryAuth](#agent.DeployRequest.RegistryAuth)
    - [DeployResponse](#agent.DeployResponse)
    - [Empty](#agent.Empty)
    - [VersionDeployRequest](#agent.VersionDeployRequest)
  
    - [DeployRequest.ContainerConfig.RuntimeConfigType](#agent.DeployRequest.ContainerConfig.RuntimeConfigType)
  
    - [Agent](#agent.Agent)
  
- [proto/crux.proto](#proto/crux.proto)
    - [AccessRequest](#crux.AccessRequest)
    - [ActiveTeamUser](#crux.ActiveTeamUser)
    - [AddImagesToVersionRequest](#crux.AddImagesToVersionRequest)
    - [AuditLogListResponse](#crux.AuditLogListResponse)
    - [AuditLogResponse](#crux.AuditLogResponse)
    - [AuditResponse](#crux.AuditResponse)
    - [ContainerConfig](#crux.ContainerConfig)
    - [ContainerPort](#crux.ContainerPort)
    - [ContainerStatusItem](#crux.ContainerStatusItem)
    - [ContainerStatusListMessage](#crux.ContainerStatusListMessage)
    - [CreateDeploymentRequest](#crux.CreateDeploymentRequest)
    - [CreateEntityResponse](#crux.CreateEntityResponse)
    - [CreateNodeRequest](#crux.CreateNodeRequest)
    - [CreateProductRequest](#crux.CreateProductRequest)
    - [CreateRegistryRequest](#crux.CreateRegistryRequest)
    - [CreateTeamRequest](#crux.CreateTeamRequest)
    - [CreateVersionRequest](#crux.CreateVersionRequest)
    - [DeploymentDetailsResponse](#crux.DeploymentDetailsResponse)
    - [DeploymentEditEventMessage](#crux.DeploymentEditEventMessage)
    - [DeploymentEventContainerStatus](#crux.DeploymentEventContainerStatus)
    - [DeploymentEventListResponse](#crux.DeploymentEventListResponse)
    - [DeploymentEventLog](#crux.DeploymentEventLog)
    - [DeploymentEventResponse](#crux.DeploymentEventResponse)
    - [DeploymentListResponse](#crux.DeploymentListResponse)
    - [DeploymentProgressMessage](#crux.DeploymentProgressMessage)
    - [DeploymentResponse](#crux.DeploymentResponse)
    - [DeploymentStatusMessage](#crux.DeploymentStatusMessage)
    - [Empty](#crux.Empty)
    - [ExplicitContainerConfig](#crux.ExplicitContainerConfig)
    - [ExplicitContainerConfig.Expose](#crux.ExplicitContainerConfig.Expose)
    - [ExplicitContainerConfig.Port](#crux.ExplicitContainerConfig.Port)
    - [IdRequest](#crux.IdRequest)
    - [ImageListResponse](#crux.ImageListResponse)
    - [ImageResponse](#crux.ImageResponse)
    - [IncreaseVersionRequest](#crux.IncreaseVersionRequest)
    - [InstanceDeploymentItem](#crux.InstanceDeploymentItem)
    - [InstanceResponse](#crux.InstanceResponse)
    - [InstancesCreatedEventList](#crux.InstancesCreatedEventList)
    - [KeyValueList](#crux.KeyValueList)
    - [NodeDetailsResponse](#crux.NodeDetailsResponse)
    - [NodeEventMessage](#crux.NodeEventMessage)
    - [NodeInstallResponse](#crux.NodeInstallResponse)
    - [NodeListResponse](#crux.NodeListResponse)
    - [NodeResponse](#crux.NodeResponse)
    - [NodeScriptResponse](#crux.NodeScriptResponse)
    - [OrderVersionImagesRequest](#crux.OrderVersionImagesRequest)
    - [PatchContainerConfig](#crux.PatchContainerConfig)
    - [PatchDeploymentRequest](#crux.PatchDeploymentRequest)
    - [PatchImageRequest](#crux.PatchImageRequest)
    - [PatchInstanceRequest](#crux.PatchInstanceRequest)
    - [ProductDetailsReponse](#crux.ProductDetailsReponse)
    - [ProductListResponse](#crux.ProductListResponse)
    - [ProductReponse](#crux.ProductReponse)
    - [RegistryDetailsResponse](#crux.RegistryDetailsResponse)
    - [RegistryListResponse](#crux.RegistryListResponse)
    - [RegistryResponse](#crux.RegistryResponse)
    - [ServiceIdRequest](#crux.ServiceIdRequest)
    - [TeamDetailsResponse](#crux.TeamDetailsResponse)
    - [TeamResponse](#crux.TeamResponse)
    - [UniqueKeyValue](#crux.UniqueKeyValue)
    - [UpdateActiveTeamRequest](#crux.UpdateActiveTeamRequest)
    - [UpdateDeploymentRequest](#crux.UpdateDeploymentRequest)
    - [UpdateEntityResponse](#crux.UpdateEntityResponse)
    - [UpdateNodeRequest](#crux.UpdateNodeRequest)
    - [UpdateProductRequest](#crux.UpdateProductRequest)
    - [UpdateRegistryRequest](#crux.UpdateRegistryRequest)
    - [UpdateVersionRequest](#crux.UpdateVersionRequest)
    - [UserInviteRequest](#crux.UserInviteRequest)
    - [UserMetaResponse](#crux.UserMetaResponse)
    - [UserResponse](#crux.UserResponse)
    - [VersionDetailsResponse](#crux.VersionDetailsResponse)
    - [VersionListResponse](#crux.VersionListResponse)
    - [VersionResponse](#crux.VersionResponse)
    - [WatchContainerStatusRequest](#crux.WatchContainerStatusRequest)
  
    - [ContainerStatus](#crux.ContainerStatus)
    - [DeploymentEventType](#crux.DeploymentEventType)
    - [DeploymentStatus](#crux.DeploymentStatus)
    - [ExplicitContainerConfig.NetworkMode](#crux.ExplicitContainerConfig.NetworkMode)
    - [NodeConnectionStatus](#crux.NodeConnectionStatus)
    - [ProductType](#crux.ProductType)
    - [RegistryType](#crux.RegistryType)
    - [UserRole](#crux.UserRole)
    - [UserStatus](#crux.UserStatus)
    - [VersionType](#crux.VersionType)
  
    - [CruxAudit](#crux.CruxAudit)
    - [CruxDeployment](#crux.CruxDeployment)
    - [CruxHealth](#crux.CruxHealth)
    - [CruxImage](#crux.CruxImage)
    - [CruxNode](#crux.CruxNode)
    - [CruxProduct](#crux.CruxProduct)
    - [CruxProductVersion](#crux.CruxProductVersion)
    - [CruxRegistry](#crux.CruxRegistry)
    - [CruxTeam](#crux.CruxTeam)
  
- [Scalar Value Types](#scalar-value-types)



<a name="proto/agent.proto"></a>
<p align="right"><a href="#top">Top</a></p>

## proto/agent.proto
Container agent interface messages and service definitions
Logs, statuses, deployments


<a name="agent.AgentCommand"></a>

### AgentCommand



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| deploy | [VersionDeployRequest](#agent.VersionDeployRequest) |  |  |
| containerStatus | [ContainerStatusRequest](#agent.ContainerStatusRequest) |  |  |






<a name="agent.AgentInfo"></a>

### AgentInfo



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |






<a name="agent.ContainerStatusRequest"></a>

### ContainerStatusRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| prefix | [string](#string) | optional |  |






<a name="agent.DeployRequest"></a>

### DeployRequest
Deploys a single container


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| instanceConfig | [DeployRequest.InstanceConfig](#agent.DeployRequest.InstanceConfig) |  | InstanceConfig is set for multiple containers |
| containerConfig | [DeployRequest.ContainerConfig](#agent.DeployRequest.ContainerConfig) |  | Runtime info and requirements of a container |
| runtimeConfig | [string](#string) | optional |  |
| registry | [string](#string) | optional |  |
| imageName | [string](#string) |  |  |
| tag | [string](#string) |  |  |
| registryAuth | [DeployRequest.RegistryAuth](#agent.DeployRequest.RegistryAuth) | optional |  |






<a name="agent.DeployRequest.ContainerConfig"></a>

### DeployRequest.ContainerConfig



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| name | [string](#string) |  | Container name - must have, used by everthing |
| prefix | [string](#string) | optional | Container prefix |
| ports | [DeployRequest.ContainerConfig.Port](#agent.DeployRequest.ContainerConfig.Port) | repeated | container ports |
| mounts | [string](#string) | repeated | volume mounts in a piped format |
| environments | [string](#string) | repeated | environment variables in a piped format |
| networkMode | [string](#string) | optional | could be enum, i&#39;m not sure if it is in use |
| runtimeConfigType | [DeployRequest.ContainerConfig.RuntimeConfigType](#agent.DeployRequest.ContainerConfig.RuntimeConfigType) | optional | runtime config type if given, magic can happen |
| expose | [DeployRequest.ContainerConfig.Expose](#agent.DeployRequest.ContainerConfig.Expose) | optional | exposure configuration |
| configContainer | [DeployRequest.ContainerConfig.ConfigContainer](#agent.DeployRequest.ContainerConfig.ConfigContainer) | optional | Config container is started before the container and contents are copied to the volume set |
| user | [int64](#int64) |  | userId that is used to run the container, number |






<a name="agent.DeployRequest.ContainerConfig.ConfigContainer"></a>

### DeployRequest.ContainerConfig.ConfigContainer



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| image | [string](#string) |  |  |
| volume | [string](#string) |  |  |
| path | [string](#string) |  |  |
| keepFiles | [bool](#bool) |  |  |






<a name="agent.DeployRequest.ContainerConfig.Expose"></a>

### DeployRequest.ContainerConfig.Expose



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public | [bool](#bool) |  | if expose is needed |
| tls | [bool](#bool) |  | if tls is needed |






<a name="agent.DeployRequest.ContainerConfig.Port"></a>

### DeployRequest.ContainerConfig.Port



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| internal | [int32](#int32) |  | internal that is bound by the container |
| external | [int32](#int32) |  | external is docker only |






<a name="agent.DeployRequest.InstanceConfig"></a>

### DeployRequest.InstanceConfig



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| prefix | [string](#string) |  | containerPreName, mapped into host folder structure, used as namespace id |
| mountPath | [string](#string) | optional | mount path of instance (docker only) |
| environment | [DeployRequest.InstanceConfig.Environment](#agent.DeployRequest.InstanceConfig.Environment) | optional | environment variable map (piped) |
| repositoryPrefix | [string](#string) | optional | registry repo prefix |






<a name="agent.DeployRequest.InstanceConfig.Environment"></a>

### DeployRequest.InstanceConfig.Environment



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| env | [string](#string) | repeated |  |






<a name="agent.DeployRequest.RegistryAuth"></a>

### DeployRequest.RegistryAuth



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| name | [string](#string) |  |  |
| url | [string](#string) |  |  |
| user | [string](#string) |  |  |
| password | [string](#string) |  |  |






<a name="agent.DeployResponse"></a>

### DeployResponse
This is more of a placeholder, we could include more, or return this
instantly after validation success.


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| started | [bool](#bool) |  |  |






<a name="agent.Empty"></a>

### Empty







<a name="agent.VersionDeployRequest"></a>

### VersionDeployRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| versionName | [string](#string) |  |  |
| releaseNotes | [string](#string) |  |  |
| requests | [DeployRequest](#agent.DeployRequest) | repeated |  |





 


<a name="agent.DeployRequest.ContainerConfig.RuntimeConfigType"></a>

### DeployRequest.ContainerConfig.RuntimeConfigType


| Name | Number | Description |
| ---- | ------ | ----------- |
| DOTNET_APPCONFIG | 0 | appconfig will be parsed into environment variables |


 

 


<a name="agent.Agent"></a>

### Agent
Service handling deployment of containers and fetching statuses

| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| Connect | [AgentInfo](#agent.AgentInfo) | [AgentCommand](#agent.AgentCommand) stream | Subscribe with pre-assigned AgentID, waiting for incoming deploy requests and prefix status requests. In both cases, separate, shorter-living channels are opened. For deployment status reports, closed when ended. For prefix status reports, should be closed by the server. |
| DeploymentStatus | [.crux.DeploymentStatusMessage](#crux.DeploymentStatusMessage) stream | [Empty](#agent.Empty) |  |
| ContainerStatus | [.crux.ContainerStatusListMessage](#crux.ContainerStatusListMessage) stream | [Empty](#agent.Empty) |  |

 



<a name="proto/crux.proto"></a>
<p align="right"><a href="#top">Top</a></p>

## proto/crux.proto
CRUX Protobuf definitions


<a name="crux.AccessRequest"></a>

### AccessRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| accessedBy | [string](#string) |  |  |






<a name="crux.ActiveTeamUser"></a>

### ActiveTeamUser



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| activeTeamId | [string](#string) |  |  |
| role | [UserRole](#crux.UserRole) |  |  |
| status | [UserStatus](#crux.UserStatus) |  |  |






<a name="crux.AddImagesToVersionRequest"></a>

### AddImagesToVersionRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| accessedBy | [string](#string) |  |  |
| versionId | [string](#string) |  |  |
| registryId | [string](#string) |  |  |
| imageIds | [string](#string) | repeated |  |






<a name="crux.AuditLogListResponse"></a>

### AuditLogListResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| data | [AuditLogResponse](#crux.AuditLogResponse) | repeated |  |






<a name="crux.AuditLogResponse"></a>

### AuditLogResponse
AUDIT


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| createdAt | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| userId | [string](#string) |  |  |
| identityName | [string](#string) |  |  |
| serviceCall | [string](#string) |  |  |
| data | [string](#string) | optional |  |






<a name="crux.AuditResponse"></a>

### AuditResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| createdBy | [string](#string) |  |  |
| createdAt | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| updatedBy | [string](#string) | optional |  |
| updatedAt | [google.protobuf.Timestamp](#google.protobuf.Timestamp) | optional |  |






<a name="crux.ContainerConfig"></a>

### ContainerConfig



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| config | [ExplicitContainerConfig](#crux.ExplicitContainerConfig) |  |  |
| capabilities | [UniqueKeyValue](#crux.UniqueKeyValue) | repeated |  |
| environment | [UniqueKeyValue](#crux.UniqueKeyValue) | repeated |  |






<a name="crux.ContainerPort"></a>

### ContainerPort



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| internal | [int32](#int32) |  |  |
| external | [int32](#int32) |  |  |






<a name="crux.ContainerStatusItem"></a>

### ContainerStatusItem



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| containerId | [string](#string) |  |  |
| name | [string](#string) |  |  |
| command | [string](#string) |  |  |
| createdAt | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| status | [ContainerStatus](#crux.ContainerStatus) |  |  |
| ports | [ContainerPort](#crux.ContainerPort) | repeated |  |






<a name="crux.ContainerStatusListMessage"></a>

### ContainerStatusListMessage



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| prefix | [string](#string) | optional |  |
| data | [ContainerStatusItem](#crux.ContainerStatusItem) | repeated |  |






<a name="crux.CreateDeploymentRequest"></a>

### CreateDeploymentRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| accessedBy | [string](#string) |  |  |
| versionId | [string](#string) |  |  |
| nodeId | [string](#string) |  |  |






<a name="crux.CreateEntityResponse"></a>

### CreateEntityResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| createdAt | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |






<a name="crux.CreateNodeRequest"></a>

### CreateNodeRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| accessedBy | [string](#string) |  |  |
| name | [string](#string) |  |  |
| description | [string](#string) | optional |  |
| icon | [string](#string) | optional |  |






<a name="crux.CreateProductRequest"></a>

### CreateProductRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| accessedBy | [string](#string) |  |  |
| name | [string](#string) |  |  |
| description | [string](#string) | optional |  |
| type | [ProductType](#crux.ProductType) |  |  |






<a name="crux.CreateRegistryRequest"></a>

### CreateRegistryRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| accessedBy | [string](#string) |  |  |
| name | [string](#string) |  |  |
| description | [string](#string) | optional |  |
| icon | [string](#string) | optional |  |
| url | [string](#string) |  |  |
| user | [string](#string) | optional |  |
| token | [string](#string) | optional |  |
| type | [RegistryType](#crux.RegistryType) |  |  |






<a name="crux.CreateTeamRequest"></a>

### CreateTeamRequest
TEAM


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| accessedBy | [string](#string) |  |  |
| name | [string](#string) |  |  |






<a name="crux.CreateVersionRequest"></a>

### CreateVersionRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| accessedBy | [string](#string) |  |  |
| productId | [string](#string) |  |  |
| name | [string](#string) |  |  |
| changelog | [string](#string) | optional |  |
| default | [bool](#bool) |  |  |
| type | [VersionType](#crux.VersionType) |  |  |






<a name="crux.DeploymentDetailsResponse"></a>

### DeploymentDetailsResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| audit | [AuditResponse](#crux.AuditResponse) |  |  |
| productVersionId | [string](#string) |  |  |
| nodeId | [string](#string) |  |  |
| name | [string](#string) |  |  |
| description | [string](#string) | optional |  |
| prefix | [string](#string) |  |  |
| environment | [UniqueKeyValue](#crux.UniqueKeyValue) | repeated |  |
| status | [DeploymentStatus](#crux.DeploymentStatus) |  |  |
| instances | [InstanceResponse](#crux.InstanceResponse) | repeated |  |






<a name="crux.DeploymentEditEventMessage"></a>

### DeploymentEditEventMessage



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| instancesCreated | [InstancesCreatedEventList](#crux.InstancesCreatedEventList) |  |  |
| imageIdDeleted | [string](#string) |  |  |






<a name="crux.DeploymentEventContainerStatus"></a>

### DeploymentEventContainerStatus



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| instanceId | [string](#string) |  |  |
| status | [ContainerStatus](#crux.ContainerStatus) |  |  |






<a name="crux.DeploymentEventListResponse"></a>

### DeploymentEventListResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| data | [DeploymentEventResponse](#crux.DeploymentEventResponse) | repeated |  |






<a name="crux.DeploymentEventLog"></a>

### DeploymentEventLog



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| log | [string](#string) | repeated |  |






<a name="crux.DeploymentEventResponse"></a>

### DeploymentEventResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| type | [DeploymentEventType](#crux.DeploymentEventType) |  |  |
| createdAt | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| log | [DeploymentEventLog](#crux.DeploymentEventLog) |  |  |
| deploymentStatus | [DeploymentStatus](#crux.DeploymentStatus) |  |  |
| containerStatus | [DeploymentEventContainerStatus](#crux.DeploymentEventContainerStatus) |  |  |






<a name="crux.DeploymentListResponse"></a>

### DeploymentListResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| data | [DeploymentResponse](#crux.DeploymentResponse) | repeated |  |






<a name="crux.DeploymentProgressMessage"></a>

### DeploymentProgressMessage



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| status | [DeploymentStatus](#crux.DeploymentStatus) | optional |  |
| instance | [InstanceDeploymentItem](#crux.InstanceDeploymentItem) | optional |  |
| log | [string](#string) | repeated |  |






<a name="crux.DeploymentResponse"></a>

### DeploymentResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| audit | [AuditResponse](#crux.AuditResponse) |  |  |
| name | [string](#string) |  |  |
| prefix | [string](#string) |  |  |
| nodeId | [string](#string) |  |  |
| nodeName | [string](#string) |  |  |
| status | [DeploymentStatus](#crux.DeploymentStatus) |  |  |






<a name="crux.DeploymentStatusMessage"></a>

### DeploymentStatusMessage



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| instance | [InstanceDeploymentItem](#crux.InstanceDeploymentItem) |  |  |
| deploymentStatus | [DeploymentStatus](#crux.DeploymentStatus) |  |  |
| log | [string](#string) | repeated |  |






<a name="crux.Empty"></a>

### Empty
Common messages






<a name="crux.ExplicitContainerConfig"></a>

### ExplicitContainerConfig



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| ports | [ExplicitContainerConfig.Port](#crux.ExplicitContainerConfig.Port) | repeated | container ports |
| mounts | [string](#string) | repeated | volume mounts in a piped format |
| networkMode | [ExplicitContainerConfig.NetworkMode](#crux.ExplicitContainerConfig.NetworkMode) | optional | could be enum, i&#39;m not sure if it is in use |
| expose | [ExplicitContainerConfig.Expose](#crux.ExplicitContainerConfig.Expose) | optional | exposure configuration |
| user | [uint64](#uint64) | optional |  |






<a name="crux.ExplicitContainerConfig.Expose"></a>

### ExplicitContainerConfig.Expose



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public | [bool](#bool) |  | if expose is needed |
| tls | [bool](#bool) |  | if tls is needed |






<a name="crux.ExplicitContainerConfig.Port"></a>

### ExplicitContainerConfig.Port



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| internal | [int32](#int32) |  | internal that is bound by the container |
| external | [int32](#int32) |  | external is docker only |






<a name="crux.IdRequest"></a>

### IdRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| accessedBy | [string](#string) |  |  |






<a name="crux.ImageListResponse"></a>

### ImageListResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| data | [ImageResponse](#crux.ImageResponse) | repeated |  |






<a name="crux.ImageResponse"></a>

### ImageResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| name | [string](#string) |  |  |
| tag | [string](#string) |  |  |
| order | [uint32](#uint32) |  |  |
| registryId | [string](#string) |  |  |
| config | [ContainerConfig](#crux.ContainerConfig) |  |  |






<a name="crux.IncreaseVersionRequest"></a>

### IncreaseVersionRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| accessedBy | [string](#string) |  |  |
| name | [string](#string) |  |  |
| changelog | [string](#string) | optional |  |






<a name="crux.InstanceDeploymentItem"></a>

### InstanceDeploymentItem



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| instanceId | [string](#string) |  |  |
| status | [ContainerStatus](#crux.ContainerStatus) |  |  |






<a name="crux.InstanceResponse"></a>

### InstanceResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| audit | [AuditResponse](#crux.AuditResponse) |  |  |
| image | [ImageResponse](#crux.ImageResponse) |  |  |
| status | [ContainerStatus](#crux.ContainerStatus) | optional |  |
| config | [ContainerConfig](#crux.ContainerConfig) | optional |  |






<a name="crux.InstancesCreatedEventList"></a>

### InstancesCreatedEventList



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| data | [InstanceResponse](#crux.InstanceResponse) | repeated |  |






<a name="crux.KeyValueList"></a>

### KeyValueList



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| data | [UniqueKeyValue](#crux.UniqueKeyValue) | repeated |  |






<a name="crux.NodeDetailsResponse"></a>

### NodeDetailsResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| audit | [AuditResponse](#crux.AuditResponse) |  |  |
| name | [string](#string) |  |  |
| description | [string](#string) | optional |  |
| icon | [string](#string) | optional |  |
| address | [string](#string) | optional |  |
| status | [NodeConnectionStatus](#crux.NodeConnectionStatus) |  |  |
| hasToken | [bool](#bool) |  |  |
| connectedAt | [google.protobuf.Timestamp](#google.protobuf.Timestamp) | optional |  |
| install | [NodeInstallResponse](#crux.NodeInstallResponse) | optional |  |
| script | [NodeScriptResponse](#crux.NodeScriptResponse) | optional |  |






<a name="crux.NodeEventMessage"></a>

### NodeEventMessage



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| status | [NodeConnectionStatus](#crux.NodeConnectionStatus) |  |  |
| address | [string](#string) | optional |  |






<a name="crux.NodeInstallResponse"></a>

### NodeInstallResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| command | [string](#string) |  |  |
| expireAt | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |






<a name="crux.NodeListResponse"></a>

### NodeListResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| data | [NodeResponse](#crux.NodeResponse) | repeated |  |






<a name="crux.NodeResponse"></a>

### NodeResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| audit | [AuditResponse](#crux.AuditResponse) |  |  |
| name | [string](#string) |  |  |
| description | [string](#string) | optional |  |
| icon | [string](#string) | optional |  |
| address | [string](#string) | optional |  |
| status | [NodeConnectionStatus](#crux.NodeConnectionStatus) |  |  |
| connectedAt | [google.protobuf.Timestamp](#google.protobuf.Timestamp) | optional |  |






<a name="crux.NodeScriptResponse"></a>

### NodeScriptResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| content | [string](#string) |  |  |






<a name="crux.OrderVersionImagesRequest"></a>

### OrderVersionImagesRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| accessedBy | [string](#string) |  |  |
| versionId | [string](#string) |  |  |
| imageIds | [string](#string) | repeated |  |






<a name="crux.PatchContainerConfig"></a>

### PatchContainerConfig



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| capabilities | [KeyValueList](#crux.KeyValueList) | optional |  |
| environment | [KeyValueList](#crux.KeyValueList) | optional |  |
| config | [ExplicitContainerConfig](#crux.ExplicitContainerConfig) | optional |  |






<a name="crux.PatchDeploymentRequest"></a>

### PatchDeploymentRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| accessedBy | [string](#string) |  |  |
| environment | [KeyValueList](#crux.KeyValueList) | optional |  |
| instance | [PatchInstanceRequest](#crux.PatchInstanceRequest) | optional |  |






<a name="crux.PatchImageRequest"></a>

### PatchImageRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| accessedBy | [string](#string) |  |  |
| name | [string](#string) | optional |  |
| tag | [string](#string) | optional |  |
| config | [PatchContainerConfig](#crux.PatchContainerConfig) | optional |  |






<a name="crux.PatchInstanceRequest"></a>

### PatchInstanceRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| accessedBy | [string](#string) |  |  |
| environment | [KeyValueList](#crux.KeyValueList) | optional |  |
| capabilities | [KeyValueList](#crux.KeyValueList) | optional |  |
| config | [ExplicitContainerConfig](#crux.ExplicitContainerConfig) | optional |  |






<a name="crux.ProductDetailsReponse"></a>

### ProductDetailsReponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| audit | [AuditResponse](#crux.AuditResponse) |  |  |
| name | [string](#string) |  |  |
| description | [string](#string) | optional |  |
| type | [ProductType](#crux.ProductType) |  |  |
| versions | [VersionResponse](#crux.VersionResponse) | repeated |  |






<a name="crux.ProductListResponse"></a>

### ProductListResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| data | [ProductReponse](#crux.ProductReponse) | repeated |  |






<a name="crux.ProductReponse"></a>

### ProductReponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| audit | [AuditResponse](#crux.AuditResponse) |  |  |
| name | [string](#string) |  |  |
| description | [string](#string) | optional |  |
| type | [ProductType](#crux.ProductType) |  |  |






<a name="crux.RegistryDetailsResponse"></a>

### RegistryDetailsResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| audit | [AuditResponse](#crux.AuditResponse) |  |  |
| name | [string](#string) |  |  |
| description | [string](#string) | optional |  |
| icon | [string](#string) | optional |  |
| url | [string](#string) |  |  |
| user | [string](#string) | optional |  |
| token | [string](#string) | optional |  |
| type | [RegistryType](#crux.RegistryType) |  |  |






<a name="crux.RegistryListResponse"></a>

### RegistryListResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| data | [RegistryResponse](#crux.RegistryResponse) | repeated |  |






<a name="crux.RegistryResponse"></a>

### RegistryResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| audit | [AuditResponse](#crux.AuditResponse) |  |  |
| name | [string](#string) |  |  |
| description | [string](#string) | optional |  |
| icon | [string](#string) | optional |  |
| url | [string](#string) |  |  |






<a name="crux.ServiceIdRequest"></a>

### ServiceIdRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |






<a name="crux.TeamDetailsResponse"></a>

### TeamDetailsResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| name | [string](#string) |  |  |
| users | [UserResponse](#crux.UserResponse) | repeated |  |






<a name="crux.TeamResponse"></a>

### TeamResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| name | [string](#string) |  |  |






<a name="crux.UniqueKeyValue"></a>

### UniqueKeyValue



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| key | [string](#string) |  |  |
| value | [string](#string) |  |  |






<a name="crux.UpdateActiveTeamRequest"></a>

### UpdateActiveTeamRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| accessedBy | [string](#string) |  |  |
| name | [string](#string) |  |  |






<a name="crux.UpdateDeploymentRequest"></a>

### UpdateDeploymentRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| accessedBy | [string](#string) |  |  |
| name | [string](#string) |  |  |
| descripion | [string](#string) | optional |  |
| prefix | [string](#string) |  |  |






<a name="crux.UpdateEntityResponse"></a>

### UpdateEntityResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| updatedAt | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |






<a name="crux.UpdateNodeRequest"></a>

### UpdateNodeRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| accessedBy | [string](#string) |  |  |
| name | [string](#string) |  |  |
| description | [string](#string) | optional |  |
| icon | [string](#string) | optional |  |






<a name="crux.UpdateProductRequest"></a>

### UpdateProductRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| accessedBy | [string](#string) |  |  |
| name | [string](#string) |  |  |
| description | [string](#string) | optional |  |
| changelog | [string](#string) | optional |  |






<a name="crux.UpdateRegistryRequest"></a>

### UpdateRegistryRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| accessedBy | [string](#string) |  |  |
| name | [string](#string) |  |  |
| description | [string](#string) | optional |  |
| icon | [string](#string) | optional |  |
| url | [string](#string) |  |  |
| user | [string](#string) | optional |  |
| token | [string](#string) | optional |  |
| type | [RegistryType](#crux.RegistryType) |  |  |






<a name="crux.UpdateVersionRequest"></a>

### UpdateVersionRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| accessedBy | [string](#string) |  |  |
| name | [string](#string) |  |  |
| changelog | [string](#string) | optional |  |
| default | [bool](#bool) |  |  |






<a name="crux.UserInviteRequest"></a>

### UserInviteRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| accessedBy | [string](#string) |  |  |
| email | [string](#string) |  |  |






<a name="crux.UserMetaResponse"></a>

### UserMetaResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user | [ActiveTeamUser](#crux.ActiveTeamUser) |  |  |
| teams | [TeamResponse](#crux.TeamResponse) | repeated |  |
| invitations | [TeamResponse](#crux.TeamResponse) | repeated |  |






<a name="crux.UserResponse"></a>

### UserResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| name | [string](#string) |  |  |
| email | [string](#string) |  |  |
| role | [UserRole](#crux.UserRole) |  |  |
| status | [UserStatus](#crux.UserStatus) |  |  |






<a name="crux.VersionDetailsResponse"></a>

### VersionDetailsResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| audit | [AuditResponse](#crux.AuditResponse) |  |  |
| name | [string](#string) |  |  |
| changelog | [string](#string) |  |  |
| default | [bool](#bool) |  |  |
| type | [VersionType](#crux.VersionType) |  |  |
| mutable | [bool](#bool) |  |  |
| increasable | [bool](#bool) |  |  |
| images | [ImageResponse](#crux.ImageResponse) | repeated |  |
| deployments | [DeploymentResponse](#crux.DeploymentResponse) | repeated |  |






<a name="crux.VersionListResponse"></a>

### VersionListResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| data | [VersionResponse](#crux.VersionResponse) | repeated |  |






<a name="crux.VersionResponse"></a>

### VersionResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| audit | [AuditResponse](#crux.AuditResponse) |  |  |
| name | [string](#string) |  |  |
| changelog | [string](#string) |  |  |
| default | [bool](#bool) |  |  |
| type | [VersionType](#crux.VersionType) |  |  |
| increasable | [bool](#bool) |  |  |






<a name="crux.WatchContainerStatusRequest"></a>

### WatchContainerStatusRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| accessedBy | [string](#string) |  |  |
| nodeId | [string](#string) |  |  |
| prefix | [string](#string) | optional |  |





 


<a name="crux.ContainerStatus"></a>

### ContainerStatus


| Name | Number | Description |
| ---- | ------ | ----------- |
| UNKNOWN_CONTAINER_STATUS | 0 |  |
| CREATED | 1 |  |
| RESTARTING | 2 |  |
| RUNNING | 3 |  |
| REMOVING | 4 |  |
| PAUSED | 5 |  |
| EXITED | 6 |  |
| DEAD | 7 |  |



<a name="crux.DeploymentEventType"></a>

### DeploymentEventType


| Name | Number | Description |
| ---- | ------ | ----------- |
| UNKNOWN_DEPLOYMENT_EVENT_TYPE | 0 |  |
| DEPLOYMENT_LOG | 1 |  |
| DEPLOYMENT_STATUS | 2 |  |
| CONTAINER_STATUS | 3 |  |



<a name="crux.DeploymentStatus"></a>

### DeploymentStatus


| Name | Number | Description |
| ---- | ------ | ----------- |
| UNKNOWN_DEPLOYMENT_STATUS | 0 |  |
| PREPARING | 1 |  |
| IN_PROGRESS | 2 |  |
| SUCCESSFUL | 3 |  |
| FAILED | 4 |  |
| OBSOLETE | 5 |  |
| DOWNGRADED | 6 |  |



<a name="crux.ExplicitContainerConfig.NetworkMode"></a>

### ExplicitContainerConfig.NetworkMode


| Name | Number | Description |
| ---- | ------ | ----------- |
| UNKNOWN_NETWORK_MODE | 0 |  |
| NONE | 1 |  |
| HOST | 2 |  |



<a name="crux.NodeConnectionStatus"></a>

### NodeConnectionStatus
Lifecycle:
When a node connection is alive, the status is CONNECTED.
If it disconnects, the status will be UNREACHABLE.
When a node created, it is UNREACHEABLE until the user completes
the install process.

| Name | Number | Description |
| ---- | ------ | ----------- |
| UNKNOWN_CONNECTION_STATUS | 0 |  |
| UNREACHABLE | 1 | Node was not yet connected or became unreachable |
| CONNECTED | 2 | Node is running and connected |



<a name="crux.ProductType"></a>

### ProductType
PRODUCT

| Name | Number | Description |
| ---- | ------ | ----------- |
| UNKNOWN_PRODUCT_TYPE | 0 |  |
| SIMPLE | 1 |  |
| COMPLEX | 2 |  |



<a name="crux.RegistryType"></a>

### RegistryType


| Name | Number | Description |
| ---- | ------ | ----------- |
| UNKNOWN_REGISTRY_TYPE | 0 |  |
| V2 | 1 |  |
| HUB | 2 |  |



<a name="crux.UserRole"></a>

### UserRole


| Name | Number | Description |
| ---- | ------ | ----------- |
| UNKNOWN_USER_ROLE | 0 |  |
| USER | 1 |  |
| OWNER | 2 |  |



<a name="crux.UserStatus"></a>

### UserStatus


| Name | Number | Description |
| ---- | ------ | ----------- |
| UNKNOWN_USER_STATUS | 0 |  |
| PENDING | 1 |  |
| VERIFIED | 2 |  |



<a name="crux.VersionType"></a>

### VersionType


| Name | Number | Description |
| ---- | ------ | ----------- |
| UNKNOWN_VERSION_TYPE | 0 |  |
| INCREMENTAL | 1 |  |
| ROLLING | 2 |  |


 

 


<a name="crux.CruxAudit"></a>

### CruxAudit


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetAuditLog | [AccessRequest](#crux.AccessRequest) | [AuditLogListResponse](#crux.AuditLogListResponse) |  |


<a name="crux.CruxDeployment"></a>

### CruxDeployment


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetDeploymentsByVersionId | [IdRequest](#crux.IdRequest) | [DeploymentListResponse](#crux.DeploymentListResponse) |  |
| CreateDeployment | [CreateDeploymentRequest](#crux.CreateDeploymentRequest) | [CreateEntityResponse](#crux.CreateEntityResponse) |  |
| UpdateDeployment | [UpdateDeploymentRequest](#crux.UpdateDeploymentRequest) | [UpdateEntityResponse](#crux.UpdateEntityResponse) |  |
| PatchDeployment | [PatchDeploymentRequest](#crux.PatchDeploymentRequest) | [UpdateEntityResponse](#crux.UpdateEntityResponse) |  |
| DeleteDeployment | [IdRequest](#crux.IdRequest) | [Empty](#crux.Empty) |  |
| GetDeploymentDetails | [IdRequest](#crux.IdRequest) | [DeploymentDetailsResponse](#crux.DeploymentDetailsResponse) |  |
| GetDeploymentEvents | [IdRequest](#crux.IdRequest) | [DeploymentEventListResponse](#crux.DeploymentEventListResponse) |  |
| StartDeployment | [IdRequest](#crux.IdRequest) | [DeploymentProgressMessage](#crux.DeploymentProgressMessage) stream |  |
| SubscribeToDeploymentEditEvents | [ServiceIdRequest](#crux.ServiceIdRequest) | [DeploymentEditEventMessage](#crux.DeploymentEditEventMessage) stream |  |


<a name="crux.CruxHealth"></a>

### CruxHealth


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| getHealth | [Empty](#crux.Empty) | [Empty](#crux.Empty) |  |


<a name="crux.CruxImage"></a>

### CruxImage


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetImagesByVersionId | [IdRequest](#crux.IdRequest) | [ImageListResponse](#crux.ImageListResponse) |  |
| AddImagesToVersion | [AddImagesToVersionRequest](#crux.AddImagesToVersionRequest) | [ImageListResponse](#crux.ImageListResponse) |  |
| OrderImages | [OrderVersionImagesRequest](#crux.OrderVersionImagesRequest) | [Empty](#crux.Empty) |  |
| PatchImage | [PatchImageRequest](#crux.PatchImageRequest) | [Empty](#crux.Empty) |  |
| DeleteImage | [IdRequest](#crux.IdRequest) | [Empty](#crux.Empty) |  |
| GetImageDetails | [IdRequest](#crux.IdRequest) | [ImageResponse](#crux.ImageResponse) |  |


<a name="crux.CruxNode"></a>

### CruxNode


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetNodes | [AccessRequest](#crux.AccessRequest) | [NodeListResponse](#crux.NodeListResponse) | CRUD |
| CreateNode | [CreateNodeRequest](#crux.CreateNodeRequest) | [CreateEntityResponse](#crux.CreateEntityResponse) |  |
| UpdateNode | [UpdateNodeRequest](#crux.UpdateNodeRequest) | [Empty](#crux.Empty) |  |
| DeleteNode | [IdRequest](#crux.IdRequest) | [Empty](#crux.Empty) |  |
| GetNodeDetails | [IdRequest](#crux.IdRequest) | [NodeDetailsResponse](#crux.NodeDetailsResponse) |  |
| GenerateScript | [IdRequest](#crux.IdRequest) | [NodeInstallResponse](#crux.NodeInstallResponse) |  |
| GetScript | [ServiceIdRequest](#crux.ServiceIdRequest) | [NodeScriptResponse](#crux.NodeScriptResponse) |  |
| DiscardScript | [IdRequest](#crux.IdRequest) | [Empty](#crux.Empty) |  |
| RevokeToken | [IdRequest](#crux.IdRequest) | [Empty](#crux.Empty) |  |
| SubscribeNodeEventChannel | [ServiceIdRequest](#crux.ServiceIdRequest) | [NodeEventMessage](#crux.NodeEventMessage) stream |  |
| WatchContainerStatus | [WatchContainerStatusRequest](#crux.WatchContainerStatusRequest) | [ContainerStatusListMessage](#crux.ContainerStatusListMessage) stream |  |


<a name="crux.CruxProduct"></a>

### CruxProduct
Services

| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetProducts | [AccessRequest](#crux.AccessRequest) | [ProductListResponse](#crux.ProductListResponse) | CRUD |
| CreateProduct | [CreateProductRequest](#crux.CreateProductRequest) | [CreateEntityResponse](#crux.CreateEntityResponse) |  |
| UpdateProduct | [UpdateProductRequest](#crux.UpdateProductRequest) | [UpdateEntityResponse](#crux.UpdateEntityResponse) |  |
| DeleteProduct | [IdRequest](#crux.IdRequest) | [Empty](#crux.Empty) |  |
| GetProductDetails | [IdRequest](#crux.IdRequest) | [ProductDetailsReponse](#crux.ProductDetailsReponse) |  |


<a name="crux.CruxProductVersion"></a>

### CruxProductVersion


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetVersionsByProductId | [IdRequest](#crux.IdRequest) | [VersionListResponse](#crux.VersionListResponse) |  |
| CreateVersion | [CreateVersionRequest](#crux.CreateVersionRequest) | [CreateEntityResponse](#crux.CreateEntityResponse) |  |
| UpdateVersion | [UpdateVersionRequest](#crux.UpdateVersionRequest) | [UpdateEntityResponse](#crux.UpdateEntityResponse) |  |
| DeleteVersion | [IdRequest](#crux.IdRequest) | [Empty](#crux.Empty) |  |
| GetVersionDetails | [IdRequest](#crux.IdRequest) | [VersionDetailsResponse](#crux.VersionDetailsResponse) |  |
| IncreaseVersion | [IncreaseVersionRequest](#crux.IncreaseVersionRequest) | [CreateEntityResponse](#crux.CreateEntityResponse) |  |


<a name="crux.CruxRegistry"></a>

### CruxRegistry


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetRegistries | [AccessRequest](#crux.AccessRequest) | [RegistryListResponse](#crux.RegistryListResponse) | CRUD |
| CreateRegistry | [CreateRegistryRequest](#crux.CreateRegistryRequest) | [CreateEntityResponse](#crux.CreateEntityResponse) |  |
| UpdateRegistry | [UpdateRegistryRequest](#crux.UpdateRegistryRequest) | [UpdateEntityResponse](#crux.UpdateEntityResponse) |  |
| DeleteRegistry | [IdRequest](#crux.IdRequest) | [Empty](#crux.Empty) |  |
| GetRegistryDetails | [IdRequest](#crux.IdRequest) | [RegistryDetailsResponse](#crux.RegistryDetailsResponse) |  |


<a name="crux.CruxTeam"></a>

### CruxTeam


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| CreateTeam | [CreateTeamRequest](#crux.CreateTeamRequest) | [CreateEntityResponse](#crux.CreateEntityResponse) |  |
| GetActiveTeamByUser | [AccessRequest](#crux.AccessRequest) | [TeamDetailsResponse](#crux.TeamDetailsResponse) |  |
| UpdateActiveTeam | [UpdateActiveTeamRequest](#crux.UpdateActiveTeamRequest) | [Empty](#crux.Empty) |  |
| DeleteActiveTeam | [AccessRequest](#crux.AccessRequest) | [Empty](#crux.Empty) |  |
| InviteUserToTheActiveTeam | [UserInviteRequest](#crux.UserInviteRequest) | [CreateEntityResponse](#crux.CreateEntityResponse) |  |
| DeleteUserFromTheActiveTeam | [IdRequest](#crux.IdRequest) | [Empty](#crux.Empty) |  |
| AcceptTeamInvite | [IdRequest](#crux.IdRequest) | [Empty](#crux.Empty) |  |
| SelectTeam | [IdRequest](#crux.IdRequest) | [Empty](#crux.Empty) |  |
| GetUserMeta | [AccessRequest](#crux.AccessRequest) | [UserMetaResponse](#crux.UserMetaResponse) |  |

 



## Scalar Value Types

| .proto Type | Notes | C++ | Java | Python | Go | C# | PHP | Ruby |
| ----------- | ----- | --- | ---- | ------ | -- | -- | --- | ---- |
| <a name="double" /> double |  | double | double | float | float64 | double | float | Float |
| <a name="float" /> float |  | float | float | float | float32 | float | float | Float |
| <a name="int32" /> int32 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint32 instead. | int32 | int | int | int32 | int | integer | Bignum or Fixnum (as required) |
| <a name="int64" /> int64 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint64 instead. | int64 | long | int/long | int64 | long | integer/string | Bignum |
| <a name="uint32" /> uint32 | Uses variable-length encoding. | uint32 | int | int/long | uint32 | uint | integer | Bignum or Fixnum (as required) |
| <a name="uint64" /> uint64 | Uses variable-length encoding. | uint64 | long | int/long | uint64 | ulong | integer/string | Bignum or Fixnum (as required) |
| <a name="sint32" /> sint32 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int32s. | int32 | int | int | int32 | int | integer | Bignum or Fixnum (as required) |
| <a name="sint64" /> sint64 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int64s. | int64 | long | int/long | int64 | long | integer/string | Bignum |
| <a name="fixed32" /> fixed32 | Always four bytes. More efficient than uint32 if values are often greater than 2^28. | uint32 | int | int | uint32 | uint | integer | Bignum or Fixnum (as required) |
| <a name="fixed64" /> fixed64 | Always eight bytes. More efficient than uint64 if values are often greater than 2^56. | uint64 | long | int/long | uint64 | ulong | integer/string | Bignum |
| <a name="sfixed32" /> sfixed32 | Always four bytes. | int32 | int | int | int32 | int | integer | Bignum or Fixnum (as required) |
| <a name="sfixed64" /> sfixed64 | Always eight bytes. | int64 | long | int/long | int64 | long | integer/string | Bignum |
| <a name="bool" /> bool |  | bool | boolean | boolean | bool | bool | boolean | TrueClass/FalseClass |
| <a name="string" /> string | A string must always contain UTF-8 encoded or 7-bit ASCII text. | string | String | str/unicode | string | string | string | String (UTF-8) |
| <a name="bytes" /> bytes | May contain any arbitrary sequence of bytes. | string | ByteString | str | []byte | ByteString | string | String (ASCII-8BIT) |

