import { Cache } from 'cache-manager'
import { CruxUnauthorizedException } from 'src/exception/crux-exception'
import { getRegistryApiException } from 'src/exception/registry-exception'
import { RegistryImageWithTags } from '../registry.message'
import {
  RegistryApiClient,
  RegistryImageTagInfo,
  TagsList,
  fetchInfoForTags,
  tagNamesToImageTags,
} from './registry-api-client'
import V2HttpApiClient from './v2-http-api-client'

export type RegistryV2ApiClientOptions = {
  cache: Cache | null
  disableTagInfo: boolean
  imageNamePrefix?: string
  username?: string
  password?: string
}

export type RegistryV2Credentials = {
  username: string
  password: string
}

export const registryCredentialsToBasicAuth = (options: RegistryV2Credentials) =>
  `Basic ${Buffer.from(`${options.username}:${options.password}`).toString('base64')}`

class RegistryV2ApiClient implements RegistryApiClient {
  private headers: HeadersInit

  get subpath(): string {
    return !this.options.imageNamePrefix ? '/v2' : `/v2/${this.options.imageNamePrefix}`
  }

  constructor(
    private readonly url: string,
    protected readonly options: RegistryV2ApiClientOptions,
  ) {
    if (options.username) {
      if (!options.password) {
        throw new CruxUnauthorizedException({
          message: `Invalid authentication parameters for: ${url}`,
        })
      }

      this.headers = {
        Authorization: registryCredentialsToBasicAuth(options as RegistryV2Credentials),
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

  async tags(image: string): Promise<RegistryImageWithTags> {
    const res = await RegistryV2ApiClient.fetchPaginatedEndpoint(it => this.fetch(it), `/${image}/tags/list`)
    if (!res.ok) {
      throw getRegistryApiException(res, 'Tags request')
    }

    const tagsList = (await res.json()) as TagsList[]
    const tagNames = tagsList.flatMap(it => it.tags)
    const tags = this.options.disableTagInfo
      ? tagNamesToImageTags(tagNames)
      : await fetchInfoForTags(image, tagNames, this)

    return {
      name: image,
      tags,
    }
  }

  private createApiClient(): V2HttpApiClient {
    return new V2HttpApiClient(
      {
        baseUrl: this.url,
        imageNamePrefix: this.options.imageNamePrefix,
        requestInit: {
          headers: this.headers,
        },
        tryV1Manifest: true, // NOTE(@robot9706): Enable V1 manifest fetch if possible as it reduces API calls
      },
      this.options.cache,
    )
  }

  async labels(image: string, tag: string): Promise<Record<string, string>> {
    return this.createApiClient().fetchLabels(image, tag)
  }

  async tagInfo(image: string, tag: string): Promise<RegistryImageTagInfo> {
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
