import { getRegistryApiException } from 'src/exception/registry-exception'
import { GitlabNamespace } from '../registry.dto'
import { RegistryImageWithTags } from '../registry.message'
import {
  RegistryApiClient,
  RegistryImageTagInfo,
  TagsList,
  fetchInfoForTags,
  tagNamesToImageTags,
} from './registry-api-client'
import V2HttpApiClient from './v2-http-api-client'
import RegistryV2ApiClient, { RegistryV2ApiClientOptions } from './v2-registry-api-client'

export type GitlabRegistryClientUrls = {
  apiUrl: string
  registryUrl: string
}

type GitlabRegistryClientOptions = RegistryV2ApiClientOptions & {
  namespaceId: string
  namespace: GitlabNamespace
}

export class GitlabRegistryClient implements RegistryApiClient {
  private basicAuthHeaders: HeadersInit

  private patAuthHeaders: HeadersInit

  private namespace: string

  constructor(
    private readonly urls: GitlabRegistryClientUrls,
    private readonly options: GitlabRegistryClientOptions,
  ) {
    this.basicAuthHeaders = {
      Authorization: `Basic ${Buffer.from(`${options.username}:${options.password}`).toString('base64')}`,
    }

    this.patAuthHeaders = {
      Authorization: `Bearer ${options.password}`,
    }

    this.namespace = options.namespace === 'group' ? 'groups' : 'projects'
  }

  async catalog(text: string): Promise<string[]> {
    const res = await fetch(
      `https://${this.urls.apiUrl}/api/v4/${this.namespace}/${this.options.namespaceId}/registry/repositories`,
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
        baseUrl: this.urls.registryUrl,
        tokenInit: {
          headers: this.basicAuthHeaders,
        },
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
}
