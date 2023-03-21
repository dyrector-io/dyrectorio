import { IsEnum } from 'class-validator'
import { BasicNodeDto } from '../node/node.dto'

export enum DeploymentStatusDto {
  preparing = 'preparing',
  inProgress = 'in-progress',
  successful = 'successful',
  failed = 'failed',
  obsolete = 'obsolete',
  downgrade = 'downgrade',
}

export default class BasicDeploymentWithNodeDto {
  id: string

  prefix: string

  @IsEnum(DeploymentStatusDto)
  status: DeploymentStatusDto

  note?: string | null

  updatedAt: Date

  node: BasicNodeDto
}
