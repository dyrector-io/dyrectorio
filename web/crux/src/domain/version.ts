import { DeploymentStatusEnum, ProjectTypeEnum, VersionTypeEnum } from '@prisma/client'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import { checkDeploymentMutability } from './deployment'

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
  version.deployments.filter(it => !checkDeploymentMutability(it.status, version.type)).length > 0

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

  return false
}

export type VersionWithChains = {
  id: string
  name: string
  chainLinks: {
    child: {
      id: string
      name: string
      _count: {
        children: number
      }
    }
  }[]
}

type VersionWithName = {
  id: string
  name: string
}

export type VersionChain = {
  id: string
  earliest: VersionWithName
  latest: VersionWithName
}

export const versionChainOf = (earliest: VersionWithChains): VersionChain => {
  const links = earliest.chainLinks
  const latest = links && links.length > 0 ? links.find(it => it.child._count.children < 1)?.child : earliest

  return {
    id: earliest.id,
    earliest,
    latest,
  }
}
