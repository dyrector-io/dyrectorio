import { Audit } from './audit'
import { DeploymentStatus } from './common'
import { VersionImage } from './image'
import { BasicNode, NodeStatus } from './node'

export const VERSION_TYPE_VALUES = ['incremental', 'rolling'] as const
export type VersionType = typeof VERSION_TYPE_VALUES[number]

export type Version = {
  id: string
  name: string
  changelog?: string
  type: VersionType
  default: boolean
  increasable: boolean
  audit: Audit
}

export type EditableVersion = Omit<Version, 'default'>

export type IncreaseVersion = {
  name: string
  changelog?: string
}

export type UpdateVersion = IncreaseVersion

export type CreateVersion = UpdateVersion & {
  type: VersionType
}

export type DeploymentByVersion = {
  id: string
  prefix: string
  status: DeploymentStatus
  note?: string | null
  updatedAt: string
  node: BasicNode
  nodeStatus?: NodeStatus | null
}

export type VersionDetails = Version & {
  mutable: boolean
  deletable: boolean
  images: VersionImage[]
  deployments: DeploymentByVersion[]
}

export type VersionAddSectionState = 'image' | 'deployment' | 'none'

export const VERSION_SECTIONS_STATE_VALUES = ['images', 'deployments', 'reorder'] as const
export type VersionSectionsState = typeof VERSION_SECTIONS_STATE_VALUES[number]
