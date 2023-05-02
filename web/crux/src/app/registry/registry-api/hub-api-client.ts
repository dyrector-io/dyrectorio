import {
  CruxExceptionOptions,
  CruxInternalServerErrorException,
  CruxUnauthorizedException,
} from 'src/exception/crux-exception'
import { RegistryImageTags } from '../registry.message'
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
  private url: string

  private proxyToken?: string

  constructor(private cache: HubApiCache, url: string, private prefix: string) {
    this.url = process.env.HUB_PROXY_URL ?? `https://${url}`
    this.proxyToken = process.env.HUB_PROXY_TOKEN
  }

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
    const fullUrl = `${this.url}/v2/repositories/${this.prefix}/${endpoint}`

    const initHeaders = initializer.headers ?? {}
    const headers = !this.proxyToken
      ? initHeaders
      : {
          ...initHeaders,
          authorization: this.proxyToken,
        }

    return await fetch(fullUrl, {
      ...initializer,
      headers,
    })
  }

  private async fetchPaginatedEndpoint(endpoint: string) {
    const result = []

    let next = () => this.fetch(`${endpoint}`)
    let rateTry = 0

    do {
      // eslint-disable-next-line no-await-in-loop
      const res = await next()
      if (res.ok) {
        rateTry = 0

        // eslint-disable-next-line no-await-in-loop
        const dto: HubApiPaginatedResponse = await res.json()
        result.push(...dto.results)

        next = dto.next ? () => fetch(dto.next) : null
      } else if ((res.headers.has('x-retry-after') || res.headers.has('retry-after')) && rateTry < MAX_RATE_RETRY) {
        const retryAfterHeader = res.headers.get('x-retry-after') ?? res.headers.get('retry-after')
        const retryAfter = Number(retryAfterHeader) - new Date().getTime() / 1000

        // this.logger.warn(`DockerHub API rate limit '${endpoint}', retry after ${retryAfter}s`)

        const fetchNext = next
        next = () =>
          new Promise<Response>(resolve => {
            setTimeout(async () => {
              fetchNext().then(resolve)
            }, retryAfter * 1000)
          })

        rateTry += 1
      } else {
        const excOptions: CruxExceptionOptions = {
          message: `${endpoint} request failed with status: ${res.status} ${res.statusText}`,
        }
        throw res.status === 401
          ? new CruxUnauthorizedException(excOptions)
          : new CruxInternalServerErrorException(excOptions)
      }
    } while (next)

    return result
  }
}

export default HubApiClient
