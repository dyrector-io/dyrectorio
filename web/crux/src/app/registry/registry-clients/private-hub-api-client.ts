import { CruxUnauthorizedException } from 'src/exception/crux-exception'
import { RegistryImageTags } from '../registry.message'
import HubApiClient, { DOCKER_HUB_REGISTRY_URL } from './hub-api-client'
import { RegistryApiClient } from './registry-api-client'
import { registryCredentialsToBasicAuth } from './v2-api-client'
import V2Labels from './v2-labels'

export default class PrivateHubApiClient extends HubApiClient implements RegistryApiClient {
  private jwt: string = null

  private labelsAuth: RequestInit = null

  constructor(url: string, prefix: string) {
    super(`https://${url}`, prefix)
  }

  async login(user: string, token: string): Promise<void> {
    if (this.jwt) {
      return
    }

    this.labelsAuth = {
      headers: {
        Authorization: registryCredentialsToBasicAuth({
          username: user,
          password: token,
        }),
      },
    }

    const res = await fetch(`${this.url}/v2/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: user,
        password: token,
      }),
    })

    if (!res.ok) {
      throw new CruxUnauthorizedException({
        message: 'Failed to authenticate with Docker Hub',
        property: 'token',
      })
    }

    const dto: { token: string } = await res.json()
    this.jwt = dto.token
  }

  async catalog(text: string): Promise<string[]> {
    const repositories = await super.fetchCatalog()

    return repositories.filter(it => it.includes(text))
  }

  async tags(image: string): Promise<RegistryImageTags> {
    const tags = await super.fetchTags(image)

    return {
      tags,
      name: image,
    }
  }

  protected override async fetch(endpoint: string, init?: RequestInit): Promise<Response> {
    if (!this.jwt) {
      throw new CruxUnauthorizedException({
        message: 'The Docker Hub API Client has not logged in yet.',
      })
    }

    const initializer = init ?? {}

    const initHeaders = initializer.headers ?? {}
    const headers = {
      ...initHeaders,
      authorization: `Bearer ${this.jwt}`,
    }

    return await super.fetch(endpoint, {
      ...initializer,
      headers,
    })
  }

  async labels(image: string, tag: string): Promise<Record<string, string>> {
    const labelClient = new V2Labels(DOCKER_HUB_REGISTRY_URL, null, null, this.labelsAuth)
    return labelClient.fetchLabels(this.prefix ? `${this.prefix}/${image}` : image, tag)
  }
}
