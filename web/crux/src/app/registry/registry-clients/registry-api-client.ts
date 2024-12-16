import { RegistryImageTag, RegistryImageTags } from '../registry.message'

const TAG_INFO_BATCH_SIZE = 5

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
  const map: Record<string, RegistryImageTag> = {}

  for (let batch = 0; batch < Math.ceil(tags.length / TAG_INFO_BATCH_SIZE); batch++) {
    const start = batch * TAG_INFO_BATCH_SIZE
    const end = Math.min(tags.length, start + TAG_INFO_BATCH_SIZE)
    const promises = tags.slice(start, end).map(async it => {
      const info = await client.tagInfo(image, it)

      return {
        tag: it,
        info,
      }
    })

    // eslint-disable-next-line no-await-in-loop
    const results = await Promise.all(promises)
    results.forEach(it => {
      map[it.tag] = it.info
    })
  }

  return map
}
