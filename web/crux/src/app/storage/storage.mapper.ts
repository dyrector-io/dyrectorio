import { Injectable } from '@nestjs/common'
import { Storage } from '@prisma/client'
import { AuditResponse, StorageDetailsResponse, StorageResponse } from 'src/grpc/protobuf/proto/crux'

@Injectable()
export default class StorageMapper {
  listItemToProto(registry: Storage): StorageResponse {
    return {
      ...registry,
      audit: AuditResponse.fromJSON(registry),
    }
  }

  detailsToProto(registry: StorageWithCount): StorageDetailsResponse {
    return {
      ...registry,
      inUse: registry._count.containerConfigs > 0 || registry._count.instanceConfigs > 0,
      icon: registry.icon ?? null,
      audit: AuditResponse.fromJSON(registry),
    }
  }
}

type StorageWithCount = Storage & {
  _count: {
    containerConfigs: number
    instanceConfigs: number
  }
}
