import { Injectable } from '@nestjs/common'
import { Storage } from '@prisma/client'
import { StorageDetailsDto, StorageDto } from './storage.dto'

@Injectable()
export default class StorageMapper {
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
      accessKey: storage.accessKey,
      secretKey: storage.secretKey,
      inUse: storage._count.containerConfigs > 0 || storage._count.instanceConfigs > 0,
    }
  }
}

type StorageWithCount = Storage & {
  _count: {
    containerConfigs: number
    instanceConfigs: number
  }
}
