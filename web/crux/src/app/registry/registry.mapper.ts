import { Injectable } from '@nestjs/common'
import { Registry, RegistryTypeEnum } from '@prisma/client'
import {
  AuditResponse,
  RegistryDetailsResponse,
  RegistryResponse,
  RegistryType,
  registryTypeFromJSON,
  registryTypeToJSON,
} from 'src/grpc/protobuf/proto/crux'

@Injectable()
export class RegistryMapper {
  toGrpc(registry: Registry): RegistryResponse {
    return {
      ...registry,
      audit: AuditResponse.fromJSON(registry),
    }
  }

  detailsToGrpc(registry: Registry): RegistryDetailsResponse {
    return {
      ...registry,
      audit: AuditResponse.fromJSON(registry),
      type: this.typeToGrpc(registry.type),
    }
  }

  typeToGrpc(type: RegistryTypeEnum): RegistryType {
    return registryTypeFromJSON(type.toUpperCase())
  }

  typeToDb(type: RegistryType): RegistryTypeEnum {
    return registryTypeToJSON(type).toLowerCase() as RegistryTypeEnum
  }
}
