import { RegistryImageTags } from '../registry.message'
import HubApiCache from './caches/hub-api-cache'
import HubApiClient from './hub-api-client'
import { RegistryApiClient } from './registry-api-client'

export default class CachedPublicHubApiClient extends HubApiClient implements RegistryApiClient {
  private proxyToken?: string

  constructor(
    private cache: HubApiCache,
    url: string,
    prefix: string,
  ) {
    super(process.env.HUB_PROXY_URL ?? `https://${url}`, prefix)
    this.proxyToken = process.env.HUB_PROXY_TOKEN
  }

  async catalog(text: string): Promise<string[]> {
    const endpoint = ''

    let repositories: string[] = this.cache.get(endpoint)
    if (!repositories) {
      repositories = await super.fetchCatalog()
      this.cache.upsert(endpoint, repositories)
    }

    return repositories.filter(it => it.includes(text))
  }

  async tags(image: string): Promise<RegistryImageTags> {
    let tags: string[] = this.cache.get(image)
    if (!tags) {
      tags = await this.fetchTags(image)

      this.cache.upsert(image, tags)
    }

    return {
      tags,
      name: image,
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
