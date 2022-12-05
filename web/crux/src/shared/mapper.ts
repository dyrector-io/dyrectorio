import { Prisma, VersionTypeEnum } from '@prisma/client'
import { JsonNull } from 'prisma'
import { VersionType, versionTypeFromJSON } from 'src/grpc/protobuf/proto/crux'

export const toPrismaJson = <T>(val: T): T | JsonNull => {
  if (!val) {
    return Prisma.JsonNull
  }

  return val
}

export const versionTypeToGrpc = (type: VersionTypeEnum): VersionType => versionTypeFromJSON(type.toUpperCase())
