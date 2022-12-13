import { HEADER_SET_COOKIE } from '@app/const'
import { missingParameter } from '@app/error-responses'
import { DEFAULT_SERVICE_INFO, IdentityAdminMetadata, ServiceInfo } from '@app/models'
import { Configuration, Identity, MetadataApi, Session, V0alpha2Api } from '@ory/kratos-client'
import http from 'http'
import { NextApiRequest, NextPageContext } from 'next'

const config = new Configuration({ basePath: process.env.KRATOS_URL })
const kratos = new V0alpha2Api(config)

const kratosAdmin = new V0alpha2Api(
  new Configuration({
    basePath: process.env.KRATOS_ADMIN_URL,
  }),
)

const meta = new MetadataApi(
  new Configuration({
    basePath: process.env.KRATOS_ADMIN_URL,
  }),
)

export const identityHasNoPassword = async (session: Session): Promise<boolean> => {
  const authenticatedWithRecovery = session.authentication_methods?.filter(it => it.method === 'link_recovery')
  if (!authenticatedWithRecovery) {
    return false
  }

  const kratosRes = await kratosAdmin.adminGetIdentity(session.identity.id)
  const identity = kratosRes.data
  const { password: passwordCredentials } = identity.credentials
  if (!passwordCredentials) {
    return false
  }

  const metadata = identity.metadata_admin as IdentityAdminMetadata

  return !!metadata?.noPassword
}

export const identityPasswordSet = async (session: Session): Promise<void> => {
  const identity = (await kratosAdmin.adminGetIdentity(session.identity.id)).data
  const metadata = identity.metadata_admin as IdentityAdminMetadata

  if (metadata) {
    kratosAdmin.adminUpdateIdentity(identity.id, {
      schema_id: identity.schema_id,
      state: identity.state,
      traits: identity.traits,
      metadata_admin: {
        ...metadata,
        noPassword: false,
      },
      metadata_public: identity.metadata_public,
    })
  }
}

export const getKratosServiceStatus = async (): Promise<ServiceInfo> => {
  try {
    if (process.env.KRATOS_ADMIN_URL) {
      const versionRes = await meta.getVersion()

      if (versionRes.status === 200) {
        return {
          status: 'operational',
          version: versionRes.data.version,
        }
      }
    }

    const info: ServiceInfo = {
      status: 'operational',
      version: null,
    }

    const readyRes = await meta.isReady()
    if (readyRes.status !== 200) {
      info.status = 'disrupted'
    }

    const aliveRes = await meta.isAlive()
    if (aliveRes.status !== 200) {
      info.status = 'unavailable'
    }

    return info
  } catch (err) {
    console.error(err)
    return DEFAULT_SERVICE_INFO
  }
}

export const userVerified = (user: Identity) => {
  const email = user.traits.email as string
  const verifiable = user.verifiable_addresses ?? []
  return verifiable.find(it => it.value === email)?.verified
}

export const cookieOf = (request: http.IncomingMessage): string => {
  const { cookie } = request.headers
  if (!cookie) {
    throw missingParameter('cookie')
  }

  return cookie
}

export const obtainKratosSession = async (request: http.IncomingMessage): Promise<Session> => {
  const { cookie } = request.headers

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

export const forwardCookieToResponse = (
  res: http.OutgoingMessage,
  resOrCookie: { headers: any } | string | undefined,
) => {
  const cookie =
    typeof resOrCookie === 'string' || undefined ? (resOrCookie as string) : resOrCookie.headers[HEADER_SET_COOKIE]
  if (cookie) {
    res.setHeader(HEADER_SET_COOKIE, cookie)
  } else {
    res.removeHeader(HEADER_SET_COOKIE)
  }
}

export const forwardCookie = (context: NextPageContext, resOrCookie: { headers: any } | string | undefined) =>
  forwardCookieToResponse(context.res, resOrCookie)

export type IncomingMessageWithSession = http.IncomingMessage & {
  session?: Session
}

export const assambleKratosRecoveryUrl = (flow: string, token: string): string =>
  `${process.env.KRATOS_URL}/self-service/recovery?flow=${flow}&token=${token}`

export default kratos
