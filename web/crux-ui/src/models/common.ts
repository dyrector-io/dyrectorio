// errors

export type DyoApiError = DyoErrorDto & {
  status: number
}

export type DyoErrorDto = {
  error: string
  property?: string
  value?: any
  description: string
}

export type DyoFetchError = DyoErrorDto & {
  status: number
}

// deployment

export const DEPLOYMENT_STATUS_VALUES = ['preparing', 'in_progress', 'successful', 'failed', 'obsolate'] as const
export type DeploymentStatus = typeof DEPLOYMENT_STATUS_VALUES[number]

// ws

export const WS_TYPE_DYO_ERROR = 'dyo-error'
export type DyoErrorMessage = DyoApiError
