import { Logger } from '@app/logger'
import {
  DeploymentEditEventMessage,
  DeploymentEvent,
  ImageDeletedMessage,
  InstancesAddedMessage,
  WS_TYPE_IMAGE_DELETED,
  WS_TYPE_INSTANCES_ADDED,
} from '@app/models'
import {
  CruxDeploymentClient,
  DeploymentEditEventMessage as ProtoDeploymentEditEventMessage,
  DeploymentProgressMessage,
  ServiceIdRequest,
} from '@app/models/grpc/protobuf/proto/crux'
import { WsMessage } from '@app/websockets/common'
import { GrpcConnection, ProtoSubscriptionOptions } from './grpc-connection'
import { deploymentStatusToDto, instanceToDto } from './mappers/deployment-mappers'
import { containerStateToDto } from './mappers/node-mappers'

class DyoDeploymentService {
  private logger = new Logger(DyoDeploymentService.name)

  constructor(private client: CruxDeploymentClient, private cookie: string) {}

  subscribeToDeploymentEvents(id: string, options?: ProtoSubscriptionOptions<DeploymentEvent[]>) {
    const req: ServiceIdRequest = {
      id,
    }

    const stream = () => this.client.subscribeToDeploymentEvents(ServiceIdRequest.fromJSON(req))
    return new GrpcConnection(
      this.logger.descend('status'),
      stream,
      DyoDeploymentService.transformDeploymentEvents,
      options,
    )
  }

  subscribeToDeploymentEditEvents(
    id: string,
    options: ProtoSubscriptionOptions<WsMessage<DeploymentEditEventMessage>>,
  ): GrpcConnection<ProtoDeploymentEditEventMessage, WsMessage<DeploymentEditEventMessage>> {
    const req: ServiceIdRequest = {
      id,
    }

    const transform = (data: ProtoDeploymentEditEventMessage) => {
      if (data.instancesCreated) {
        return {
          type: WS_TYPE_INSTANCES_ADDED,
          data: data.instancesCreated.data.map(it => instanceToDto(it)) as InstancesAddedMessage,
        } as WsMessage<DeploymentEditEventMessage>
      }

      if (data.imageIdDeleted) {
        return {
          type: WS_TYPE_IMAGE_DELETED,
          data: {
            imageId: data.imageIdDeleted,
          } as ImageDeletedMessage,
        } as WsMessage<DeploymentEditEventMessage>
      }

      this.logger.error('Invalid DeploymentEditEventMessage')
      return null
    }

    const stream = () => this.client.subscribeToDeploymentEditEvents(ServiceIdRequest.fromJSON(req))
    return new GrpcConnection(this.logger.descend('edit-events'), stream, transform, options)
  }

  static transformDeploymentEvents(data: DeploymentProgressMessage): DeploymentEvent[] {
    const createdAt = new Date().toUTCString()

    const result: DeploymentEvent[] = []
    if (data.log && data.log.length > 0) {
      result.push({
        type: 'log',
        createdAt,
        log: data.log,
      })
    }

    if (data.instance) {
      result.push({
        type: 'container-status',
        createdAt,
        containerState: {
          instanceId: data.instance.instanceId,
          state: containerStateToDto(data.instance.state),
        },
      })
    } else if (data.status) {
      result.push({
        type: 'deployment-status',
        createdAt,
        deploymentStatus: deploymentStatusToDto(data.status),
      })
    }

    return result
  }
}

export default DyoDeploymentService
