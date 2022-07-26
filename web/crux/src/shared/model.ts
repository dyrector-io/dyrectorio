import { Identity } from '@ory/kratos-client'

export type UniqueKeyValue = {
  id: string
  key: string
  value: string
}

export type ExplicitContainerConfigPort = {
  internal: number
  external: number
}

export const EXPLICIT_CONTAINER_NETWORK_MODE_VALUES = ['none', 'host'] as const
export type ExplicitContainerNetworkMode = typeof EXPLICIT_CONTAINER_NETWORK_MODE_VALUES[number]

export type ExplicitContainerConfigData = {
  ports: ExplicitContainerConfigPort[]
  mounts: string[]
  networkMode?: ExplicitContainerNetworkMode
  /** exposure configuration */
  expose?: ExplicitContainerConfigExpose
  user?: number
}

export type ExplicitContainerConfigExpose = {
  public: boolean
  tls: boolean
}

export type ContainerConfigData = {
  name: string
  capabilities: UniqueKeyValue[]
  environment: UniqueKeyValue[]
  config: ExplicitContainerConfigData
}

export type InstanceContainerConfigData = Omit<ContainerConfigData, 'name'>

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
