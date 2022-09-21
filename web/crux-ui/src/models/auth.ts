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
  return `${traits?.name?.first ?? ''} ${traits?.name?.last ?? ''}`
}
