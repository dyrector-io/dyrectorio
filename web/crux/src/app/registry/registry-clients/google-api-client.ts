import { JWT } from 'google-auth-library'
import { GetAccessTokenResponse } from 'google-auth-library/build/src/auth/oauth2client'
import { CruxUnauthorizedException } from 'src/exception/crux-exception'
import { getRegistryApiException } from 'src/exception/registry-exception'
import { RegistryImageTags } from '../registry.message'
import { RegistryApiClient } from './registry-api-client'

export type GoogleClientOptions = {
  username?: string
  password?: string
}

export class GoogleRegistryClient implements RegistryApiClient {
  private headers: HeadersInit = {}

  private client: JWT

  constructor(
    private url: string,
    private imageNamePrefix: string,
    options?: GoogleClientOptions,
  ) {
    if (options?.username) {
      if (!options.password) {
        throw new CruxUnauthorizedException({
          message: `Invalid authentication parameters for: ${url}`,
          error: 'registryUnauthorized',
        })
      }

      this.client = new JWT({
        email: options.username,
        key: options.password,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      })
    }
  }

  async registryCredentialsToBearerAuth() {
    let accessToken: GetAccessTokenResponse
    try {
      accessToken = await this.client.getAccessToken()
    } catch (err) {
      throw new CruxUnauthorizedException({
        message: `Google auth request failed`,
        error: 'registryUnauthorized',
      })
    }

    this.headers = {
      Authorization: `Bearer ${accessToken?.token}`,
      Accept: `application/json`,
    }
  }

  async catalog(text: string): Promise<string[]> {
    if (this.client) {
      await this.registryCredentialsToBearerAuth()
    }

    const url = `https://${this.url}/v2/${this.imageNamePrefix}/tags/list`

    const res = await fetch(url, {
      headers: this.headers,
    })

    if (!res.ok) {
      throw getRegistryApiException(res, 'Google repositories request')
    }

    const json = (await res.json()) as { child: string[] }

    return json.child.filter(it => it.includes(text))
  }

  async tags(image: string): Promise<RegistryImageTags> {
    if (this.client) {
      await this.registryCredentialsToBearerAuth()
    }

    const url = `https://${this.url}/v2/${this.imageNamePrefix}/${image}/tags/list`

    const tagRes = await fetch(url, {
      headers: this.headers,
    })

    if (!tagRes.ok) {
      throw getRegistryApiException(tagRes, 'Google tags request')
    }

    const json = (await tagRes.json()) as { tags: string[] }
    return {
      name: image,
      tags: json.tags,
    }
  }
}
