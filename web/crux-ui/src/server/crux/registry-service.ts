import { CreateRegistry, RegistryDetails, RegistryListItem, UpdateRegistry } from '@app/models'
import { Empty } from '@app/models/grpc/protobuf/proto/common'
import {
  CreateEntityResponse,
  CreateRegistryRequest,
  CruxRegistryClient,
  IdRequest,
  RegistryDetailsResponse,
  RegistryListResponse,
  UpdateEntityResponse,
  UpdateRegistryRequest,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { protomisify } from '@server/crux/grpc-connection'
/* eslint-disable import/no-cycle */
import { RegistryConnections } from '@server/registry-api/registry-connections'
import { registryNamespaceToDto, registryNamespaceToGrpc, registryTypeProtoToDto } from './mappers/registry-mappers'

class DyoRegistryService {
  constructor(private client: CruxRegistryClient, private connections: RegistryConnections, private cookie: string) {}

  async getAll(): Promise<RegistryListItem[]> {
    const res = await protomisify<Empty, RegistryListResponse>(
      this.client,
      this.client.getRegistries,
      this.cookie,
    )(Empty, {})

    return res.data.map(it => ({
      ...it,
      type: registryTypeProtoToDto(it.type),
    }))
  }

  async create(dto: CreateRegistry): Promise<RegistryDetails> {
    const req: CreateRegistryRequest = DyoRegistryService.createDtoToProto(dto)

    const res = await protomisify<CreateRegistryRequest, CreateEntityResponse>(
      this.client,
      this.client.createRegistry,
      this.cookie,
    )(CreateRegistryRequest, req)

    return {
      ...dto,
      id: res.id,
      updatedAt: timestampToUTC(res.createdAt),
    }
  }

  async update(id: string, dto: UpdateRegistry): Promise<string> {
    const req: UpdateRegistryRequest = {
      ...DyoRegistryService.createDtoToProto(dto),
      id,
    }

    this.connections.invalidate(id)

    const res = await protomisify<UpdateRegistryRequest, UpdateEntityResponse>(
      this.client,
      this.client.updateRegistry,
      this.cookie,
    )(UpdateRegistryRequest, req)

    return timestampToUTC(res.updatedAt)
  }

  async delete(id: string) {
    const req: IdRequest = {
      id,
    }

    this.connections.invalidate(id)

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteRegistry, this.cookie)(IdRequest, req)
  }

  async getRegistryDetails(id: string): Promise<RegistryDetails> {
    const req: IdRequest = {
      id,
    }
    const res = await protomisify<IdRequest, RegistryDetailsResponse>(
      this.client,
      this.client.getRegistryDetails,
      this.cookie,
    )(IdRequest, req)

    return {
      id: res.id,
      inUse: res.inUse,
      name: res.name,
      description: res.description,
      icon: res.icon ?? null,
      updatedAt: timestampToUTC(res.audit.updatedAt ?? res.audit.createdAt),
      ...(res.hub
        ? {
            type: 'hub',
            ...res.hub,
          }
        : res.v2
        ? {
            type: 'v2',
            ...res.v2,
            private: !!res.v2.user,
          }
        : res.gitlab
        ? {
            type: 'gitlab',
            ...res.gitlab,
            selfManaged: !!res.gitlab.apiUrl,
            namespace: registryNamespaceToDto(res.gitlab.namespace),
          }
        : res.github
        ? {
            type: 'github',
            ...res.github,
            namespace: registryNamespaceToDto(res.github.namespace),
          }
        : res.unchecked
        ? {
            type: 'unchecked',
            ...res.unchecked,
          }
        : {
            type: 'google',
            ...res.google,
            private: !!res.google.user,
          }),
    }
  }

  private static createDtoToProto(dto: CreateRegistry): CreateRegistryRequest {
    return {
      name: dto.name,
      description: dto.description,
      icon: dto.icon,
      hub:
        dto.type !== 'hub'
          ? null
          : {
              imageNamePrefix: dto.imageNamePrefix,
            },
      v2:
        dto.type !== 'v2'
          ? null
          : {
              url: dto.url,
              user: dto.user,
              token: dto.token,
            },
      gitlab:
        dto.type !== 'gitlab'
          ? null
          : {
              user: dto.user,
              token: dto.token,
              imageNamePrefix: dto.imageNamePrefix,
              url: dto.selfManaged ? dto.url : null,
              apiUrl: dto.selfManaged ? dto.apiUrl : null,
              namespace: registryNamespaceToGrpc(dto.namespace),
            },
      github:
        dto.type !== 'github'
          ? null
          : {
              user: dto.user,
              token: dto.token,
              imageNamePrefix: dto.imageNamePrefix,
              namespace: registryNamespaceToGrpc(dto.namespace),
            },
      google:
        dto.type !== 'google'
          ? null
          : {
              url: dto.url,
              imageNamePrefix: dto.imageNamePrefix,
              user: dto.user,
              token: dto.token,
            },
      unchecked:
        dto.type !== 'unchecked'
          ? null
          : {
              url: dto.url,
            },
    }
  }
}

export default DyoRegistryService
