import { RegistryImageTag, RegistryImageTags } from '../registry.message'

export interface RegistryApiClient {
  catalog(text: string): Promise<string[]>
  tags(image: string): Promise<RegistryImageTags>
  labels(image: string, tag: string): Promise<Record<string, string>>
  tagInfo(image: string, tag: string): Promise<RegistryImageTag>
}

export const fetchInfoForTags = async (
  image: string,
  tags: string[],
  client: RegistryApiClient,
): Promise<Record<string, RegistryImageTag>> => {
  const tagsWithInfoPromise = tags.map(async it => {
    const info = await client.tagInfo(image, it)

    return {
      tag: it,
      info,
    }
  })

  return (await Promise.all(tagsWithInfoPromise)).reduce(
    (map, it) => {
      map[it.tag] = it.info
      return map
    },
    {} as Record<string, RegistryImageTag>,
  )
}
