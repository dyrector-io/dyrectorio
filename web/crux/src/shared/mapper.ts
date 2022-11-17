import { Prisma } from '@prisma/client'
import { JsonObject } from 'prisma'

// eslint-disable-next-line import/prefer-default-export
export const toPrismaJson = val => {
  if (!val) {
    return Prisma.JsonNull
  }

  return val as JsonObject
}
