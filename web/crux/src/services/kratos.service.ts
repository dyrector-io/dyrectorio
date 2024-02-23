import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Configuration, FrontendApi, Identity, IdentityApi, Session } from '@ory/kratos-client'
import { AxiosResponse } from 'axios'
import { randomUUID } from 'crypto'
import { setDefaultResultOrder } from 'dns'
import http from 'http'
import { IdentityTraits, KRATOS_IDENTITY_SCHEMA, KratosInvitation } from 'src/domain/identity'
import { productionEnvironment } from 'src/shared/config'
import { KRATOS_LIST_PAGE_SIZE } from 'src/shared/const'

type KratosListHeaders = {
  link?: string
}

const KRATOS_LIST_REL_NEXT = '; rel="next"'

@Injectable()
export default class KratosService {
  private identity: IdentityApi

  private frontend: FrontendApi

  constructor(config: ConfigService) {
    const dnsResultOrder = config.get<string>('DNS_DEFAULT_RESULT_ORDER')
    if (dnsResultOrder) {
      setDefaultResultOrder(dnsResultOrder === 'ipv4first' ? 'ipv4first' : 'verbatim')
    } else if (!productionEnvironment(config)) {
      setDefaultResultOrder('ipv4first')
    }

    this.identity = new IdentityApi(new Configuration({ basePath: config.get<string>('KRATOS_ADMIN_URL') }))
    this.frontend = new FrontendApi(new Configuration({ basePath: config.get<string>('KRATOS_URL') }))
  }

  async getIdentityByEmail(email: string): Promise<Identity> {
    const identities = await this.identity.listIdentities({
      credentialsIdentifier: email,
    })

    return identities.data.find(user => {
      const traits = user.traits as IdentityTraits
      return traits.email === email
    })
  }

  async getIdentitiesByIds(identityIds: Set<string>): Promise<Map<string, Identity>> {
    const ids: string[] = Array.from(identityIds.keys())

    const result: Map<string, Identity> = new Map()

    let identities: Pick<AxiosResponse<Identity[]>, 'data' | 'headers'> = null
    do {
      if (!identities) {
        // eslint-disable-next-line no-await-in-loop
        identities = await this.identity.listIdentities({
          pageSize: KRATOS_LIST_PAGE_SIZE,
          ids,
        })
      } else {
        const headers = identities.headers as KratosListHeaders

        const nextRel = headers.link
          ?.split(',')
          ?.find(it => it.endsWith(KRATOS_LIST_REL_NEXT))
          ?.trim()
        if (!nextRel) {
          break
        }

        const nextLink = nextRel.substring(1, nextRel.length - KRATOS_LIST_REL_NEXT.length - 1)
        if (!nextLink) {
          break
        }

        const url = new URL(nextLink)

        const pageToken = url.searchParams.get('page_token')
        const pageSize = Number.parseInt(url.searchParams.get('page_size'), 10)
        // eslint-disable-next-line no-await-in-loop
        identities = await this.identity.listIdentities({
          pageToken,
          pageSize,
          ids,
        })
      }

      identities.data.forEach(it => {
        const { id } = it

        result.set(id, it)
        identityIds.delete(id)
      })
    } while (identityIds.size > 0)

    return result
  }

  async getSessionsById(id: string, activeOnly?: boolean): Promise<Session[]> {
    const sessions = await this.identity.listIdentitySessions({
      id,
      active: activeOnly,
    })
    return sessions.data ?? []
  }

  async getSessionsByIds(ids: string[], activeOnly?: boolean): Promise<Map<string, Session[]>> {
    const data = await Promise.all(
      ids.map(async (it: string): Promise<[string, Session[]]> => {
        const sessions = await this.getSessionsById(it, activeOnly)
        return [it, sessions]
      }),
    )

    return new Map(data)
  }

  async createUser(traits: IdentityTraits): Promise<Identity> {
    const res = await this.identity.createIdentity({
      createIdentityBody: {
        schema_id: KRATOS_IDENTITY_SCHEMA,
        traits,
        verifiable_addresses: [
          {
            id: randomUUID(),
            status: 'completed',
            value: traits.email,
            verified: true,
            via: 'email',
          },
        ],
      },
    })

    return res.data
  }

  async createInvitation(identity: Identity): Promise<KratosInvitation> {
    const res = await this.identity.createRecoveryCodeForIdentity({
      createRecoveryCodeForIdentityBody: {
        identity_id: identity.id,
        expires_in: '12h',
      },
    })

    const url = new URL(res.data.recovery_link)

    return {
      flow: url.searchParams.get('flow'),
      code: res.data.recovery_code,
    }
  }

  async getIdentityById(id: string): Promise<Identity> {
    const res = await this.identity.getIdentity({
      id,
    })

    return res.data
  }

  async getSessionByCookie(cookie: string): Promise<Session> {
    const req = await this.frontend.toSession({
      cookie,
    })
    return req.data
  }

  async enableOnboarding(userId: string): Promise<void> {
    await this.identity.patchIdentity({
      id: userId,
      jsonPatch: [
        {
          op: 'remove',
          path: '/metadata_public/disableOnboarding',
        },
      ],
    })
  }

  async disableOnboarding(userId: string): Promise<void> {
    await this.identity.patchIdentity({
      id: userId,
      jsonPatch: [
        {
          op: 'add',
          path: '/metadata_public/disableOnboarding',
          value: true,
        },
      ],
    })
  }
}

export const hasKratosSession = (req: http.IncomingMessage): boolean =>
  req.headers.cookie?.includes('ory_kratos_session=')
