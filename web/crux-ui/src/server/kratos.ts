import { ServiceStatus } from '@app/models'
import { Configuration, Identity, MetadataApi, Session, V0alpha2Api } from '@ory/kratos-client'
import http from 'http'
import { NextApiRequest, NextPageContext } from 'next'

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

export default kratos

export type IncomingMessageWithSession = http.IncomingMessage & {
  session?: Session
}
