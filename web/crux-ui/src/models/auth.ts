import { Identity } from '@ory/kratos-client'

export type Login = {
  flow: string
  csrfToken: string
  captcha?: string
  email: string
  password: string
}

export type Logout = {
  url: string
}

export type Register = {
  flow: string
  csrfToken: string
  captcha?: string
  email: string
  password: string
  firstName: string
  lastName?: string
}

export type RecoverEmail = {
  flow: string
  csrfToken: string
  captcha?: string
  email: string
  token?: string
}

export type VerifyEmail = {
  flow: string
  csrfToken: string
  captcha?: string
  email: string
  token?: string
}

export type EditProfile = {
  flow: string
  csrfToken: string
  email: string
  firstName: string
  lastName: string
}

export type ChangePassword = {
  flow: string
  csrfToken: string
  password: string
}

export type IdentityAdminMetadata = {
  noPassword: boolean
}

export type IdentityTraitsName = {
  first?: string
  last?: string
}

export type IdentityTraits = {
  email: string
  name?: IdentityTraitsName
}

export const nameOfIdentity = (identity: Identity): string => {
  const traits = identity.traits as IdentityTraits
  const firstName = traits?.name?.first
  const lastName = traits?.name?.last

  if (firstName) {
    return !lastName ? firstName : `${firstName} ${lastName}`
  }

  if (lastName) {
    return lastName
  }

  return ''
}
