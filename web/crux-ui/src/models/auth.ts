import { Identity } from '@ory/kratos-client'

export type AxiosErrorResponse<T> = {
  status: number
  headers: object
  data?: T
}

export type AxiosError<T> = {
  response?: AxiosErrorResponse<T>
}

export type Logout = {
  url: string
}

export const AUTHENTICATION_METHOD_VALUES = ['password', 'oidc'] as const
export type AuthenticationMethod = (typeof AUTHENTICATION_METHOD_VALUES)[number]

export const OIDC_PROVIDER_VALUES = ['google', 'gitlab', 'github', 'azure'] as const
export type OidcProvider = (typeof OIDC_PROVIDER_VALUES)[number]

export type OidcAvailability = {
  gitlab: boolean
  github: boolean
  google: boolean
  azure: boolean
}

export const oidcEnabled = (oidc: OidcAvailability) => oidc.gitlab || oidc.github || oidc.google || oidc.azure

type LoginBase = {
  method: AuthenticationMethod
  flow: string
  csrfToken: string
  captcha?: string
}

export type LoginWithPassword = LoginBase & {
  method: 'password'
  email: string
  password: string
}

export type LoginWithOidc = LoginBase & {
  method: 'oidc'
  provider: OidcProvider
}

export type Login = LoginWithPassword | LoginWithOidc

type RegisterBase = {
  flow: string
  method: AuthenticationMethod
  csrfToken: string
  captcha?: string
}

export type RegisterWithPassword = RegisterBase & {
  method: 'password'
  email: string
  password: string
  firstName: string
  lastName?: string
}

export type RegisterWithOidc = RegisterBase & {
  method: 'oidc'
  provider: OidcProvider
  email?: string
  firstName?: string
  lastName?: string
}

export type Register = RegisterWithPassword | RegisterWithOidc

export type RecoverEmail = {
  flow: string
  csrfToken: string
  captcha?: string
  email?: string
  code?: string
}

const KRATOS_LOCATION_CHANGE_REQUIRED = 'browser_location_change_required'
const KRATOS_LOCATION_CHANGE_REQUIRED_TYPE_VALUE = [KRATOS_LOCATION_CHANGE_REQUIRED] as const

export type KratosLocationChangeRequiredError = {
  error: {
    id: (typeof KRATOS_LOCATION_CHANGE_REQUIRED_TYPE_VALUE)[number]
  }
  redirect_browser_to: string
}

export type VerifyEmail = {
  flow: string
  csrfToken: string
  captcha?: string
  email?: string
  code?: string
}

export type CreateAccount = {
  flow: string
  code: string
  team: string
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

export type IdentityPublicMetadata = {
  recovered: string
  disableOnboarding?: boolean
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

export const toKratosLocationChangeRequiredError = (
  err: Error,
): AxiosErrorResponse<KratosLocationChangeRequiredError> => {
  const error = err as AxiosError<KratosLocationChangeRequiredError>

  if (!error.response) {
    return null
  }

  const resp = error.response
  if (
    resp.status === 422 &&
    resp.data?.error?.id === KRATOS_LOCATION_CHANGE_REQUIRED &&
    resp.data?.redirect_browser_to
  ) {
    return resp
  }

  return null
}
