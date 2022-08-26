import { CreateVersion, IncreaseVersion, UpdateVersion, Version, VersionDetails, VersionType } from '@app/models'
import {
  CreateEntityResponse,
  CreateVersionRequest,
  CruxProductVersionClient,
  Empty,
  IdRequest,
  IncreaseVersionRequest,
  UpdateEntityResponse,
  UpdateVersionRequest,
  VersionDetailsResponse,
  VersionType as ProtoVersionType,
  versionTypeFromJSON,
  versionTypeToJSON,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { protomisify } from '@server/crux/grpc-connection'
import { deploymentStatusToDto } from './deployment-service'
import { containerConfigToDto } from './image-service'

class DyoVersionService {
  constructor(private client: CruxProductVersionClient, private identity: Identity) {}

  async getById(id: string): Promise<VersionDetails> {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    const res = await protomisify<IdRequest, VersionDetailsResponse>(this.client, this.client.getVersionDetails)(
      IdRequest,
      req,
    )

    return {
      ...res,
      type: versionTypeToDyo(res.type),
      updatedAt: timestampToUTC(res.audit.updatedAt),
      deployments: res.deployments.map(it => {
        return {
          ...it,
          date: timestampToUTC(it.audit.updatedAt),
          status: deploymentStatusToDto(it.status),
        }
      }),
      images: res.images.map(it => {
        return {
          ...it,
          config: containerConfigToDto(it.config),
        }
      }),
    }
  }

  async create(productId: string, dto: CreateVersion): Promise<Version> {
    const req: CreateVersionRequest = {
      ...dto,
      productId,
      type: versionTypeToProto(dto.type),
      accessedBy: this.identity.id,
    }

    const version = await protomisify<CreateVersionRequest, CreateEntityResponse>(
      this.client,
      this.client.createVersion,
    )(CreateVersionRequest, req)

    return {
      ...dto,
      id: version.id,
      increasable: dto.type === 'incremental',
      default: false,
      updatedAt: timestampToUTC(version.createdAt),
    }
  }

  async update(versionId: string, dto: UpdateVersion): Promise<string> {
    const req: UpdateVersionRequest = {
      ...dto,
      id: versionId,
      accessedBy: this.identity.id,
    }

    const res = await protomisify<UpdateVersionRequest, UpdateEntityResponse>(this.client, this.client.updateVersion)(
      UpdateVersionRequest,
      req,
    )

    return timestampToUTC(res.updatedAt)
  }

  async increase(versionId: string, dto: IncreaseVersion): Promise<Version> {
    const req: IncreaseVersionRequest = {
      ...dto,
      id: versionId,
      accessedBy: this.identity.id,
    }

    const res = await protomisify<IncreaseVersionRequest, CreateEntityResponse>(
      this.client,
      this.client.increaseVersion,
    )(IncreaseVersionRequest, req)

    return {
      ...dto,
      default: false,
      type: 'incremental',
      increasable: true,
      updatedAt: timestampToUTC(res.createdAt),
      id: res.id,
    }
  }

  async setDefault(versionId: string): Promise<void> {
    const req: IdRequest = {
      id: versionId,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.setDefaultVersion)(IdRequest, req)
  }

  async delete(id: string): Promise<void> {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteVersion)(IdRequest, req)
  }
}

export default DyoVersionService

export const versionTypeToProto = (type: VersionType): ProtoVersionType => {
  return versionTypeFromJSON(type.toUpperCase())
}

export const versionTypeToDyo = (type: ProtoVersionType): VersionType => {
  return versionTypeToJSON(type).toLowerCase() as VersionType
}
