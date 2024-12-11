import { RegistryImageTag, RegistryImageTags } from '../registry.message'

export interface RegistryApiClient {
  catalog(text: string): Promise<string[]>
  tags(image: string): Promise<RegistryImageTags>
  labels(image: string, tag: string): Promise<Record<string, string>>
  tagInfo(image: string, tag: string): Promise<RegistryImageTag>
}
