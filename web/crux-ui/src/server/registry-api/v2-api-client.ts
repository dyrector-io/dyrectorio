import { RegistryImageTags } from '@app/models'
import { internalError, unauthorizedError } from '@server/error-middleware'
import { RegistryApiClient } from './registry-api-client'

export type RegistryV2ApiClientOptions = {
  username?: string
  password?: string
}

class RegistryV2ApiClient implements RegistryApiClient {
  private headers: object

  constructor(private url: string, options?: RegistryV2ApiClientOptions) {
    if (options?.username) {
      if (!options.password) {
        throw unauthorizedError(`Invalid authentication parameters for: ${url}`)
      }

      this.headers = {
        Authorization: `Basic ${Buffer.from(`${options.username}:${options.password}`).toString('base64')}`,
      }
    } else {
      this.headers = {}
    }
  }

  async version() {
    const res = await this._fetch('/')
    if (!res.ok) {
      const errorMessage = `Version request failed with status: ${res.status} ${res.statusText}`
      throw res.status === 401 ? unauthorizedError(errorMessage) : internalError(errorMessage)
    }

    return res
  }

  async catalog(text: string, take: number): Promise<string[]> {
    const res = await this._fetch('/_catalog')
    if (!res.ok) {
      const errorMessage = `Catalog request failed with status: ${res.status} ${res.statusText}`
      throw res.status === 401 ? unauthorizedError(errorMessage) : internalError(errorMessage)
    }

    const dto = await res.json()
    const repositories = dto.repositories as string[]
    return repositories.filter(it => it.includes(text)).slice(0, take)
  }

  async tags(image: string): Promise<RegistryImageTags> {
    const res = await this._fetch(`/${image}/tags/list`)
    if (!res.ok) {
      const errorMessage = `Tags request failed with status: ${res.status} ${res.statusText}`
      throw res.status === 401 ? unauthorizedError(errorMessage) : internalError(errorMessage)
    }

    const json = (await res.json()) as RegistryImageTags
    return {
      ...json,
      name: image,
    }
  }

  private async _fetch(endpoint: string, init?: RequestInit) {
    const initializer = init ?? {}
    const fullUrl = `https://${this.url}/v2${endpoint}`

    return await fetch(fullUrl, {
      ...initializer,
      headers: {
        ...this.headers,
        ...(initializer.headers ?? {}),
      },
    })
  }
}

export default RegistryV2ApiClient
