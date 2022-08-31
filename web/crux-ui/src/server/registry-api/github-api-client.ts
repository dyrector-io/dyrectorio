import { REGISTRY_GITHUB_URL } from '@app/const'
import { internalError, RegistryImageTags, unauthorizedError } from '@app/models'
import { RegistryApiClient } from './registry-api-client'
import RegistryV2ApiClient, { registryCredentialsToBasicAuth, RegistryV2ApiClientOptions } from './v2-api-client'

class GithubRegistryClient implements RegistryApiClient {
  private basicAuthHeaders: HeadersInit

  constructor(private organization: string, options: RegistryV2ApiClientOptions) {
    this.basicAuthHeaders = {
      Authorization: registryCredentialsToBasicAuth(options),
    }
  }

  async catalog(text: string, take: number): Promise<string[]> {
    const res = await fetch(`https://api.github.com/orgs/${this.organization}/packages?package_type=container`, {
      headers: { ...this.basicAuthHeaders, accept: 'application/vnd.github.v3+json' },
    })

    if (!res.ok) {
      const errorMessage = `Github packages request failed with status: ${res.status} ${res.statusText}`
      throw res.status === 401 ? unauthorizedError(errorMessage) : internalError(errorMessage)
    }

    const json = (await res.json()) as { name: string }[]
    const repositories = json.flatMap(it => it.name) as string[]
    return repositories.filter(it => it.includes(text)).slice(0, take)
  }

  async tags(image: string): Promise<RegistryImageTags> {
    const tokenRes = await fetch(
      `https://${REGISTRY_GITHUB_URL}/token?service=${REGISTRY_GITHUB_URL}&scope=repository:${this.organization}/${image}:pull`,
      {
        headers: this.basicAuthHeaders,
      },
    )
    if (!tokenRes.ok) {
      const errorMessage = `Github auth request failed with status: ${tokenRes.status} ${tokenRes.statusText}`
      throw tokenRes.status === 401 ? unauthorizedError(errorMessage) : internalError(errorMessage)
    }

    const token = ((await tokenRes.json()) as { token: string })?.token

    const fetcher = async (endpoint: string) =>
      await fetch(`https://${REGISTRY_GITHUB_URL}/v2/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

    const res = await RegistryV2ApiClient.fetchPaginatedEndpoint(fetcher, `/${this.organization}/${image}/tags/list`)
    if (!res.ok) {
      const errorMessage = `Github tags request failed with status: ${res.status} ${res.statusText}`
      throw res.status === 401 ? unauthorizedError(errorMessage) : internalError(errorMessage)
    }

    const json = (await res.json()) as RegistryImageTags[]
    return {
      name: image,
      tags: json.flatMap(it => it.tags),
    }
  }
}

export default GithubRegistryClient
