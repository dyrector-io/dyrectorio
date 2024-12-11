import { Cache } from 'cache-manager'
import { RegistryImageTag, RegistryImageTags } from '../registry.message'
import HubApiCache from './caches/hub-api-cache'
import HubApiClient from './hub-api-client'
import { RegistryApiClient } from './registry-api-client'

export default class CachedPublicHubApiClient extends HubApiClient implements RegistryApiClient {
  private proxyToken?: string

  constructor(
    private hubCache: HubApiCache,
    url: string,
    prefix: string,
    manifestCache: Cache | null,
  ) {
    super(process.env.HUB_PROXY_URL ?? `https://${url}`, prefix, manifestCache)
    this.proxyToken = process.env.HUB_PROXY_TOKEN
  }

  async catalog(text: string): Promise<string[]> {
    const endpoint = ''

    let repositories: string[] = this.hubCache.get(endpoint)
    if (!repositories) {
      repositories = await super.fetchCatalog()
      this.hubCache.upsert(endpoint, repositories)
    }

    return repositories.filter(it => it.includes(text))
  }

  async tags(image: string): Promise<RegistryImageTags> {
    let tags: string[] = this.hubCache.get(image)
    if (!tags) {
      tags = await this.fetchTags(image)

      this.hubCache.upsert(image, tags)
    }

    const tagsWithInfoPromise = tags.map(async it => {
      const info = await this.tagInfo(image, it)

      return {
        tag: it,
        info,
      }
    })
    const tagsWithInfo = (await Promise.all(tagsWithInfoPromise)).reduce(
      (map, it) => {
        map[it.tag] = it.info
        return map
      },
      {} as Record<string, RegistryImageTag>,
    )

    return {
      name: image,
      tags: tagsWithInfo,
    }
  }

  protected override async fetch(endpoint: string, init?: RequestInit): Promise<Response> {
    const initializer = init ?? {}

    const initHeaders = initializer.headers ?? {}
    const headers = !this.proxyToken
      ? initHeaders
      : {
          ...initHeaders,
          authorization: this.proxyToken,
        }

    return await super.fetch(endpoint, {
      ...initializer,
      headers,
    })
  }
}
