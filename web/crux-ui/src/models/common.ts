export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }
export type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U

// errors

export type DyoErrorDto = {
  error: string
  property?: string
  value?: any
  description: string
}

export type DyoApiError = DyoErrorDto & {
  status: number
}

// deployment

export const DEPLOYMENT_STATUS_VALUES = ['preparing', 'in-progress', 'successful', 'failed', 'obsolete'] as const
export type DeploymentStatus = (typeof DEPLOYMENT_STATUS_VALUES)[number]

// ws

export const WS_TYPE_ERROR = 'error'
export type WsErrorMessage = {
  status: number
  message: string
  property?: string
  value?: any
}

export const WS_TYPE_PATCH_RECEIVED = 'patch-received'

export type WebSocketSaveState = 'saved' | 'saving' | 'connected' | 'disconnected'

// pagination

export type PaginationQuery = {
  skip: number
  take: number
  from: string
  to: string
}

// https://gist.github.com/codeguy/6684588?permalink_comment_id=3426313#gistcomment-3426313
export const slugify = (value: string) =>
  value
    .toString()
    .normalize('NFD') // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // remove all chars not letters, numbers and spaces (to be replaced)
    .replace(/\s+/g, '-')
