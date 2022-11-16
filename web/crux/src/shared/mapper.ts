import { Prisma } from '@prisma/client'
import { JsonObject } from 'prisma'

export const toPrismaJson = val => {
  if (!val) {
    return Prisma.JsonNull
  }

  return val as JsonObject
}
