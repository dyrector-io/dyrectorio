import { DeploymentEventType, DeploymentStatus, Instance, InstanceContainerConfigData } from '@app/models'
import {
  DeploymentStatus as ProtoDeploymentStatus,
  deploymentStatusToJSON,
} from '@app/models/grpc/protobuf/proto/common'

import {
  DeploymentEventType as ProtoDeploymentEventType,
  InstanceContainerConfig as ProtoInstanceContainerConfig,
  InstanceResponse,
} from '@app/models/grpc/protobuf/proto/crux'
import { containerConfigToDto, containerConfigToProto, imageToDto } from './image-mappers'
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

export const instanceContainerConfigToDto = (
  instanceConfig: ProtoInstanceContainerConfig,
): InstanceContainerConfigData => {
  const config = containerConfigToDto(instanceConfig)

  if (!config) {
    return null
  }

  return {
    ...config,
    tty: instanceConfig.common?.TTY ?? null,
    proxyHeaders: instanceConfig.crane?.proxyHeaders ?? null,
    useLoadBalancer: instanceConfig.crane?.useLoadBalancer ?? null,
    secrets: instanceConfig.secrets?.data ?? null,
  }
}

export const instanceToDto = (res: InstanceResponse): Instance =>
  ({
    ...res,
    image: imageToDto(res.image),
    state: !res.state ? null : containerStateToDto(res.state),
    overriddenConfig: instanceContainerConfigToDto(res.config),
  } as Instance)

export const instanceContainerConfigToProto = (
  instanceConfig: InstanceContainerConfigData,
): ProtoInstanceContainerConfig => {
  const config = containerConfigToProto(instanceConfig)

  return config
    ? {
        ...config,
        secrets: instanceConfig.secrets ? { data: instanceConfig.secrets } : null,
      }
    : null
}
