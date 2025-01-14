import { Cache } from 'cache-manager'
import { getRegistryApiException } from 'src/exception/registry-exception'
import { REGISTRY_GITHUB_URL } from 'src/shared/const'
import { GithubNamespace } from '../registry.dto'
import { RegistryImageWithTags } from '../registry.message'
import { RegistryApiClient, RegistryImageTagInfo, fetchInfoForTags } from './registry-api-client'
import V2HttpApiClient from './v2-http-api-client'
import RegistryV2ApiClient, {
  RegistryV2ApiClientOptions,
  registryCredentialsToBasicAuth,
} from './v2-registry-api-client'

type TagsList = {
  name: string
  tags: string[]
}

class GithubRegistryClient implements RegistryApiClient {
  private basicAuthHeaders: HeadersInit

  private namespace: string

  constructor(
    private imageNamePrefix: string,
    options: RegistryV2ApiClientOptions,
    namespace: GithubNamespace,
    private readonly cache: Cache | null,
  ) {
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

  async tags(image: string): Promise<RegistryImageWithTags> {
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

    const json = (await res.json()) as TagsList[]
    const tags = json.flatMap(it => it.tags)
    const tagInfo = await fetchInfoForTags(image, tags, this)

    return {
      name: image,
      tags: tagInfo,
    }
  }

  private createApiClient(): V2HttpApiClient {
    // NOTE(@robot9706): ghcr.io expects the accept manifest to be "v1" but it responds with v2 manifests
    return new V2HttpApiClient(
      {
        baseUrl: REGISTRY_GITHUB_URL,
        imageNamePrefix: this.imageNamePrefix,
        requestInit: {
          headers: this.basicAuthHeaders,
        },
        manifestMime: 'application/vnd.docker.distribution.manifest.v1+json',
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

export default GithubRegistryClient
