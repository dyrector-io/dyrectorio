import { Cache } from 'cache-manager'
import { getRegistryApiException } from 'src/exception/registry-exception'
import { GitlabNamespace } from '../registry.dto'
import { RegistryImageWithTags } from '../registry.message'
import { RegistryApiClient, RegistryImageTagInfo, fetchInfoForTags } from './registry-api-client'
import V2HttpApiClient from './v2-http-api-client'
import RegistryV2ApiClient, { RegistryV2ApiClientOptions } from './v2-registry-api-client'

export type GitlabRegistryClientUrls = {
  apiUrl: string
  registryUrl: string
}

type TagsList = {
  name: string
  tags: string[]
}

export class GitlabRegistryClient implements RegistryApiClient {
  private basicAuthHeaders: HeadersInit

  private patAuthHeaders: HeadersInit

  private namespace: string

  constructor(
    private namespaceId: string,
    options: RegistryV2ApiClientOptions,
    private urls: GitlabRegistryClientUrls,
    namespace: GitlabNamespace,
    private readonly cache: Cache | null,
  ) {
    this.basicAuthHeaders = {
      Authorization: `Basic ${Buffer.from(`${options.username}:${options.password}`).toString('base64')}`,
    }

    this.patAuthHeaders = {
      Authorization: `Bearer ${options.password}`,
    }

    this.namespace = namespace === 'group' ? 'groups' : 'projects'
  }

  async catalog(text: string): Promise<string[]> {
    const res = await fetch(
      `https://${this.urls.apiUrl}/api/v4/${this.namespace}/${this.namespaceId}/registry/repositories`,
      {
        headers: this.patAuthHeaders,
      },
    )

    if (!res.ok) {
      throw getRegistryApiException(res, 'Gitlab repositories request')
    }

    const json = (await res.json()) as { path: string }[]
    const repositories = json.flatMap(it => it.path) as string[]
    return repositories.filter(it => it.includes(text))
  }

  async tags(image: string): Promise<RegistryImageWithTags> {
    const tokenRes = await fetch(
      `https://${this.urls.apiUrl}/jwt/auth?service=container_registry&scope=repository:${image}:pull`,
      {
        headers: this.basicAuthHeaders,
      },
    )
    if (!tokenRes.ok) {
      throw getRegistryApiException(tokenRes, 'Gitlab jwt auth request')
    }

    const token = ((await tokenRes.json()) as { token: string })?.token

    const fetcher = async (endpoint: string) =>
      await fetch(`https://${this.urls.registryUrl}/v2/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

    const res = await RegistryV2ApiClient.fetchPaginatedEndpoint(fetcher, `/${image}/tags/list`)
    if (!res.ok) {
      throw getRegistryApiException(res, `Gitlab tags for image ${image}`)
    }

    const json = (await res.json()) as TagsList[]
    const tags = json.flatMap(it => it.tags)
    const tagInfo = await fetchInfoForTags(image, tags, this)

    return {
      name: image,
      tags: tagInfo,
    }
  }

  private createApiClient(): V2HttpApiClient {
    return new V2HttpApiClient(
      {
        baseUrl: this.urls.registryUrl,
        tokenInit: {
          headers: this.basicAuthHeaders,
        },
      },
      this.cache,
    )
  }

  async labels(image: string, tag: string): Promise<Record<string, string>> {
    return this.createApiClient().fetchLabels(image, tag)
  }

  async tagInfo(image: string, tag: string): Promise<RegistryImageTagInfo> {
    return this.createApiClient().fetchTagInfo(image, tag)
  }
}
