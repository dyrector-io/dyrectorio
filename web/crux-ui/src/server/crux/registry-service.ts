import { REGISTRY_HUB_URL } from '@app/const'
import { CreateRegistry, Registry, RegistryDetails, RegistryType, UpdateRegistry } from '@app/models'
import {
  AccessRequest,
  CreateEntityResponse,
  CreateRegistryRequest,
  CruxRegistryClient,
  Empty,
  IdRequest,
  RegistryDetailsResponse,
  RegistryListResponse,
  RegistryType as ProtoRegistryType,
  registryTypeFromJSON,
  registryTypeToJSON,
  UpdateEntityResponse,
  UpdateRegistryRequest,
} from '@app/models/proto/crux'
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
      }
    })
  }

  async create(dto: CreateRegistry): Promise<RegistryDetails> {
    const req: CreateRegistryRequest = {
      ...dto,
      type: this.typeToProto(dto.type),
      url: dto.type === 'hub' ? REGISTRY_HUB_URL : dto.url,
      accessedBy: this.identity.id,
    }

    const res = await protomisify<CreateRegistryRequest, CreateEntityResponse>(this.client, this.client.createRegistry)(
      CreateRegistryRequest,
      req,
    )

    return {
      ...dto,
      url: dto.type === 'hub' ? REGISTRY_HUB_URL : dto.url,
      id: res.id,
      updatedAt: timestampToUTC(res.createdAt),
    }
  }

  async update(id: string, dto: UpdateRegistry): Promise<string> {
    const req: UpdateRegistryRequest = {
      ...dto,
      type: this.typeToProto(dto.type),
      url: dto.type === 'hub' ? REGISTRY_HUB_URL : dto.url,
      id,
      accessedBy: this.identity.id,
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
      ...res,
      type: this.typeToDto(res.type),
      updatedAt: timestampToUTC(res.audit.updatedAt ?? res.audit.createdAt),
    }
  }

  private typeToDto(type: ProtoRegistryType): RegistryType {
    return registryTypeToJSON(type).toLocaleLowerCase() as RegistryType
  }

  private typeToProto(type: RegistryType): ProtoRegistryType {
    return registryTypeFromJSON(type.toUpperCase())
  }
}

export default DyoRegistryService
