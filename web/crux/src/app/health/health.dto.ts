import { IsIn, IsOptional, IsString } from 'class-validator'

export const SERVICE_STATUS_VALUES = ['unavailable', 'disrupted', 'operational'] as const
export type ServiceStatusDto = (typeof SERVICE_STATUS_VALUES)[number]

export class HealthDto {
  @IsIn(SERVICE_STATUS_VALUES)
  status: ServiceStatusDto

  @IsString()
  version: string

  @IsString()
  @IsOptional()
  lastMigration?: string
}
