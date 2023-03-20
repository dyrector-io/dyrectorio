import { CreateVersion, IncreaseVersion, RegistryType, UpdateVersion, Version, VersionDetails } from '@app/models'
import { Empty } from '@app/models/grpc/protobuf/proto/common'
import {
  CreateEntityResponse,
  CreateVersionRequest,
  CruxProductVersionClient,
  IdRequest,
  IncreaseVersionRequest,
  registryTypeToJSON,
  UpdateEntityResponse,
  UpdateVersionRequest,
  VersionDetailsResponse,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { protomisify } from '@server/crux/grpc-connection'
import { deploymentStatusToDto } from './mappers/deployment-mappers'
import { containerConfigToDto } from './mappers/image-mappers'
import { nodeStatusToDto } from './mappers/node-mappers'
import { versionTypeToDyo, versionTypeToProto } from './mappers/version-mappers'

class DyoVersionService {
  constructor(private client: CruxProductVersionClient, private cookie: string) {}

  async getById(id: string): Promise<VersionDetails> {
    const req: IdRequest = {
      id,
    }

    const res = await protomisify<IdRequest, VersionDetailsResponse>(
      this.client,
      this.client.getVersionDetails,
      this.cookie,
    )(IdRequest, req)

    return {
      ...res,
      type: versionTypeToDyo(res.type),
      updatedAt: timestampToUTC(res.audit.updatedAt),
      deployments: res.deployments.map(it => ({
        ...it,
        date: timestampToUTC(it.audit.updatedAt),
        status: deploymentStatusToDto(it.status),
        nodeStatus: nodeStatusToDto(it.nodeStatus),
      })),
      images: res.images.map(it => ({
        ...it,
        config: containerConfigToDto(it.config),
        createdAt: timestampToUTC(it.createdAt),
        registryType: registryTypeToJSON(it.registryType).toLowerCase() as RegistryType,
      })),
    }
  }

  async create(productId: string, dto: CreateVersion): Promise<Version> {
    const req: CreateVersionRequest = {
      ...dto,
      productId,
      type: versionTypeToProto(dto.type),
    }

    const version = await protomisify<CreateVersionRequest, CreateEntityResponse>(
      this.client,
      this.client.createVersion,
      this.cookie,
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
    }

    const res = await protomisify<UpdateVersionRequest, UpdateEntityResponse>(
      this.client,
      this.client.updateVersion,
      this.cookie,
    )(UpdateVersionRequest, req)

    return timestampToUTC(res.updatedAt)
  }

  async increase(versionId: string, dto: IncreaseVersion): Promise<Version> {
    const req: IncreaseVersionRequest = {
      ...dto,
      id: versionId,
    }

    const res = await protomisify<IncreaseVersionRequest, CreateEntityResponse>(
      this.client,
      this.client.increaseVersion,
      this.cookie,
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
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.setDefaultVersion, this.cookie)(IdRequest, req)
  }

  async delete(id: string): Promise<void> {
    const req: IdRequest = {
      id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteVersion, this.cookie)(IdRequest, req)
  }
}

export default DyoVersionService
