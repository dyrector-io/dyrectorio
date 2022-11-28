import { Prisma, VersionTypeEnum } from '@prisma/client'
import { JsonObject } from 'prisma'
import { VersionType, versionTypeFromJSON } from 'src/grpc/protobuf/proto/crux'

export const toPrismaJson = val => {
  if (!val) {
    return Prisma.JsonNull
  }

  return val as JsonObject
}

export const versionTypeToGrpc = (type: VersionTypeEnum): VersionType => versionTypeFromJSON(type.toUpperCase())
