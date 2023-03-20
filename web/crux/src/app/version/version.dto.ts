/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable max-classes-per-file */
import { AuditDto } from 'src/shared/dto'
import { VersionType } from 'src/shared/models/version'
// eslint-disable-next-line import/no-cycle
import { BasicDeploymentWithNodeDto } from '../deploy/deploy.dto'
import { ImageDto } from '../image/image.dto'

// eslint-disable-next-line max-classes-per-file

export class BasicVersionDto {
  id: string
  name: string
  type: VersionType
}

export class VersionDto extends BasicVersionDto {
  audit: AuditDto
  changelog: string
  default: boolean
  increasable: boolean
}

export class UpdateVersionDto {
  name: string
  changelog: string | null
}

export class CreateVersionDto extends UpdateVersionDto {
  type: VersionType
}

export class IncreaseVersionDto extends UpdateVersionDto {}

export class VersionDetailsDto extends VersionDto {
  mutable: boolean
  deletable: boolean
  images: ImageDto[]
  deployments: BasicDeploymentWithNodeDto[]
}
