import { Injectable } from '@nestjs/common'
import { Configuration, Identity, Session, V0alpha2Api } from '@ory/kratos-client'

const kratos = new V0alpha2Api(new Configuration({ basePath: process.env.KRATOS_ADMIN_URL }))
const EMAIL = 'email'

@Injectable()
export class KratosService {
  async getIdentityByEmail(email: string): Promise<Identity> {
    const identities = await kratos.adminListIdentities()
    return identities.data.find(user => user.traits[EMAIL] === email)
  }

  async getIdentitiesByIds(ids: string[]): Promise<Identity[]> {
    const identities = await kratos.adminListIdentities()
    return identities.data.filter(it => ids.includes(it.id))
  }

  async getSessionsById(id: string, activeOnly?: boolean): Promise<Session[]> {
    const sessions = await kratos.adminListIdentitySessions(id, undefined, undefined, activeOnly)
    return sessions.data ?? []
  }

  async createUser(email: string): Promise<Identity> {
    const res = await kratos.adminCreateIdentity({
      schema_id: 'default',
      traits: {
        email,
      },
    })

    return res.data
  }

  async createRecoveryLink(identity: Identity): Promise<string> {
    const res = await kratos.adminCreateSelfServiceRecoveryLink({
      identity_id: identity.id,
      expires_in: '12h',
    })

    return res.data.recovery_link
  }
}
