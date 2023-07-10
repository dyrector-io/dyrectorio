import { Identity } from '@ory/kratos-client'
import { TEAM_INVITATION_EXPIRATION } from '../shared/const'
import { JwtToken } from './token'

export const KRATOS_IDENTITY_SCHEMA = 'default'

export type KratosInvitation = {
  flow: string
  code: string
}

export type IdentityTraits = {
  email: string
  name?: IdentityTraitsName
}

export type IdentityTraitsName = {
  first?: string
  last?: string
}

export type RequestAuthenticationData = {
  sessionExpiresAt: number | null // epoch millis
  identity: Identity | null
  user: JwtToken | null
}

export const nameOfIdentity = (identity: Identity) => {
  const traits = identity?.traits as IdentityTraits
  return `${traits?.name?.first ?? ''} ${traits?.name?.last ?? ''}`.trim()
}

export const nameOrEmailOfIdentity = (identity: Identity) => {
  if (!identity) {
    return ''
  }

  const traits = identity?.traits as IdentityTraits

  if (traits.name) {
    return nameOfIdentity(identity)
  }

  return traits.email
}

export const emailOfIdentity = (identity: Identity) => {
  const traits = identity?.traits as IdentityTraits

  return traits.email
}

export const invitationExpired = (inviteCreatedAt: Date, nowInMillis: number): boolean =>
  nowInMillis >= inviteCreatedAt.getTime() + TEAM_INVITATION_EXPIRATION
