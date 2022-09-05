import { internalError, unauthorizedError } from '@app/error-responses'
import { RegistryImageTags } from '@app/models'
import HubApiCache from './caches/hub-api-cache'
import { RegistryApiClient } from './registry-api-client'

type HubApiPaginatedResponse = {
  count: number
  next?: string
  previous?: string
  results: any[]
}

class HubApiClient implements RegistryApiClient {
  constructor(private cache: HubApiCache, private url: string, private prefix: string) {}

  async catalog(text: string, take: number): Promise<string[]> {
    const endpoint = ''

    let repositories: string[] = this.cache.get(endpoint)
    if (!repositories) {
      const result = await this.fetchPaginatedEndpoint(endpoint)

      repositories = result.map(it => it.name)
      this.cache.upsert(endpoint, repositories)
    }

    return repositories.filter(it => it.includes(text)).slice(0, take)
  }

  async tags(image: string): Promise<RegistryImageTags> {
    const endpoint = `${image}/tags`

    let tags: string[] = this.cache.get(endpoint)
    if (!tags) {
      const result = await this.fetchPaginatedEndpoint(endpoint)

      tags = result.map(it => it.name)
      this.cache.upsert(endpoint, tags)
    }

    return {
      tags,
      name: image,
    }
  }

  private async fetch(endpoint: string, init?: RequestInit) {
    const initializer = init ?? {}
    const fullUrl = `https://${this.url}/v2/repositories/${this.prefix}/${endpoint}`

    return await fetch(fullUrl, {
      ...initializer,
      headers: {
        ...(initializer.headers ?? {}),
      },
    })
  }

  private async fetchPaginatedEndpoint(endpoint: string) {
    const result = []

    let next = () => this.fetch(`${endpoint}`)

    do {
      const res = await next()
      if (!res.ok) {
        const errorMessage = `${endpoint} request failed with status: ${res.status} ${res.statusText}`
        throw res.status === 401 ? unauthorizedError(errorMessage) : internalError(errorMessage)
      }

      const dto: HubApiPaginatedResponse = await res.json()
      result.push(...dto.results)

      next = dto.next ? () => fetch(dto.next) : null
    } while (next)

    return result
  }
}

export default HubApiClient
