import {
  CruxExceptionOptions,
  CruxInternalServerErrorException,
  CruxUnauthorizedException,
} from 'src/exception/crux-exception'
import { GitlabNamespace } from '../registry.dto'
import { RegistryImageTags } from '../registry.message'
import { RegistryApiClient } from './registry-api-client'
import RegistryV2ApiClient, { RegistryV2ApiClientOptions } from './v2-api-client'

export type GitlabRegistryClientUrls = {
  apiUrl: string
  registryUrl: string
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
  ) {
    this.basicAuthHeaders = {
      Authorization: `Basic ${Buffer.from(`${options.username}:${options.password}`).toString('base64')}`,
    }

    this.patAuthHeaders = {
      Authorization: `Bearer ${options.password}`,
    }

    this.namespace = namespace === 'group' ? 'groups' : 'projects'
  }

  async catalog(text: string, take: number): Promise<string[]> {
    const res = await fetch(
      `https://${this.urls.apiUrl}/api/v4/${this.namespace}/${this.namespaceId}/registry/repositories`,
      {
        headers: this.patAuthHeaders,
      },
    )

    if (!res.ok) {
      const excOptions: CruxExceptionOptions = {
        message: `Gitlab repositories request failed with status: ${res.status} ${res.statusText}`,
      }
      throw res.status === 401
        ? new CruxUnauthorizedException(excOptions)
        : new CruxInternalServerErrorException(excOptions)
    }

    const json = (await res.json()) as { path: string }[]
    const repositories = json.flatMap(it => it.path) as string[]
    return repositories.filter(it => it.includes(text)).slice(0, take)
  }

  async tags(image: string): Promise<RegistryImageTags> {
    const tokenRes = await fetch(
      `https://${this.urls.apiUrl}/jwt/auth?service=container_registry&scope=repository:${image}:pull`,
      {
        headers: this.basicAuthHeaders,
      },
    )
    if (!tokenRes.ok) {
      const excOptions: CruxExceptionOptions = {
        message: `Gitlab jwt auth request failed with status: ${tokenRes.status} ${tokenRes.statusText}`,
      }
      throw tokenRes.status === 401
        ? new CruxUnauthorizedException(excOptions)
        : new CruxInternalServerErrorException(excOptions)
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
      const excOptions: CruxExceptionOptions = {
        message: `Gitlab tags request failed for image ${image} with status: ${res.status} ${res.statusText}`,
      }
      throw res.status === 401
        ? new CruxUnauthorizedException(excOptions)
        : new CruxInternalServerErrorException(excOptions)
    }

    const json = (await res.json()) as RegistryImageTags[]
    return {
      name: image,
      tags: json.flatMap(it => it.tags),
    }
  }
}
