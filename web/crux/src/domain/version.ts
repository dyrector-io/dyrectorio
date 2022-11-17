import { PreconditionFailedException } from '@nestjs/common'
import { DeploymentStatusEnum, VersionTypeEnum } from '@prisma/client'
import { checkDeploymentMutability } from './deployment'

export type VersionMutabilityCheckDao = {
  type: VersionTypeEnum
  deployments: { status: DeploymentStatusEnum }[]
}

export type VersionIncreasabilityCheckDao = {
  type: VersionTypeEnum
  children: { versionId: string }[]
}

export const versionHasImmutableDeployments = (version: VersionMutabilityCheckDao): boolean =>
  version.deployments.filter(it => !checkDeploymentMutability(it.status, version.type)).length > 0

export const versionIsMutable = (version: VersionMutabilityCheckDao): boolean =>
  version.type === 'rolling' || !versionHasImmutableDeployments(version)

export const versionIsIncreasable = (version: VersionIncreasabilityCheckDao): boolean =>
  version.type === 'incremental' ? version.children.length < 1 : false

export const checkVersionMutability = (version: VersionMutabilityCheckDao) => {
  if (!version) {
    throw new Error(`Version mutability check failed. Version was ${version}`)
  }

  if (version.type === 'rolling') {
    return true
  }

  if (versionHasImmutableDeployments(version)) {
    throw new PreconditionFailedException({
      message: 'Version is immutable, because it is already deployed.',
      property: 'deployments',
    })
  }

  return false
}
