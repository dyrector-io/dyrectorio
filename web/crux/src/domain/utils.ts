/* eslint-disable no-await-in-loop, no-constant-condition */
import { Prisma, PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'
import { JsonNull } from 'prisma'
import { MonoTypeOperatorFunction, Observer, Subject, Subscription, TapObserver, concatMap, of, pipe, tap } from 'rxjs'
import { Timestamp } from 'src/grpc/google/protobuf/timestamp'

export type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

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

export const fromTimestamp = (timestamp: Timestamp): Date => {
  if (!timestamp) {
    return null
  }

  const json = Timestamp.fromJSON(timestamp)
  let millis = json.seconds * 1_000
  millis += json.nanos / 1_000_000
  return new Date(millis)
}

export const typedQuery =
  <T>() =>
  <U extends T>(query: U): U =>
    query

export const toPrismaJson = <T>(val: T): T | JsonNull => {
  if (!val) {
    return Prisma.JsonNull
  }

  return val
}

export const generateNonce = () => randomBytes(128).toString('hex')

export const tapOnce = <T>(
  observerOrNext?: Partial<TapObserver<T>> | ((value: T) => void),
): MonoTypeOperatorFunction<T> =>
  pipe(concatMap((it, index) => (index === 0 ? of(it).pipe(tap(observerOrNext)) : of(it))))

export class BufferedSubject<T> extends Subject<T> {
  private buffer: T[] = []

  override next(value: T): void {
    if (this.observed) {
      super.next(value)
      return
    }

    this.buffer.push(value)
  }

  override subscribe(observerOrNext?: Partial<Observer<T>> | ((value: T) => void)): Subscription
  override subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription {
    const sub = super.subscribe(next, error, complete)

    this.buffer.forEach(it => super.next(it))
    this.buffer = []

    return sub
  }
}

export const stripProtocol = (url: string) => {
  const parsed = new URL(url)
  return `${parsed.host}${parsed.pathname !== "/" ? parsed.pathname : ''}`
}
