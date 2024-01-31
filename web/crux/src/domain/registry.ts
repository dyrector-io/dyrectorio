import { Registry } from '@prisma/client'

export type RegistryConnectionInfo = Omit<Registry, 'token'> & {
  token: string
  public: boolean
}

export const REGISTRY_EVENT_UPDATE = 'registry.update'
export type RegistryUpdatedEvent = {
  id: string
}

export const REGISTRY_EVENT_V2_PUSH = 'registry.v2.push'
export const REGISTRY_EVENT_V2_PULL = 'registry.v2.pull'
export const REGISTRY_EVENT_V2_ANY = 'registry.v2.*'
export type RegistryV2Event = {
  registry: Registry
  imageName: string
  imageTag: string
  labels: Record<string, string>
}
