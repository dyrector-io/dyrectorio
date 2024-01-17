import { Injectable } from '@nestjs/common'
import { Storage } from '@prisma/client'
import EncryptionService from 'src/services/encryption.service'
import { CreateStorageDto, StorageDetailsDto, StorageDto, UpdateStorageDto } from './storage.dto'

type StorageDetails = Pick<Storage, 'name' | 'description' | 'icon' | 'url' | 'accessKey' | 'secretKey'>

@Injectable()
export default class StorageMapper {
  constructor(private readonly encryptionService: EncryptionService) {}

  listItemToDto(storage: Storage): StorageDto {
    return {
      id: storage.id,
      name: storage.name,
      description: storage.description,
      icon: storage.icon,
      url: storage.url,
    }
  }

  detailsToDto(storage: StorageWithCount): StorageDetailsDto {
    return {
      ...this.listItemToDto(storage),
      public: !storage.accessKey,
      inUse: storage._count.containerConfigs > 0 || storage._count.instanceConfigs > 0,
    }
  }

  detailsToDb(it: CreateStorageDto | UpdateStorageDto): StorageDetails {
    const { public: pub } = it
    delete it.public

    const hasCreds = !!it.accessKey

    return {
      name: it.name,
      description: it.description,
      icon: it.icon ?? null,
      url: it.url,
      accessKey: pub ? null : hasCreds ? this.encryptionService.encrypt(it.accessKey) : undefined,
      secretKey: pub ? null : hasCreds ? this.encryptionService.encrypt(it.secretKey) : undefined,
    }
  }
}

type StorageWithCount = Storage & {
  _count: {
    containerConfigs: number
    instanceConfigs: number
  }
}
