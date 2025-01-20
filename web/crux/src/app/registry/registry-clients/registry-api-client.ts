import { RegistryImageTag, RegistryImageWithTags } from '../registry.message'

export type RegistryImageTagInfo = {
  created: string
}

export interface RegistryApiClient {
  catalog(text: string): Promise<string[]>
  tags(image: string): Promise<RegistryImageWithTags>
  labels(image: string, tag: string): Promise<Record<string, string>>
  tagInfo(image: string, tag: string): Promise<RegistryImageTagInfo>
}

export const fetchInfoForTags = async (
  image: string,
  tags: string[],
  client: RegistryApiClient,
): Promise<RegistryImageTag[]> => {
  const tagsWithInfo = tags.map(async tag => {
    const info = await client.tagInfo(image, tag)

    return {
      ...info,
      name: tag,
    }
  })

  return await Promise.all(tagsWithInfo)
}
