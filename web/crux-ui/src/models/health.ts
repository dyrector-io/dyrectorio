import { DyoErrorDto } from './common'

export type ServiceStatus = 'unavailable' | 'disrupted' | 'operational'

export type ServiceInfo = {
  status: ServiceStatus
  version?: string
}
export const DEFAULT_SERVICE_INFO: ServiceInfo = {
  status: 'unavailable',
  version: null,
}

export type CruxHealth = ServiceInfo & {
  lastMigration?: string
}
export const DEFAULT_CRUX_HEALTH: CruxHealth = {
  ...DEFAULT_SERVICE_INFO,
  lastMigration: null,
}

export type DyoServiceInfo = {
  app: ServiceInfo
  crux: ServiceInfo
  database: ServiceInfo
  kratos: ServiceInfo
}

export type UnavailableErrorType = 'crux' | 'kratos'

export type UnavailableErrorDto = DyoErrorDto & {
  error: UnavailableErrorType
}
