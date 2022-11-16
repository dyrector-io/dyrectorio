/* eslint-disable no-await-in-loop, no-constant-condition */
import { PrismaClient } from '@prisma/client'
import PrismaService from 'src/services/prisma.service'
import { Timestamp } from 'src/grpc/google/protobuf/timestamp'

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

export const collectChildVersionIds = async (prisma: PrismaService, versionId: string): Promise<string[]> => {
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

/**
 * @param recoveryLink
 * @returns [flow, token]
 */
export const disassembleKratosRecoveryUrl = (recoveryLink: string): [string, string] => {
  const url = new URL(recoveryLink)
  const flow = url.searchParams.get('flow')
  const token = url.searchParams.get('token')
  return [flow, token]
}

export const toTimestamp = (date: Date): Timestamp => {
  const seconds = date.getTime() / 1_000
  const nanos = (date.getTime() % 1_000) * 1_000_000
  return { seconds, nanos }
}

export const typedQuery =
  <T>() =>
  <U extends T>(query: U): U =>
    query
