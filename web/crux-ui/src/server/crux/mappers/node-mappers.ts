import { ContainerIdentifier, ContainerState, NodeStatus } from '@app/models'
import {
  ContainerIdentifier as ProtoContainerIdentifier,
  ContainerState as ProtoContainerState,
  containerStateToJSON,
} from '@app/models/grpc/protobuf/proto/common'
import { NodeConnectionStatus } from '@app/models/grpc/protobuf/proto/crux'

export const containerStateToDto = (state: ProtoContainerState): ContainerState =>
  containerStateToJSON(state).toLowerCase() as ContainerState

export const nodeStatusToDto = (status: NodeConnectionStatus): NodeStatus => {
  switch (status) {
    case NodeConnectionStatus.CONNECTED:
      return 'connected'
    case NodeConnectionStatus.UNREACHABLE:
      return 'unreachable'
    default:
      return 'unreachable'
  }
}

export const containerIdentifierToProto = (it: ContainerIdentifier): ProtoContainerIdentifier => ({
  prefix: it.prefix ?? '',
  name: it.name,
})
