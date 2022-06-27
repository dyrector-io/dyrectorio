import { Identity } from '@ory/kratos-client'

export type LoginDto = {
  flow: string
  csrfToken: string
  captcha: string
  email: string
  password: string
}

export type LogoutDto = {
  url: string
}

export type RegisterDto = {
  flow: string
  csrfToken: string
  captcha: string
  email: string
  password: string
}

export type RecoveryDto = {
  flow: string
  csrfToken: string
  captcha: string
  email: string
  token?: string
}

export type VerifyDto = {
  flow: string
  csrfToken: string
  captcha: string
  email: string
  token?: string
}

export type EditProfileDto = {
  flow: string
  csrfToken: string
  email: string
  firstName: string
  lastName: string
}

export type ChangePasswordDto = {
  flow: string
  csrfToken: string
  password: string
}

export type DyoErrorDto = {
  error: string
  value?: string
  description: string
}

export type DyoFetchError = DyoErrorDto & {
  status: number
}

export type UserNameDto = {
  first?: string
  last?: string
}

export type UserTraitsDto = {
  email: string
  name?: UserNameDto
}

export type UserDto = {
  identity: Identity
  admin: boolean
}

export type InviteUserDto = {
  email: string
}

export type UserInvitiedDto = {
  identity: Identity
  inviteUrl: string
}
