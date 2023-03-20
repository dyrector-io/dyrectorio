/* eslint-disable @typescript-eslint/lines-between-class-members */
import { DeploymentStatus } from 'src/shared/models'
import { BasicNodeDto } from '../node/node.dto'

// eslint-disable-next-line import/prefer-default-export
export class BasicDeploymentWithNodeDto {
  id: string
  prefix: string
  status: DeploymentStatus
  note?: string | null
  updatedAt: Date
  node: BasicNodeDto
}
