/* eslint-disable no-await-in-loop, no-constant-condition */
import { PrismaClient } from '@prisma/client'
import { Timestamp } from 'src/grpc/google/protobuf/timestamp'
import * as Long from 'long'

export type PrismaTransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>

export const collectParentVersionIds = async (
  prisma: PrismaTransactionClient,
  versionId: string,
): Promise<string[]> => {
  const result = []

  let target = versionId
  while (true) {
    const parent = await prisma.versionsOnParentVersion.findFirst({
      select: {
        parentVersionId: true,
      },
      where: {
        versionId: target,
      },
    })

    target = parent?.parentVersionId
    if (!target) {
      return result
    }

    result.push(target)
  }
}

export const collectChildVersionIds = async (prisma: PrismaTransactionClient, versionId: string): Promise<string[]> => {
  const result = []

  let targets = [versionId]
  while (true) {
    const children = await prisma.versionsOnParentVersion.findMany({
      select: {
        versionId: true,
      },
      where: {
        parentVersionId: {
          in: targets,
        },
      },
    })

    if (children.length < 1) {
      return result
    }

    targets = children.map(it => it.versionId)
    result.concat(targets)
  }
}

export const toTimestamp = (date: Date): Timestamp => {
  const seconds = date.getTime() / 1_000
  const nanos = (date.getTime() % 1_000) * 1_000_000
  return { seconds, nanos }
}

export const timestampToISO = (timestamp: Timestamp): string => {
  if (!timestamp) {
    return null
  }

  return new Date(
    (Long.isLong(timestamp.seconds) ? timestamp.seconds.toNumber() : timestamp.seconds) * 1_000 +
      (timestamp.nanos ? timestamp.nanos / 1_000_000 : 0),
  ).toISOString()
}

export const typedQuery =
  <T>() =>
  <U extends T>(query: U): U =>
    query
