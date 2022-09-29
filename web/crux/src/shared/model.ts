import { JsonObject } from 'prisma'
import { Identity } from '@ory/kratos-client'
import { ContainerConfig } from '@prisma/client'

export type UniqueKeyValue = {
  id: string
  key: string
  value: string
}

export type UniqueKeySecretValue = UniqueKeyValue & {
  encrypted: boolean
}

export const CONTAINER_NETWORK_MODE_VALUES = ['none', 'host', 'bridge'] as const

export type ContainerNetworkMode = typeof CONTAINER_NETWORK_MODE_VALUES[number]

export const CONTAINER_RESTART_POLICY_TYPE_VALUES = ['', 'always', 'unless_stopped', 'no', 'on_failure'] as const
export type ContainerRestartPolicyType = typeof CONTAINER_RESTART_POLICY_TYPE_VALUES[number]

export const CONTAINER_DEPLOYMENT_STRATEGY_VALUES = ['recreate', 'rolling'] as const
export type ContainerDeploymentStrategyType = typeof CONTAINER_DEPLOYMENT_STRATEGY_VALUES[number]

export const CONTAINER_EXPOSE_STRATEGY_VALUES = ['none', 'expose', 'expose_with_tls'] as const
export type ContainerExposeStrategyType = typeof CONTAINER_EXPOSE_STRATEGY_VALUES[number]

export type ContainerConfigData = Omit<ContainerConfig, 'id' | 'imageId'>

export type IdentityTraits = {
  email: string
  name?: IdentityTraitsName
}

export type IdentityTraitsName = {
  first?: string
  last?: string
}

export const nameOfIdentity = (identity: Identity) => {
  const traits = identity?.traits as IdentityTraits
  return `${traits?.name?.first ?? ''} ${traits?.name?.last ?? ''}`.trim()
}

export const nameOrEmailOfIdentity = (identity: Identity) => {
  if (!identity) {
    return ''
  }

  const traits = identity?.traits as IdentityTraits

  if (traits.name) {
    return nameOfIdentity(identity)
  }

  return traits.email
}

export const emailOfIdentity = (identity: Identity) => {
  const traits = identity?.traits as IdentityTraits

  return traits.email
}
