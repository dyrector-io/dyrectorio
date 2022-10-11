import { Logger } from '@app/logger'
import {
  CreateDeployment,
  Deployment,
  DeploymentByVersion,
  DeploymentDetails,
  DeploymentEditEventMessage,
  DeploymentEvent,
  ImageDeletedMessage,
  InstancesAddedMessage,
  PatchDeployment,
  UpdateDeployment,
  WS_TYPE_IMAGE_DELETED,
  WS_TYPE_INSTANCES_ADDED,
} from '@app/models'
import { ListSecretsResponse } from '@app/models/grpc/protobuf/proto/common'
import {
  AccessRequest,
  CreateDeploymentRequest,
  CreateEntityResponse,
  CruxDeploymentClient,
  DeploymentCheckCopyResponse,
  DeploymentDetailsResponse,
  DeploymentEditEventMessage as ProtoDeploymentEditEventMessage,
  DeploymentEventListResponse,
  DeploymentListByVersionResponse,
  DeploymentListResponse,
  DeploymentListSecretsRequest,
  DeploymentProgressMessage,
  Empty,
  IdRequest,
  PatchDeploymentRequest,
  ServiceIdRequest,
  UpdateDeploymentRequest,
  UpdateEntityResponse,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { WsMessage } from '@app/websockets/common'
import { Identity } from '@ory/kratos-client'
import { GrpcConnection, protomisify, ProtoSubscriptionOptions } from './grpc-connection'
import { deploymentEventTypeToDto, deploymentStatusToDto, instanceToDto } from './mappers/deployment-mappers'
import { explicitContainerConfigToProto } from './mappers/image-mappers'
import { containerStateToDto, nodeStatusToDto } from './mappers/node-mappers'

class DyoDeploymentService {
  private logger = new Logger(DyoDeploymentService.name)

  constructor(private client: CruxDeploymentClient, private identity: Identity) {}

  async getAll(): Promise<Deployment[]> {
    const req: AccessRequest = {
      accessedBy: this.identity.id,
    }

    const deployments = await protomisify<AccessRequest, DeploymentListResponse>(
      this.client,
      this.client.getDeploymentList,
    )(IdRequest, req)

    return deployments.data.map(it => ({
      ...it,
      status: deploymentStatusToDto(it.status),
      updatedAt: timestampToUTC(it.updatedAt),
    }))
  }

  async getAllByVersionId(verisonId: string): Promise<DeploymentByVersion[]> {
    const req: IdRequest = {
      id: verisonId,
      accessedBy: this.identity.id,
    }

    const deployments = await protomisify<IdRequest, DeploymentListByVersionResponse>(
      this.client,
      this.client.getDeploymentsByVersionId,
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
      publicKey: res?.publicKey || null,
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
                state: containerStateToDto(it.containerStatus.state),
              }
            : null,
      }
    })
  }

  async getSecretsList(deploymentId: string, instanceId: string): Promise<ListSecretsResponse> {
    const req: DeploymentListSecretsRequest = {
      id: deploymentId,
      instanceId,
      accessedBy: this.identity.id,
    }

    const res = await protomisify<DeploymentListSecretsRequest, ListSecretsResponse>(
      this.client,
      this.client.getDeploymentSecrets,
    )(DeploymentListSecretsRequest, req)

    return res
  }

  async create(versionId: string, deployment: CreateDeployment): Promise<string> {
    const req: CreateDeploymentRequest = {
      ...deployment,
      versionId,
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
    const req: PatchDeploymentRequest = {
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
            accessedBy: this.identity.id,
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
            secrets: !dto.instance.config?.secrets
              ? undefined
              : {
                  data: dto.instance.config.secrets,
                },
          },
    }

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
      return undefined
    }

    const stream = () => this.client.subscribeToDeploymentEditEvents(IdRequest.fromJSON(req))
    return new GrpcConnection(this.logger.descend('edit-events'), stream, transform, options)
  }

  async checkCopy(id: string): Promise<string | undefined> {
    const req = {
      id,
      accessedBy: this.identity.id,
    } as IdRequest

    const res = await protomisify<IdRequest, DeploymentCheckCopyResponse>(this.client, this.client.checkDeploymentCopy)(
      IdRequest,
      req,
    )

    return res.overwriteId
  }

  async copyDeployment(id: string): Promise<string> {
    const req = {
      id,
      accessedBy: this.identity.id,
    } as IdRequest

    const res = await protomisify<IdRequest, CreateEntityResponse>(this.client, this.client.copyDeployment)(
      IdRequest,
      req,
    )

    return res.id
  }
}

export default DyoDeploymentService
