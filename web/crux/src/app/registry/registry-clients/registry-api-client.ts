import { TAG_INFO_BATCH_SIZE } from 'src/shared/const'
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
  const result: RegistryImageTag[] = []

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

    const fetchedTags = results.map(it => ({
      ...it.info,
      name: it.tag,
    }))

    result.push(...fetchedTags)
  }

  return result
}
