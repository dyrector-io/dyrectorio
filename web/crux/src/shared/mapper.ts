import { Prisma } from '@prisma/client'
import { JsonNull } from 'prisma'

// eslint-disable-next-line import/prefer-default-export
export const toPrismaJson = <T>(val: T): T | JsonNull => {
  if (!val) {
    return Prisma.JsonNull
  }

  return val
}
