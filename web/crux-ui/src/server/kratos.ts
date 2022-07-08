import { HEADER_SET_COOKIE } from '@app/const'
import { ServiceStatus } from '@app/models'
import { Configuration, Identity, MetadataApi, Session, V0alpha2Api } from '@ory/kratos-client'
import { AxiosResponse } from 'axios'
import http from 'http'
import { NextApiRequest, NextPageContext } from 'next'
import { missingParameter } from './error-middleware'

const config = new Configuration({ basePath: process.env.KRATOS_URL })
const kratos = new V0alpha2Api(config)

export const getKratosServiceStatus = async (): Promise<ServiceStatus> => {
  const meta = new MetadataApi(config)

  try {
    let res = await meta.isReady()
    if (res.status === 200) {
      return 'operational'
    }

    res = await meta.isAlive()
    if (res.status === 200) {
      return 'disrupted'
    }
  } catch {}

  return 'unavailable'
}

export const userVerified = (user: Identity) => {
  const email = user.traits.email as string
  const verifiable = user.verifiable_addresses ?? []
  return verifiable.find(it => it.value === email)?.verified
}

export const cookieOf = (request: http.IncomingMessage): string => {
  const cookie = request.headers.cookie
  if (!cookie) {
    throw missingParameter('cookie')
  }

  return cookie
}

export const obtainKratosSession = async (request: http.IncomingMessage): Promise<Session> => {
  const cookie = request.headers.cookie

  try {
    if (!cookie) {
      return null
    }

    const res = await kratos.toSession(undefined, cookie)
    return res.data
  } catch {
    return null
  }
}

export const sessionOf = (nextRequest: NextApiRequest): Session => {
  const req = nextRequest as IncomingMessageWithSession

  if (!req.session) {
    throw new Error(`Session not found for ${req.url}. Probably withMiddlewares() call is missing on the endpoint?`)
  }

  return req.session
}

export const sessionOfContext = (context: NextPageContext): Session => {
  const cruxContext = context.req as IncomingMessageWithSession
  return cruxContext.session
}

export const forwardCookie = (context: NextPageContext, resOrCookie: AxiosResponse | string | undefined) =>
  forwardCookieToResponse(context.res, resOrCookie)

export const forwardCookieToResponse = (res: http.OutgoingMessage, resOrCookie: AxiosResponse | string | undefined) => {
  const cookie =
    typeof resOrCookie === 'string' || undefined ? (resOrCookie as string) : resOrCookie.headers[HEADER_SET_COOKIE]
  if (cookie) {
    res.setHeader(HEADER_SET_COOKIE, cookie)
  } else {
    res.removeHeader(HEADER_SET_COOKIE)
  }
}

export type IncomingMessageWithSession = http.IncomingMessage & {
  session?: Session
}

export const assambleKratosRecoveryUrl = (flow: string, token: string): string =>
  `${process.env.KRATOS_URL}/self-service/recovery?flow=${flow}&token=${token}`

export default kratos
