import { JWT } from 'google-auth-library'
import { GetAccessTokenResponse } from 'google-auth-library/build/src/auth/oauth2client'
import { RegistryApiClient } from './registry-api-client'
import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { RegistryImageTags } from '../registry.message'

export type GoogleClientOptions = {
  username?: string
  password?: string
}

export class GoogleRegistryClient implements RegistryApiClient {
  private headers: HeadersInit = {}

  private client: JWT

  constructor(private url: string, private imageNamePrefix: string, options?: GoogleClientOptions) {
    if (options?.username) {
      if (!options.password) {
        throw new UnauthorizedException(`Invalid authentication parameters for: ${url}`)
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
      throw new UnauthorizedException(`Google auth request failed`)
    }

    this.headers = {
      Authorization: `Bearer ${accessToken?.token}`,
      Accept: `application/json`,
    }
  }

  async catalog(text: string, take: number): Promise<string[]> {
    if (this.client) {
      await this.registryCredentialsToBearerAuth()
    }

    const url = `https://${this.url}/v2/${this.imageNamePrefix}/tags/list`

    const res = await fetch(url, {
      headers: this.headers,
    })

    if (!res.ok) {
      const errorMessage = `Google repositories request failed with status: ${res.status} ${res.statusText}`
      throw res.status === 401
        ? new UnauthorizedException(errorMessage)
        : new InternalServerErrorException(errorMessage)
    }

    const json = (await res.json()) as { child: string[] }

    return json.child.filter(it => it.includes(text)).slice(0, take)
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
      const errorMessage = `Google tags request failed with status: ${tagRes.status} ${tagRes.statusText}`
      throw tagRes.status === 401
        ? new UnauthorizedException(errorMessage)
        : new InternalServerErrorException(errorMessage)
    }

    const json = (await tagRes.json()) as { tags: string[] }
    return {
      name: image,
      tags: json.tags,
    }
  }
}
