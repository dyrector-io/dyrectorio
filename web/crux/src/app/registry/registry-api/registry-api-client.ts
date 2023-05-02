import { RegistryImageTags } from '../registry.message'

export interface RegistryApiClient {
  catalog(text: string, take: number): Promise<string[]>
  tags(image: string): Promise<RegistryImageTags>
}
