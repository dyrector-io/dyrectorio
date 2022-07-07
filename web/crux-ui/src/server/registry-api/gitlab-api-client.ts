import { RegistryImageTags } from '@app/models'
import { internalError, notFoundError, unauthorizedError } from '@server/error-middleware'
import { RegistryApiClient } from './registry-api-client'
import RegistryV2ApiClient, { RegistryV2ApiClientOptions } from './v2-api-client'

export type GitlabRegistryClientUrls = {
  apiUrl: string
  registryUrl: string
}

export class GitlabRegistryClient implements RegistryApiClient {
  private basicAuthHeaders: HeadersInit
  private patAuthHeaders: HeadersInit
  private groupId?: string = null

  constructor(private groupName: string, options: RegistryV2ApiClientOptions, private urls: GitlabRegistryClientUrls) {
    this.basicAuthHeaders = {
      Authorization: `Basic ${Buffer.from(`${options.username}:${options.password}`).toString('base64')}`,
    }

    this.patAuthHeaders = {
      Authorization: `Bearer ${options.password}`,
    }
  }

  async catalog(text: string, take: number): Promise<string[]> {
    const groupId = await this.fetchGroupId()

    const res = await fetch(`https://${this.urls.apiUrl}/api/v4/groups/${groupId}/registry/repositories`, {
      headers: this.patAuthHeaders,
    })

    if (!res.ok) {
      const errorMessage = `Gitlab repositories request failed with status: ${res.status} ${res.statusText}`
      throw res.status === 401 ? unauthorizedError(errorMessage) : internalError(errorMessage)
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
      const errorMessage = `Gitlab jwt auth request failed with status: ${tokenRes.status} ${tokenRes.statusText}`
      throw tokenRes.status === 401 ? unauthorizedError(errorMessage) : internalError(errorMessage)
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
      const errorMessage = `Gitlab tags request failed for image ${image} with status: ${res.status} ${res.statusText}`
      throw res.status === 401 ? unauthorizedError(errorMessage) : internalError(errorMessage)
    }

    const json = (await res.json()) as RegistryImageTags[]
    return {
      name: image,
      tags: json.flatMap(it => it.tags),
    }
  }

  private async fetchGroupId(): Promise<string> {
    if (this.groupId) {
      return this.groupId
    }

    const res = await fetch(`https://${this.urls.apiUrl}/api/v4/groups?top_level_only=true&search=${this.groupName}`, {
      headers: this.patAuthHeaders,
    })
    if (!res.ok) {
      const errorMessage = `Gitlab repositories request failed with status: ${res.status} ${res.statusText}`
      throw res.status === 401 ? unauthorizedError(errorMessage) : internalError(errorMessage)
    }

    const groups = (await res.json()) as { id: string }[]
    if (!groups || groups.length < 1) {
      throw notFoundError('groupName', 'Group not found.', this.groupName)
    }

    return groups[0].id
  }
}
