import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { RegistryApiClient } from './registry-api-client'
import { RegistryImageTags } from '../registry.message'

export type RegistryV2ApiClientOptions = {
  username?: string
  password?: string
}

export const registryCredentialsToBasicAuth = (options: RegistryV2ApiClientOptions) =>
  `Basic ${Buffer.from(`${options.username}:${options.password}`).toString('base64')}`

class RegistryV2ApiClient implements RegistryApiClient {
  private headers: HeadersInit

  constructor(private url: string, options?: RegistryV2ApiClientOptions) {
    if (options?.username) {
      if (!options.password) {
        throw new UnauthorizedException(`Invalid authentication parameters for: ${url}`)
      }

      this.headers = {
        Authorization: registryCredentialsToBasicAuth(options),
      }
    } else {
      this.headers = {}
    }
  }

  async version() {
    const res = await this.fetch('/')
    if (!res.ok) {
      const errorMessage = `Version request failed with status: ${res.status} ${res.statusText}`
      throw res.status === 401
        ? new UnauthorizedException(errorMessage)
        : new InternalServerErrorException(errorMessage)
    }

    return res
  }

  async catalog(text: string, take: number): Promise<string[]> {
    const res = await RegistryV2ApiClient.fetchPaginatedEndpoint(it => this.fetch(it), '/_catalog')
    if (!res.ok) {
      const errorMessage = `Catalog request failed with status: ${res.status} ${res.statusText}`
      throw res.status === 401
        ? new UnauthorizedException(errorMessage)
        : new InternalServerErrorException(errorMessage)
    }

    const json = (await res.json()) as { repositories: string }[]
    const repositories = json.flatMap(it => it.repositories) as string[]
    return repositories.filter(it => it.includes(text)).slice(0, take)
  }

  async tags(image: string): Promise<RegistryImageTags> {
    const res = await RegistryV2ApiClient.fetchPaginatedEndpoint(it => this.fetch(it), `/${image}/tags/list`)
    if (!res.ok) {
      const errorMessage = `Tags request failed with status: ${res.status} ${res.statusText}`
      throw res.status === 401
        ? new UnauthorizedException(errorMessage)
        : new InternalServerErrorException(errorMessage)
    }

    const json = (await res.json()) as RegistryImageTags[]
    return {
      name: image,
      tags: json.flatMap(it => it.tags),
    }
  }

  private async fetch(endpoint: string, init?: RequestInit): Promise<Response> {
    const initializer = init ?? {}
    const fullUrl = `https://${this.url}/v2${endpoint}`

    return await fetch(fullUrl, {
      ...initializer,
      headers: {
        ...this.headers,
        ...(initializer.headers ?? {}),
      },
    })
  }

  public static async fetchPaginatedEndpoint(
    fetcher: (endpoint: string) => Promise<Response>,
    endpoint: string,
  ): Promise<Response> {
    const bodies = []

    // TODO @m8 could you tell me what is this function doing?
    const generateResponse = (res: Response) => {
      res.json = async () => bodies
      return res
    }

    let next = endpoint
    let res: Response = null
    while (next) {
      res = await fetcher(next)
      if (!res.ok) {
        return res
      }

      const body = await res.json()
      bodies.push(body)

      next = res.headers.get('link')
      if (!next || next.length < 1) {
        return generateResponse(res)
      }

      // slice of: </v2/_catalog?last=<image_name>&n=100>;
      next = next.slice(4, next.indexOf('>;'))
    }

    return generateResponse(res)
  }
}

export default RegistryV2ApiClient
