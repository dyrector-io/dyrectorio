import { Deployment, DeploymentStatusEnum, ProjectTypeEnum, Version, VersionTypeEnum } from '@prisma/client'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import { DeploymentWithNode, deploymentIsMutable } from './deployment'
import { ImageDetails } from './image'

export type VersionWithName = Pick<Version, 'id' | 'name'>

export type VersionWithDeployments = Version & {
  deployments: Deployment[]
}

export type VersionWithChildren = Version & {
  children: { versionId: string }[]
}

export type VersionDetails = VersionWithChildren & {
  project: {
    type: ProjectTypeEnum
  }
  images: ImageDetails[]
  deployments: DeploymentWithNode[]
}

export type VersionIncreasabilityCheckDao = {
  type: VersionTypeEnum
  children: { versionId: string }[]
}

export type VersionMutabilityCheckDao = VersionIncreasabilityCheckDao & {
  id: string
  deployments: { status: DeploymentStatusEnum }[]
}

export type VersionDeletabilityCheckDao = VersionMutabilityCheckDao & {
  project: {
    type: ProjectTypeEnum
  }
}

export const versionHasImmutableDeployments = (version: VersionMutabilityCheckDao): boolean =>
  version.deployments.filter(it => !deploymentIsMutable(it.status, version.type)).length > 0

// - 'rolling' versions are not increasable
// - an 'incremental' version is increasable, when it does not have any child yet
export const versionIsIncreasable = (version: VersionIncreasabilityCheckDao): boolean =>
  version.type === 'incremental' && version.children.length < 1

// - 'rolling' versions are mutable
// - an 'incremental' version is mutable, unless it has any immutable deployment
//   or it's not increasable
export const versionIsMutable = (version: VersionMutabilityCheckDao): boolean => {
  if (version.type === 'rolling') {
    return true
  }

  return !versionHasImmutableDeployments(version) && versionIsIncreasable(version)
}

// - 'rolling' versions are deletable if they don't have any immutable (inProgress) deployment
//   or they aren't part of a versionless project
// - an 'incremental' version is deletable, unless it has any immutable deployment
//   or it's not increasable
export const versionIsDeletable = (version: VersionDeletabilityCheckDao): boolean => {
  if (versionHasImmutableDeployments(version)) {
    return false
  }

  if (version.type === 'rolling') {
    return version.project.type === 'versioned'
  }

  return versionIsIncreasable(version)
}

export const checkVersionMutability = (version: VersionMutabilityCheckDao) => {
  if (!version) {
    throw new Error(`Version mutability check failed. Version was ${version}`)
  }

  if (!versionIsMutable(version)) {
    throw new CruxPreconditionFailedException({
      message: 'Version is immutable',
      property: 'versionId',
      value: version.id,
    })
  }
}
