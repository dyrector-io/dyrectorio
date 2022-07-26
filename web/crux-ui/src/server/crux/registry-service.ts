import { RegistryType } from './../../models';

import { CreateRegistry, Registry, RegistryDetails, UpdateRegistry } from '@app/models'
import {
  AccessRequest,
  CreateEntityResponse,
  CreateRegistryRequest,
  CruxRegistryClient,
  Empty,
  IdRequest,
  RegistryDetailsResponse,
  RegistryListResponse,
  UpdateEntityResponse,
  UpdateRegistryRequest,
  RegistryType as ProtoRegistryType,
  registryTypeToJSON
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { protomisify } from '@server/crux/grpc-connection'
import { RegistryConnections } from '@server/registry-api/registry-connections'

class DyoRegistryService {
  constructor(
    private client: CruxRegistryClient,
    private identity: Identity,
    private connections: RegistryConnections,
  ) {}

  async getAll(): Promise<Registry[]> {
    const req: AccessRequest = {
      accessedBy: this.identity.id,
    }

    const res = await protomisify<AccessRequest, RegistryListResponse>(this.client, this.client.getRegistries)(
      AccessRequest,
      req,
    )

    return res.data.map(it => {
      return {
        ...it,
        type: this.registryTypeProtoToDto(it.type)
      }
    })
  }

  async create(dto: CreateRegistry): Promise<RegistryDetails> {
    const req: CreateRegistryRequest = this.createDtoToProto(dto)

    const res = await protomisify<CreateRegistryRequest, CreateEntityResponse>(this.client, this.client.createRegistry)(
      CreateRegistryRequest,
      req,
    )

    return {
      ...dto,
      id: res.id,
      updatedAt: timestampToUTC(res.createdAt),
    }
  }

  async update(id: string, dto: UpdateRegistry): Promise<string> {
    const req: UpdateRegistryRequest = {
      ...this.createDtoToProto(dto),
      id,
    }

    this.connections.invalidate(id)

    const res = await protomisify<UpdateRegistryRequest, UpdateEntityResponse>(this.client, this.client.updateRegistry)(
      UpdateRegistryRequest,
      req,
    )

    return timestampToUTC(res.updatedAt)
  }

  async delete(id: string) {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    this.connections.invalidate(id)

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteRegistry)(IdRequest, req)
  }

  async getRegistryDetails(id: string): Promise<RegistryDetails> {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }
    const res = await protomisify<IdRequest, RegistryDetailsResponse>(this.client, this.client.getRegistryDetails)(
      IdRequest,
      req,
    )

    return {
      id: res.id,
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
            _private: !!res.v2.user,
          }
        : res.gitlab
        ? {
            type: 'gitlab',
            ...res.gitlab,
            selfManaged: !!res.gitlab.apiUrl,
          }
        : {
            type: 'github',
            ...res.github,
          }),
    }
  }

  private registryTypeProtoToDto(type: ProtoRegistryType): RegistryType {
    return registryTypeToJSON(type).toLocaleLowerCase() as RegistryType;
  }

  private createDtoToProto(dto: CreateRegistry): CreateRegistryRequest {
    return {
      name: dto.name,
      description: dto.description,
      icon: dto.icon,
      accessedBy: this.identity.id,
      hub:
        dto.type !== 'hub'
          ? null
          : {
              urlPrefix: dto.urlPrefix,
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
              urlPrefix: dto.urlPrefix,
              url: dto.selfManaged ? dto.url : null,
              apiUrl: dto.selfManaged ? dto.apiUrl : null,
            },
      github:
        dto.type !== 'github'
          ? null
          : {
              user: dto.user,
              token: dto.token,
              urlPrefix: dto.urlPrefix,
            },
    }
  }
}

export default DyoRegistryService
