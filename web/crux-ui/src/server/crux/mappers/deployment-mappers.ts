import { DeploymentEventType, DeploymentStatus, Instance, InstanceContainerConfig } from '@app/models'
import {
  DeploymentStatus as ProtoDeploymentStatus,
  deploymentStatusToJSON,
} from '@app/models/grpc/protobuf/proto/common'

import {
  DeploymentEventType as ProtoDeploymentEventType,
  InstanceContainerConfig as ProtoInstanceContainerConfig,
  InstanceResponse,
} from '@app/models/grpc/protobuf/proto/crux'
import { explicitContainerConfigToDto, imageToDto } from './image-mappers'
import { containerStateToDto } from './node-mappers'

export const deploymentStatusToDto = (status: ProtoDeploymentStatus): DeploymentStatus =>
  deploymentStatusToJSON(status).toLocaleLowerCase() as DeploymentStatus

export const deploymentEventTypeToDto = (type: ProtoDeploymentEventType): DeploymentEventType => {
  switch (type) {
    case ProtoDeploymentEventType.DEPLOYMENT_LOG:
      return 'log'
    case ProtoDeploymentEventType.CONTAINER_STATUS:
      return 'containerStatus'
    case ProtoDeploymentEventType.DEPLOYMENT_STATUS:
      return 'deploymentStatus'
    default:
      return null
  }
}

export const instanceContainerConfigToDto = (config: ProtoInstanceContainerConfig): InstanceContainerConfig =>
  !config
    ? null
    : {
        ...config,
        config: explicitContainerConfigToDto(config.config),
      }

export const instanceToDto = (res: InstanceResponse): Instance =>
  ({
    ...res,
    image: imageToDto(res.image),
    state: !res.state ? null : containerStateToDto(res.state),
    overriddenConfig: instanceContainerConfigToDto(res.config),
  } as Instance)
