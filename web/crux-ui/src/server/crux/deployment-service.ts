import { Logger } from '@app/logger'
import {
  Deployment,
  DeploymentDetails,
  DeploymentEditEventMessage,
  DeploymentEvent,
  DeploymentEventType,
  DeploymentStatus,
  ImageDeletedMessage,
  Instance,
  InstancesAddedMessage,
  PatchDeployment,
  UpdateDeployment,
  WS_TYPE_IMAGE_DELETED,
  WS_TYPE_INSTANCES_ADDED,
} from '@app/models'
import {
  CreateDeploymentRequest,
  CreateEntityResponse,
  CruxDeploymentClient,
  DeploymentDetailsResponse,
  DeploymentEditEventMessage as ProtoDeploymentEditEventMessage,
  DeploymentEventListResponse,
  DeploymentEventType as ProtoDeploymentEventType,
  DeploymentListResponse,
  DeploymentProgressMessage,
  DeploymentStatus as ProtoDeploymentStatus,
  deploymentStatusToJSON,
  Empty,
  IdRequest,
  InstanceResponse,
  PatchDeploymentRequest,
  ServiceIdRequest,
  UpdateDeploymentRequest,
  UpdateEntityResponse,
} from '@app/models/proto/crux'
import { timestampToUTC } from '@app/utils'
import { WsMessage } from '@app/websockets/common'
import { Identity } from '@ory/kratos-client'
import { GrpcConnection, protomisify, ProtoSubscriptionOptions } from './grpc-connection'
import { containerConfigToDto, explicitContainerConfigToProto, imageToDto } from './image-service'
import { containerStatusToDto } from './node-service'

class DyoDeploymentService {
  private logger = new Logger(DyoDeploymentService.name)

  constructor(private client: CruxDeploymentClient, private identity: Identity) {}

  async getAllByVersionId(verisonId: string): Promise<Deployment[]> {
    const req: IdRequest = {
      id: verisonId,
      accessedBy: this.identity.id,
    }

    const deployments = await protomisify<IdRequest, DeploymentListResponse>(
      this.client,
      this.client.getDeploymentsByVersionId,
    )(IdRequest, req)

    return deployments.data.map(it => {
      return {
        ...it,
        date: timestampToUTC(it.audit.updatedAt),
        status: deploymentStatusToDto(it.status),
      }
    })
  }

  async getById(id: string): Promise<DeploymentDetails> {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    const res = await protomisify<IdRequest, DeploymentDetailsResponse>(this.client, this.client.getDeploymentDetails)(
      IdRequest,
      req,
    )

    return {
      ...res,
      versionId: res.productVersionId,
      status: deploymentStatusToDto(res.status),
      updatedAt: timestampToUTC(res.audit.updatedAt ?? res.audit.createdAt),
      instances: res.instances.map(it => instanceToDto(it)),
    }
  }

  async getEvents(id: string): Promise<DeploymentEvent[]> {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    const res = await protomisify<IdRequest, DeploymentEventListResponse>(this.client, this.client.getDeploymentEvents)(
      IdRequest,
      req,
    )

    return res.data.map(it => {
      const type = deploymentEventTypeToDto(it.type)
      return {
        type,
        createdAt: timestampToUTC(it.createdAt),
        value:
          type === 'log'
            ? it.log.log
            : type === 'deploymentStatus'
            ? deploymentStatusToDto(it.deploymentStatus)
            : type === 'containerStatus'
            ? {
                instanceId: it.containerStatus.instanceId,
                status: containerStatusToDto(it.containerStatus.status),
              }
            : null,
      }
    })
  }

  async create(versionId: string, nodeId: string): Promise<string> {
    const req: CreateDeploymentRequest = {
      versionId,
      nodeId,
      accessedBy: this.identity.id,
    }

    const res = await protomisify<CreateDeploymentRequest, CreateEntityResponse>(
      this.client,
      this.client.createDeployment,
    )(CreateDeploymentRequest, req)

    return res.id
  }

  async update(id: string, dto: UpdateDeployment): Promise<void> {
    const req = {
      ...dto,
      id,
      accessedBy: this.identity.id,
    } as UpdateDeploymentRequest

    await protomisify<UpdateDeploymentRequest, UpdateEntityResponse>(this.client, this.client.updateDeployment)(
      UpdateDeploymentRequest,
      req,
    )
  }

  async patch(dto: PatchDeployment): Promise<void> {
    const req = {
      ...dto,
      accessedBy: this.identity.id,
      environment: !dto.environment
        ? undefined
        : {
            data: dto.environment,
          },
      instance: !dto.instance
        ? undefined
        : {
            id: dto.instance.instanceId,
            config: explicitContainerConfigToProto(dto.instance.config?.config),
            capabilities: !dto.instance.config?.capabilities
              ? undefined
              : {
                  data: dto.instance.config.capabilities,
                },
            environment: !dto.instance.config?.environment
              ? undefined
              : {
                  data: dto.instance.config.environment,
                },
          },
    } as PatchDeploymentRequest

    await protomisify<PatchDeploymentRequest, UpdateEntityResponse>(this.client, this.client.patchDeployment)(
      PatchDeploymentRequest,
      req,
    )
  }

  async delete(id: string) {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteDeployment)(IdRequest, req)
  }

  startDeployment(
    id: string,
    options: ProtoSubscriptionOptions<DeploymentEvent[]>,
  ): GrpcConnection<DeploymentProgressMessage, DeploymentEvent[]> {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    const transform = (data: DeploymentProgressMessage) => {
      const createdAt = new Date().toUTCString()

      const events: DeploymentEvent[] = []
      events.push({
        type: 'log',
        createdAt,
        value: data.log,
      })

      if (data.instance) {
        events.push({
          type: 'containerStatus',
          createdAt,
          value: {
            instanceId: data.instance.instanceId,
            status: containerStatusToDto(data.instance.status),
          },
        })
      } else if (data.status) {
        events.push({
          type: 'deploymentStatus',
          createdAt,
          value: deploymentStatusToDto(data.status),
        })
      }

      return events
    }

    const stream = () => this.client.startDeployment(IdRequest.fromJSON(req))
    return new GrpcConnection(this.logger.descend('status'), stream, transform, options)
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
          payload: data.instancesCreated.data.map(it => instanceToDto(it)) as InstancesAddedMessage,
        } as WsMessage<DeploymentEditEventMessage>
      } else if (data.imageIdDeleted) {
        return {
          type: WS_TYPE_IMAGE_DELETED,
          payload: {
            imageId: data.imageIdDeleted,
          } as ImageDeletedMessage,
        } as WsMessage<DeploymentEditEventMessage>
      } else {
        this.logger.error('Invalid DeploymentEditEventMessage')
        return undefined
      }
    }

    const stream = () => this.client.subscribeToDeploymentEditEvents(IdRequest.fromJSON(req))
    return new GrpcConnection(this.logger.descend('edit-events'), stream, transform, options)
  }
}

export default DyoDeploymentService

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

export const instanceToDto = (res: InstanceResponse): Instance => {
  return {
    ...res,
    image: imageToDto(res.image),
    status: !res.status ? null : containerStatusToDto(res.status),
    config: containerConfigToDto(res.config),
  } as Instance
}
