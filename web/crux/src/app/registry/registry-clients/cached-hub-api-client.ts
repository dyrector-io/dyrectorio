import { Cache } from 'cache-manager'
import { RegistryImageTag, RegistryImageWithTags } from '../registry.message'
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

  async tags(image: string): Promise<RegistryImageWithTags> {
    let tags: string[] = this.hubCache.get(image)
    if (!tags) {
      tags = await this.fetchTags(image)

      this.hubCache.upsert(image, tags)
    }

    // NOTE(@robot9706): Docker ratelimits us so skip tag info for now
    const tagsWithInfo: RegistryImageTag[] = tags.map(it => ({
      name: it,
    }))

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
