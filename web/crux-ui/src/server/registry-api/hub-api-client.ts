import { internalError, unauthorizedError } from '@app/error-responses'
import { Logger } from '@app/logger'
import { RegistryImageTags } from '@app/models'
import HubApiCache from './caches/hub-api-cache'
import { RegistryApiClient } from './registry-api-client'

type HubApiPaginatedResponse = {
  count: number
  next?: string
  previous?: string
  results: any[]
}

const MAX_RATE_RETRY = 3

class HubApiClient implements RegistryApiClient {
  private logger = new Logger(HubApiClient.name)

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
    const endpoint = `${image}/tags?page_size=100`

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
    let rateTry = 0

    do {
      const res = await next()
      if (res.ok) {
        rateTry = 0

        const dto: HubApiPaginatedResponse = await res.json()
        result.push(...dto.results)

        next = dto.next ? () => fetch(dto.next) : null
      } else if ((res.headers.has('x-retry-after') || res.headers.has('retry-after')) && rateTry < MAX_RATE_RETRY) {
        const retryAfterHeader = res.headers.get('x-retry-after') ?? res.headers.get('retry-after')
        const retryAfter = Number(retryAfterHeader) - new Date().getTime() / 1000

        this.logger.warn(`DockerHub API rate limit '${endpoint}', retry after ${retryAfter}s`)

        const fetchNext = next
        next = () =>
          new Promise<Response>(resolve => {
            setTimeout(async () => {
              fetchNext().then(resolve)
            }, retryAfter * 1000)
          })

        rateTry += 1
      } else {
        const errorMessage = `${endpoint} request failed with status: ${res.status} ${res.statusText}`
        throw res.status === 401 ? unauthorizedError(errorMessage) : internalError(errorMessage)
      }
    } while (next)

    return result
  }
}

export default HubApiClient
