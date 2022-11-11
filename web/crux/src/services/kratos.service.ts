import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Configuration, Identity, Session, V0alpha2Api } from '@ory/kratos-client'
import { randomUUID } from 'crypto'
import { IdentityAdminMetadata, IdentityTraits, KRATOS_IDENTITY_SCHEMA } from 'src/shared/model'

const EMAIL = 'email'

@Injectable()
export default class KratosService {
  private kratos: V0alpha2Api

  constructor(private configService: ConfigService) {
    this.kratos = new V0alpha2Api(new Configuration({ basePath: configService.get<string>('KRATOS_ADMIN_URL') }))
  }

  async getIdentityByEmail(email: string): Promise<Identity> {
    const identities = await this.kratos.adminListIdentities()
    return identities.data.find(user => user.traits[EMAIL] === email)
  }

  async getIdentitiesByIds(ids: string[]): Promise<Map<string, Identity>> {
    const identities = await this.kratos.adminListIdentities()
    return new Map(identities.data.filter(it => ids.includes(it.id)).map(it => [it.id, it]))
  }

  async getSessionsById(id: string, activeOnly?: boolean): Promise<Session[]> {
    const sessions = await this.kratos.adminListIdentitySessions(id, undefined, undefined, activeOnly)
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
    const adminMetadata: IdentityAdminMetadata = {
      noPassword: true,
    }

    const res = await this.kratos.adminCreateIdentity({
      schema_id: KRATOS_IDENTITY_SCHEMA,
      metadata_admin: adminMetadata,
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
    })

    return res.data
  }

  async createRecoveryLink(identity: Identity): Promise<string> {
    const res = await this.kratos.adminCreateSelfServiceRecoveryLink({
      identity_id: identity.id,
      expires_in: '12h',
    })

    return res.data.recovery_link
  }

  async getIdentityById(id: string): Promise<Identity> {
    const res = await this.kratos.adminGetIdentity(id)

    return res.data
  }

  async getIdentityIdsByEmail(mail: string): Promise<string[]> {
    return (await this.kratos.adminListIdentities()).data.filter(r => r.traits[EMAIL] === mail).map(r => r.id)
  }
}
