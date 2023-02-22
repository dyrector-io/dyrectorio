import { Logger } from '@app/logger'
import {
  CreateDeployment,
  Deployment,
  DeploymentByVersion,
  DeploymentDetails,
  DeploymentEditEventMessage,
  DeploymentEvent,
  DeploymentStatus,
  ImageDeletedMessage,
  InstancesAddedMessage,
  PatchDeployment,
  UpdateDeployment,
  WS_TYPE_IMAGE_DELETED,
  WS_TYPE_INSTANCES_ADDED,
} from '@app/models'
import { Empty, ListSecretsResponse } from '@app/models/grpc/protobuf/proto/common'
import {
  CreateDeploymentRequest,
  CreateEntityResponse,
  CruxDeploymentClient,
  DeploymentDetailsResponse,
  DeploymentEditEventMessage as ProtoDeploymentEditEventMessage,
  DeploymentEventListResponse,
  DeploymentListByVersionResponse,
  DeploymentListResponse,
  DeploymentListSecretsRequest,
  DeploymentProgressMessage,
  IdRequest,
  PatchDeploymentRequest,
  ServiceIdRequest,
  UpdateDeploymentRequest,
  UpdateEntityResponse,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { WsMessage } from '@app/websockets/common'
import { GrpcConnection, protomisify, ProtoSubscriptionOptions } from './grpc-connection'
import {
  deploymentEventTypeToDto,
  deploymentStatusToDto,
  instanceContainerConfigToProto,
  instanceToDto,
} from './mappers/deployment-mappers'
import { containerStateToDto, nodeStatusToDto } from './mappers/node-mappers'
import { versionTypeToDyo } from './mappers/version-mappers'

class DyoDeploymentService {
  private logger = new Logger(DyoDeploymentService.name)

  constructor(private client: CruxDeploymentClient, private cookie: string) {}

  async getAll(): Promise<Deployment[]> {
    const deployments = await protomisify<Empty, DeploymentListResponse>(
      this.client,
      this.client.getDeploymentList,
      this.cookie,
    )(Empty, {})

    return deployments.data.map(it => ({
      ...it,
      status: deploymentStatusToDto(it.status),
      updatedAt: timestampToUTC(it.updatedAt),
      type: versionTypeToDyo(it.versionType),
    }))
  }

  async getAllByVersionId(verisonId: string): Promise<DeploymentByVersion[]> {
    const req: IdRequest = {
      id: verisonId,
    }

    const deployments = await protomisify<IdRequest, DeploymentListByVersionResponse>(
      this.client,
      this.client.getDeploymentsByVersionId,
      this.cookie,
    )(IdRequest, req)

    return deployments.data.map(it => ({
      ...it,
      date: timestampToUTC(it.audit.updatedAt),
      status: deploymentStatusToDto(it.status),
      nodeStatus: nodeStatusToDto(it.nodeStatus),
    }))
  }

  async getById(id: string): Promise<DeploymentDetails> {
    const req: IdRequest = {
      id,
    }

    const res = await protomisify<IdRequest, DeploymentDetailsResponse>(
      this.client,
      this.client.getDeploymentDetails,
      this.cookie,
    )(IdRequest, req)

    return {
      ...res,
      versionId: res.productVersionId,
      status: deploymentStatusToDto(res.status),
      publicKey: res?.publicKey || null,
      updatedAt: timestampToUTC(res.audit.updatedAt ?? res.audit.createdAt),
      instances: res.instances.map(it => instanceToDto(it)),
    }
  }

  async getEvents(id: string): Promise<[DeploymentStatus, DeploymentEvent[]]> {
    const req: IdRequest = {
      id,
    }

    const res = await protomisify<IdRequest, DeploymentEventListResponse>(
      this.client,
      this.client.getDeploymentEvents,
      this.cookie,
    )(IdRequest, req)

    const data = res.data.map(it => {
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
                state: containerStateToDto(it.containerStatus.state),
              }
            : null,
      }
    })
    return [deploymentStatusToDto(res.status), data]
  }

  async getSecretsList(deploymentId: string, instanceId: string): Promise<ListSecretsResponse> {
    const req: DeploymentListSecretsRequest = {
      id: deploymentId,
      instanceId,
    }

    const res = await protomisify<DeploymentListSecretsRequest, ListSecretsResponse>(
      this.client,
      this.client.getDeploymentSecrets,
      this.cookie,
    )(DeploymentListSecretsRequest, req)

    return res
  }

  async create(versionId: string, deployment: CreateDeployment): Promise<string> {
    const req: CreateDeploymentRequest = {
      ...deployment,
      versionId,
    }

    const res = await protomisify<CreateDeploymentRequest, CreateEntityResponse>(
      this.client,
      this.client.createDeployment,
      this.cookie,
    )(CreateDeploymentRequest, req)

    return res.id
  }

  async update(id: string, dto: UpdateDeployment): Promise<void> {
    const req = {
      ...dto,
      id,
    } as UpdateDeploymentRequest

    await protomisify<UpdateDeploymentRequest, UpdateEntityResponse>(
      this.client,
      this.client.updateDeployment,
      this.cookie,
    )(UpdateDeploymentRequest, req)
  }

  async patch(dto: PatchDeployment): Promise<void> {
    const req: PatchDeploymentRequest = {
      ...dto,
      environment: !dto.environment
        ? undefined
        : {
            data: dto.environment,
          },
      instance: !dto.instance
        ? undefined
        : {
            id: dto.instance.instanceId,
            config: instanceContainerConfigToProto(dto.instance.config),
            resetSection: dto.instance?.resetSection,
          },
    }

    await protomisify<PatchDeploymentRequest, UpdateEntityResponse>(
      this.client,
      this.client.patchDeployment,
      this.cookie,
    )(PatchDeploymentRequest, req)
  }

  async delete(id: string) {
    const req: IdRequest = {
      id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteDeployment, this.cookie)(IdRequest, req)
  }

  async startDeployment(id: string): Promise<void> {
    const req: IdRequest = {
      id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.startDeployment, this.cookie)(IdRequest, req)
  }

  subscribeToDeploymentEvents(id: string, options?: ProtoSubscriptionOptions<DeploymentEvent[]>) {
    const req: IdRequest = {
      id,
    }

    const stream = () => this.client.subscribeToDeploymentEvents(IdRequest.fromJSON(req))
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
          payload: data.instancesCreated.data.map(it => instanceToDto(it)) as InstancesAddedMessage,
        } as WsMessage<DeploymentEditEventMessage>
      }

      if (data.imageIdDeleted) {
        return {
          type: WS_TYPE_IMAGE_DELETED,
          payload: {
            imageId: data.imageIdDeleted,
          } as ImageDeletedMessage,
        } as WsMessage<DeploymentEditEventMessage>
      }

      this.logger.error('Invalid DeploymentEditEventMessage')
      return null
    }

    const stream = () => this.client.subscribeToDeploymentEditEvents(IdRequest.fromJSON(req))
    return new GrpcConnection(this.logger.descend('edit-events'), stream, transform, options)
  }

  async copyDeployment(id: string, overwrite: boolean): Promise<string> {
    const req = {
      id,
    } as IdRequest

    const grpcCall = overwrite ? this.client.copyDeploymentUnsafe : this.client.copyDeploymentSafe
    const res = await protomisify<IdRequest, CreateEntityResponse>(this.client, grpcCall, this.cookie)(IdRequest, req)

    return res.id
  }

  static transformDeploymentEvents(data: DeploymentProgressMessage): DeploymentEvent[] {
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
          state: containerStateToDto(data.instance.state),
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
}

export default DyoDeploymentService
