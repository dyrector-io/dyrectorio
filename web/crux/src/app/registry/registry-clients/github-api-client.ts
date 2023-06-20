import { REGISTRY_GITHUB_URL } from 'src/shared/const'
import { getRegistryApiException } from 'src/exception/registry-exception'
import { GithubNamespace } from '../registry.dto'
import { RegistryImageTags } from '../registry.message'
import { RegistryApiClient } from './registry-api-client'
import RegistryV2ApiClient, { RegistryV2ApiClientOptions, registryCredentialsToBasicAuth } from './v2-api-client'

class GithubRegistryClient implements RegistryApiClient {
  private basicAuthHeaders: HeadersInit

  private namespace: string

  constructor(private imageNamePrefix: string, options: RegistryV2ApiClientOptions, namespace: GithubNamespace) {
    this.basicAuthHeaders = {
      Authorization: registryCredentialsToBasicAuth(options),
    }

    this.namespace = namespace === 'organization' ? 'orgs' : 'users'
  }

  async catalog(text: string): Promise<string[]> {
    const res = await fetch(
      `https://api.github.com/${this.namespace}/${this.imageNamePrefix}/packages?package_type=container`,
      {
        headers: { ...this.basicAuthHeaders, accept: 'application/vnd.github.v3+json' },
      },
    )

    if (!res.ok) {
      throw getRegistryApiException(res, 'Github packages request')
    }

    const json = (await res.json()) as { name: string }[]
    const repositories = json.flatMap(it => it.name) as string[]
    return repositories.filter(it => it.includes(text))
  }

  async tags(image: string): Promise<RegistryImageTags> {
    const tokenRes = await fetch(
      `https://${REGISTRY_GITHUB_URL}/token?service=${REGISTRY_GITHUB_URL}&scope=repository:${this.imageNamePrefix}/${image}:pull`,
      {
        headers: this.basicAuthHeaders,
      },
    )
    if (!tokenRes.ok) {
      throw getRegistryApiException(tokenRes, 'Github auth request')
    }

    const token = ((await tokenRes.json()) as { token: string })?.token

    const fetcher = async (endpoint: string) =>
      await fetch(`https://${REGISTRY_GITHUB_URL}/v2/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

    const res = await RegistryV2ApiClient.fetchPaginatedEndpoint(fetcher, `/${this.imageNamePrefix}/${image}/tags/list`)
    if (!res.ok) {
      throw getRegistryApiException(tokenRes, '`Github tags request')
    }

    const json = (await res.json()) as RegistryImageTags[]
    return {
      name: image,
      tags: json.flatMap(it => it.tags),
    }
  }
}

export default GithubRegistryClient
