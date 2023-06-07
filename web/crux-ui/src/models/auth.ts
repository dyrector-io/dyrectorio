import { Identity } from '@ory/kratos-client'

export type AxiosErrorResponse<T> = {
  status: number
  headers: object
  data?: T
}

export type AxiosError<T> = {
  response?: AxiosErrorResponse<T>
}

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
  email?: string
  code?: string
}

const KRATOS_LOCATION_CHANGE_REQUIRED = 'browser_location_change_required'
const KRATOS_LOCATION_CHANGE_REQUIRED_TYPE_VALUE = [KRATOS_LOCATION_CHANGE_REQUIRED] as const

export type RecoverNewPasswordError = {
  error: {
    id: typeof KRATOS_LOCATION_CHANGE_REQUIRED_TYPE_VALUE[number]
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

export const toRecoverNewPasswordError = (err: Error): AxiosErrorResponse<RecoverNewPasswordError> => {
  const error = err as AxiosError<RecoverNewPasswordError>

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
