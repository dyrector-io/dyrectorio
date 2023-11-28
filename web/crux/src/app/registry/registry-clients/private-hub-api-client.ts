import { CruxUnauthorizedException } from 'src/exception/crux-exception'
import { getRegistryApiException } from 'src/exception/registry-exception'
import { RegistryImageTags } from '../registry.message'
import { RegistryApiClient } from './registry-api-client'

type HubApiPaginatedResponse = {
  count: number
  next?: string
  previous?: string
  results: any[]
}

const MAX_RATE_RETRY = 3

export default class PrivateHubApiClient implements RegistryApiClient {
  private url: string

  private jwt: string = null

  constructor(
    url: string,
    private prefix: string,
  ) {
    this.url = `https://${url}`
  }

  async login(user: string, token: string): Promise<void> {
    if (this.jwt) {
      return
    }

    console.log('uname', user)

    const res = await fetch(`${this.url}/v2/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: user,
        password: token,
      }),
    })

    if (!res.ok) {
      throw new CruxUnauthorizedException({
        message: 'Failed to authenticate with Docker Hub',
        property: 'token',
      })
    }

    const dto: { token: string } = await res.json()
    this.jwt = dto.token
  }

  async catalog(text: string): Promise<string[]> {
    const endpoint = ''

    const result = await this.fetchPaginatedEndpoint(endpoint)

    const repositories = result.map(it => it.name)

    return repositories.filter(it => it.includes(text))
  }

  async tags(image: string): Promise<RegistryImageTags> {
    const endpoint = `${image}/tags?page_size=100`

    const result = await this.fetchPaginatedEndpoint(endpoint)

    const tags = result.map(it => it.name)

    return {
      tags,
      name: image,
    }
  }

  private async fetch(endpoint: string, init?: RequestInit) {
    if (!this.jwt) {
      throw new CruxUnauthorizedException({
        message: 'The Docker Hub API Client has not logged in yet.',
      })
    }

    const initializer = init ?? {}
    const fullUrl = `${this.url}/v2/repositories/${this.prefix}/${endpoint}`

    const initHeaders = initializer.headers ?? {}
    const headers = {
      ...initHeaders,
      authorization: `Bearer ${this.jwt}`,
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
}
