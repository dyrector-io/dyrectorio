import { ContainerState, NodeStatus, NodeType, NODE_TYPE_VALUES } from '@app/models'
import { ContainerState as ProtoContainerState, containerStateToJSON } from '@app/models/grpc/protobuf/proto/common'
import { NodeConnectionStatus, NodeType as GrpcNodeType } from '@app/models/grpc/protobuf/proto/crux'

export const containerStateToDto = (state: ProtoContainerState): ContainerState =>
  containerStateToJSON(state).toLowerCase() as ContainerState

export const nodeTypeUiToGrpc = (type: NodeType): GrpcNodeType =>
  type === NODE_TYPE_VALUES[0] ? GrpcNodeType.DOCKER : GrpcNodeType.K8S

export const nodeTypeGrpcToUi = (type: GrpcNodeType): NodeType =>
  type === GrpcNodeType.DOCKER ? NODE_TYPE_VALUES[0] : NODE_TYPE_VALUES[1]

export const nodeStatusToDto = (status: NodeConnectionStatus): NodeStatus => {
  switch (status) {
    case NodeConnectionStatus.CONNECTED:
      return 'running'
    case NodeConnectionStatus.UNREACHABLE:
      return 'unreachable'
    default:
      return 'unreachable'
  }
}
