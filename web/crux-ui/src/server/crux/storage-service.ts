import { CreateStorage, Storage, StorageListItem, StorageOption, UpdateStorage } from '@app/models'
import { Empty } from '@app/models/grpc/protobuf/proto/common'
import {
  CreateEntityResponse,
  CreateStorageRequest,
  CruxStorageClient,
  IdRequest,
  StorageDetailsResponse,
  StorageListResponse,
  StorageOptionListResponse,
  UpdateEntityResponse,
  UpdateStorageRequest,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { protomisify } from '@server/crux/grpc-connection'
/* eslint-disable import/no-cycle */

class DyoStorageService {
  constructor(private client: CruxStorageClient, private cookie: string) {}

  async getAll(): Promise<StorageListItem[]> {
    const res = await protomisify<Empty, StorageListResponse>(
      this.client,
      this.client.getStorages,
      this.cookie,
    )(Empty, {})

    return res.data.map(it => ({
      ...it,
    }))
  }

  async create(dto: CreateStorage): Promise<Storage> {
    const req: CreateStorageRequest = {
      ...dto,
    }

    const res = await protomisify<CreateStorageRequest, CreateEntityResponse>(
      this.client,
      this.client.createStorage,
      this.cookie,
    )(CreateStorageRequest, req)

    return {
      ...dto,
      id: res.id,
      inUse: false,
    }
  }

  async update(id: string, dto: UpdateStorage): Promise<string> {
    const req: UpdateStorageRequest = {
      ...dto,
      id,
    }

    const res = await protomisify<UpdateStorageRequest, UpdateEntityResponse>(
      this.client,
      this.client.updateStorage,
      this.cookie,
    )(UpdateStorageRequest, req)

    return timestampToUTC(res.updatedAt)
  }

  async delete(id: string) {
    const req: IdRequest = {
      id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteStorage, this.cookie)(IdRequest, req)
  }

  async getStorageDetails(id: string): Promise<Storage> {
    const req: IdRequest = {
      id,
    }
    const res = await protomisify<IdRequest, StorageDetailsResponse>(
      this.client,
      this.client.getStorageDetails,
      this.cookie,
    )(IdRequest, req)

    return res
  }

  async getOptions(): Promise<StorageOption[]> {
    const res = await protomisify<Empty, StorageOptionListResponse>(
      this.client,
      this.client.getStorageOptions,
      this.cookie,
    )(Empty, {})

    return res.data.map(it => ({
      ...it,
    }))
  }
}

export default DyoStorageService
