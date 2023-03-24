import { Logger } from '@app/logger'
import {
  Container,
  ContainerIdentifier,
  ContainerListMessage,
  ContainerLogMessage,
  NodeStatusMessage,
} from '@app/models'
import {
  ContainerLogMessage as GrpcContainerLogMessage,
  ContainerStateListMessage,
} from '@app/models/grpc/protobuf/proto/common'
import {
  CruxNodeClient,
  NodeEventMessage,
  ServiceIdRequest,
  WatchContainerLogRequest,
  WatchContainerStateRequest,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { GrpcConnection, ProtoSubscriptionOptions } from './grpc-connection'
import { containerIdentifierToProto, containerStateToDto, nodeStatusToDto } from './mappers/node-mappers'

class DyoNodeService {
  private logger = new Logger(DyoNodeService.name)

  constructor(private client: CruxNodeClient) {}

  subscribeToNodeEvents(
    teamId: string,
    options: ProtoSubscriptionOptions<NodeStatusMessage>,
  ): GrpcConnection<NodeEventMessage, NodeStatusMessage> {
    const req: ServiceIdRequest = {
      id: teamId,
    }

    const transform = (data: NodeEventMessage) =>
      ({
        nodeId: data.id,
        status: nodeStatusToDto(data.status),
        address: data.address,
        version: data.version,
        connectedAt: timestampToUTC(data.connectedAt),
        error: data.error,
        updating: data.updating,
      } as NodeStatusMessage)

    const stream = () => this.client.subscribeNodeEventChannel(ServiceIdRequest.fromJSON(req))
    return new GrpcConnection(this.logger.descend('events'), stream, transform, options)
  }

  watchContainerState(
    nodeId: string,
    prefix: string | undefined,
    options: ProtoSubscriptionOptions<ContainerListMessage>,
  ): GrpcConnection<ContainerStateListMessage, ContainerListMessage> {
    const req: WatchContainerStateRequest = {
      nodeId,
      prefix,
    }

    const transform = (data: ContainerStateListMessage) =>
      data.data.map(
        it =>
          ({
            id: it.id,
            date: timestampToUTC(it.createdAt),
            state: containerStateToDto(it.state),
            ports: it.ports,
            imageName: it.imageName,
            imageTag: it.imageTag,
          } as Container),
      ) as ContainerListMessage

    const stream = () => this.client.watchContainerState(WatchContainerStateRequest.fromJSON(req))
    return new GrpcConnection(this.logger.descend('container-status'), stream, transform, options)
  }

  watchContainerLog(
    nodeId: string,
    container: ContainerIdentifier,
    options: ProtoSubscriptionOptions<ContainerLogMessage>,
  ): GrpcConnection<GrpcContainerLogMessage, ContainerLogMessage> {
    const req: WatchContainerLogRequest = {
      nodeId,
      container: containerIdentifierToProto(container),
    }

    const transform = (data: GrpcContainerLogMessage) =>
      ({
        log: data.log,
      } as ContainerLogMessage)

    const stream = () => this.client.subscribeContainerLogChannel(WatchContainerLogRequest.fromJSON(req))
    return new GrpcConnection(this.logger.descend('container-log'), stream, transform, options)
  }
}

export default DyoNodeService
