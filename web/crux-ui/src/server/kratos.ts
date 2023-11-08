import { HEADER_SET_COOKIE } from '@app/const'
import { DEFAULT_SERVICE_INFO, IdentityPublicMetadata, ServiceInfo } from '@app/models'
import {
  Configuration,
  FrontendApi,
  Identity,
  IdentityApi,
  MetadataApi,
  RegistrationFlow,
  Session,
  VerifiableIdentityAddress,
} from '@ory/kratos-client'
import http from 'http'
import { NextApiRequest, NextPageContext } from 'next'

const config = new Configuration({ basePath: process.env.KRATOS_URL })
const kratos = new FrontendApi(config)

const adminConfig = new Configuration({
  basePath: process.env.KRATOS_ADMIN_URL,
})
const identities = new IdentityApi(adminConfig)
const meta = new MetadataApi(adminConfig)

export const identityWasRecovered = (session: Session): string => {
  const metadata = session.identity.metadata_public as IdentityPublicMetadata
  return metadata?.recovered
}

export const identityOnboardingDisabled = (session: Session): boolean => {
  const metadata = session.identity.metadata_public as IdentityPublicMetadata
  return metadata?.disableOnboarding ?? false
}

const updateMetadata = async (session: Session, metadata: Partial<IdentityPublicMetadata>): Promise<void> => {
  const identity = (
    await identities.getIdentity({
      id: session.identity.id,
    })
  ).data

  await identities.updateIdentity({
    id: identity.id,
    updateIdentityBody: {
      schema_id: identity.schema_id,
      state: identity.state,
      traits: identity.traits,
      metadata_admin: identity.metadata_admin,
      metadata_public: {
        ...identity.metadata_public,
        ...metadata,
      },
    },
  })
}

export const identityRecovered = async (session: Session, flowId: string): Promise<void> => {
  await updateMetadata(session, {
    recovered: flowId,
  })
}

export const identityPasswordSet = async (session: Session): Promise<void> => {
  await updateMetadata(session, {
    recovered: null,
  })
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

export const verifiableEmailOfIdentity = (user: Identity): VerifiableIdentityAddress | null => {
  const email = user.traits.email as string
  const verifiable = user.verifiable_addresses ?? []
  return verifiable.find(it => it.value === email)
}

export const userVerified = (user: Identity) => verifiableEmailOfIdentity(user)?.verified

export const flowOfUrl = (url: string): string => new URL(url).searchParams.get('flow')

export const obtainKratosSession = async (cookie: string): Promise<Session> => {
  if (!cookie) {
    return null
  }

  try {
    const res = await kratos.toSession({
      cookie,
    })
    return res.data
  } catch {
    return null
  }
}

export const obtainSessionFromRequest = async (request: http.IncomingMessage): Promise<Session> => {
  const { cookie } = request.headers
  return await obtainKratosSession(cookie)
}

export const obtainSessionFromResponse = async (response: { headers: any }): Promise<Session> => {
  const cookieHeader = response.headers[HEADER_SET_COOKIE] as string | string[]
  if (typeof cookieHeader === 'string') {
    return await obtainKratosSession(cookieHeader)
  }

  const cookie = cookieHeader.find(it => it.startsWith('ory_kratos_session'))
  return await obtainKratosSession(cookie)
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

export type IncomingMessageWithSession = http.IncomingMessage & {
  session?: Session
  cookie?: string
}

export const assambleKratosRecoveryUrl = (flow: string, code: string): string =>
  `${process.env.KRATOS_URL}/self-service/recovery?flow=${flow}&code=${code}`

export const registrationOidcInvalid = (flow: RegistrationFlow) =>
  flow.ui.nodes.some(it => it.group === 'oidc' && it.messages.length > 0)

export default kratos
