import { CruxUnauthorizedException } from 'src/exception/crux-exception'
import { getRegistryApiException } from 'src/exception/registry-exception'
import { RegistryImageTags } from '../registry.message'
import { RegistryApiClient } from './registry-api-client'
import V2Labels from './v2-labels'

export type RegistryV2ApiClientOptions = {
  username?: string
  password?: string
}

export const registryCredentialsToBasicAuth = (options: RegistryV2ApiClientOptions) =>
  `Basic ${Buffer.from(`${options.username}:${options.password}`).toString('base64')}`

class RegistryV2ApiClient implements RegistryApiClient {
  private headers: HeadersInit

  constructor(
    private url: string,
    options?: RegistryV2ApiClientOptions,
  ) {
    if (options?.username) {
      if (!options.password) {
        throw new CruxUnauthorizedException({
          message: `Invalid authentication parameters for: ${url}`,
        })
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
      throw getRegistryApiException(res, 'Version request')
    }

    return res
  }

  async catalog(text: string): Promise<string[]> {
    const res = await RegistryV2ApiClient.fetchPaginatedEndpoint(it => this.fetch(it), '/_catalog')
    if (!res.ok) {
      throw getRegistryApiException(res, 'Catalog request')
    }

    const json = (await res.json()) as { repositories: string }[]
    const repositories = json.flatMap(it => it.repositories) as string[]
    return repositories.filter(it => it.includes(text))
  }

  async tags(image: string): Promise<RegistryImageTags> {
    const res = await RegistryV2ApiClient.fetchPaginatedEndpoint(it => this.fetch(it), `/${image}/tags/list`)
    if (!res.ok) {
      throw getRegistryApiException(res, 'Tags request')
    }

    const json = (await res.json()) as RegistryImageTags[]
    return {
      name: image,
      tags: json.flatMap(it => it.tags),
    }
  }

  async labels(image: string, tag: string): Promise<Record<string, string>> {
    const labelClient = new V2Labels(this.url, {
      headers: this.headers,
    })
    return labelClient.fetchLabels(image, tag)
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

    const generateResponse = (res: Response) => {
      res.json = async () => bodies
      return res
    }

    let next = endpoint
    let res: Response = null
    while (next) {
      // eslint-disable-next-line no-await-in-loop
      res = await fetcher(next)
      if (!res.ok) {
        return res
      }

      // eslint-disable-next-line no-await-in-loop
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
