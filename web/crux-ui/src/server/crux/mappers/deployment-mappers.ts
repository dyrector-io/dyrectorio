import { DeploymentEventType, DeploymentStatus, Instance } from '@app/models'
import {
  DeploymentStatus as ProtoDeploymentStatus,
  deploymentStatusToJSON,
} from '@app/models/grpc/protobuf/proto/common'

import { DeploymentEventType as ProtoDeploymentEventType, InstanceResponse } from '@app/models/grpc/protobuf/proto/crux'
import { containerConfigToDto, imageToDto } from './image-mappers'
import { containerStateToDto } from './node-mappers'

export const deploymentStatusToDto = (status: ProtoDeploymentStatus): DeploymentStatus =>
  deploymentStatusToJSON(status).toLowerCase() as DeploymentStatus

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

export const instanceToDto = (res: InstanceResponse): Instance =>
  ({
    ...res,
    image: imageToDto(res.image),
    state: !res.state ? null : containerStateToDto(res.state),
    overriddenConfig: containerConfigToDto(res.config),
  } as Instance)
