import { getRegistryApiException } from 'src/exception/registry-exception'
import V2Labels from './v2-labels'

type HubApiPaginatedResponse = {
  count: number
  next?: string
  previous?: string
  results: any[]
}

const MAX_RATE_RETRY = 3

export const DOCKER_HUB_REGISTRY_URL = 'index.docker.io'

export default abstract class HubApiClient {
  constructor(
    protected readonly url: string,
    protected readonly prefix: string,
  ) {}

  protected async fetchCatalog(): Promise<string[]> {
    const endpoint = ''

    const result = await this.fetchPaginatedEndpoint(endpoint)

    return result.map(it => it.name)
  }

  protected async fetchTags(image: string): Promise<string[]> {
    const endpoint = `${image}/tags?page_size=100`

    const result = await this.fetchPaginatedEndpoint(endpoint)

    return result.map(it => it.name)
  }

  protected async fetch(endpoint: string, init?: RequestInit): Promise<Response> {
    const fullUrl = `${this.url}/v2/repositories/${this.prefix}/${endpoint}`

    return await fetch(fullUrl, init)
  }

  private async fetchPaginatedEndpoint(endpoint: string): Promise<any[]> {
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

        const fetchNext = next
        next = () =>
          new Promise<Response>(resolve => {
            setTimeout(async () => {
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              fetchNext().then(resolve)
            }, retryAfter * 1000)
          })

        rateTry += 1
      } else {
        throw getRegistryApiException(res, endpoint)
      }
    } while (next)

    return result
  }

  async labels(image: string, tag: string): Promise<Record<string, string>> {
    const labelClient = new V2Labels(DOCKER_HUB_REGISTRY_URL)
    return labelClient.fetchLabels(this.prefix ? `${this.prefix}/${image}` : image, tag)
  }
}
