/* eslint-disable @typescript-eslint/lines-between-class-members */
export const REGISTRY_TYPE_VALUES = ['v2', 'hub', 'gitlab', 'github', 'google', 'unchecked'] as const
export type RegistryType = (typeof REGISTRY_TYPE_VALUES)[number]

export class BasicRegistryDto {
  id: string
  name: string
  type: RegistryType
}
