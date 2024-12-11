import { Cache } from 'cache-manager'
import { CruxUnauthorizedException } from 'src/exception/crux-exception'
import { getRegistryApiException } from 'src/exception/registry-exception'
import { RegistryImageTag, RegistryImageTags } from '../registry.message'
import { RegistryApiClient } from './registry-api-client'
import V2HttpApiClient from './v2-http-api-client'

export type RegistryV2ApiClientOptions = {
  imageNamePrefix?: string
  username?: string
  password?: string
}

export const registryCredentialsToBasicAuth = (options: RegistryV2ApiClientOptions) =>
  `Basic ${Buffer.from(`${options.username}:${options.password}`).toString('base64')}`

type TagsList = {
  name: string
  tags: string[]
}

class RegistryV2ApiClient implements RegistryApiClient {
  private headers: HeadersInit

  private imageNamePrefix?: string

  get subpath(): string {
    return !this.imageNamePrefix ? '/v2' : `/v2/${this.imageNamePrefix}`
  }

  constructor(
    private url: string,
    private readonly cache: Cache | null,
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

    this.imageNamePrefix = options?.imageNamePrefix
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

    const json = (await res.json()) as TagsList[]
    const tags = json.flatMap(it => it.tags)

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

  private createApiClient(): V2HttpApiClient {
    return new V2HttpApiClient(
      {
        baseUrl: this.url,
        imageNamePrefix: this.imageNamePrefix,
        requestInit: {
          headers: this.headers,
        },
        tryV1Manifest: true, // NOTE(@robot9706): Enable V1 manifest fetch if possible as it reduces API calls
      },
      this.cache,
    )
  }

  async labels(image: string, tag: string): Promise<Record<string, string>> {
    return this.createApiClient().fetchLabels(image, tag)
  }

  async tagInfo(image: string, tag: string): Promise<RegistryImageTag> {
    return this.createApiClient().fetchTagInfo(image, tag)
  }

  private async fetch(endpoint: string, init?: RequestInit): Promise<Response> {
    const initializer = init ?? {}

    const fullUrl = `https://${this.url}${this.subpath}${endpoint}`

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
