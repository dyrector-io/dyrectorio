import { Logger } from '@nestjs/common'
import { CruxInternalServerErrorException } from 'src/exception/crux-exception'

type V2Error = {
  code: string
  message: string
  detail: string[]
}

type BaseResponse = {
  errors?: V2Error[]
}

type ManifestResponse = BaseResponse & {
  schemaVersion: number
  config: {
    digest: string
  }
}

type BlobResponse = BaseResponse & {
  config: {
    Labels: Record<string, string>
  }
}

type TokenResponse = {
  token: string
}

type FetchResponse<T> = {
  res: Response
  data: T
}

const ERROR_UNAUTHORIZED = 'UNAUTHORIZED'
const ERROR_DENIED = 'DENINED'
const ERROR_MANIFEST_UNKNOWN = 'MANIFEST_UNKNOWN'

const HEADER_WWW_AUTHENTICATE = 'www-authenticate'

export default class V2Labels {
  private readonly logger = new Logger(V2Labels.name)

  private token?: string

  private manifestMimeType: string

  constructor(
    private baseUrl: string,
    private requestInit?: RequestInit,
    manifestMime?: string,
    private tokenAuth?: string,
  ) {
    this.token = null

    this.manifestMimeType = manifestMime ?? 'application/vnd.docker.distribution.manifest.v2+json'
  }

  private getHeaders(): RequestInit {
    if (!this.token) {
      return this.requestInit
    }

    return {
      ...this.requestInit,
      headers: {
        ...this.requestInit?.headers,
        Authorization: `Bearer ${this.token}`,
      },
    }
  }

  private getTokenHeaders(): RequestInit {
    if (!this.tokenAuth) {
      return {}
    }

    return {
      headers: {
        Authorization: this.tokenAuth,
      },
    }
  }

  private async fetchToken(failedRequest: Response) {
    const auth = failedRequest.headers.get(HEADER_WWW_AUTHENTICATE)

    const typeAndParams: string[] = auth.split(' ')
    const tokenType = typeAndParams[0]
    if (tokenType.toLowerCase() === 'basic') {
      throw new CruxInternalServerErrorException({
        message: 'Registry requires basic authentication!',
        property: 'url',
        value: this.baseUrl,
      })
    }

    const params: Record<string, string> = typeAndParams[1].split(',').reduce((prev, it) => {
      const parts = it.split('=')

      let value = parts[1]
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1)
      }

      prev[parts[0]] = value

      return prev
    }, {})

    const tokenServer = params.realm
    const tokenService = params.service
    const tokenScope = params.scope

    const tokenUrl = `${tokenServer}?service=${encodeURIComponent(tokenService)}&scope=${encodeURIComponent(
      tokenScope,
    )}`

    this.logger.debug(`Fetching token from '${tokenUrl}'`)

    const tokenResponse = await fetch(tokenUrl, this.getTokenHeaders())

    this.logger.debug(`Got token response for '${tokenUrl}' - ${tokenResponse.status}`)

    if (tokenResponse.status !== 200) {
      throw new CruxInternalServerErrorException({
        message: 'Failed to fetch V2 token',
      })
    }

    const tokenData = (await tokenResponse.json()) as TokenResponse

    this.token = tokenData.token
  }

  private async fetchV2<T extends BaseResponse>(endpoint: string, init?: RequestInit): Promise<T> {
    const doFetch = async (): Promise<FetchResponse<T>> => {
      const fullUrl = `${this.baseUrl.startsWith('http') ? this.baseUrl : `https://${this.baseUrl}`}/v2/${endpoint}`

      this.logger.debug(`Fetching '${fullUrl}'`)

      const baseHeaders = this.getHeaders()

      const res = await fetch(fullUrl, {
        ...baseHeaders,
        ...init,
        headers: {
          ...baseHeaders?.headers,
          ...init?.headers,
        },
      })
      const data = (await res.json()) as T

      this.logger.debug(`Got response '${fullUrl}' - ${res.status}`)

      return {
        res,
        data,
      }
    }

    let result = await doFetch()

    if (result.data.errors?.some(it => it.code === ERROR_UNAUTHORIZED)) {
      await this.fetchToken(result.res)

      result = await doFetch()
    }

    const {
      data: { errors },
    } = result

    if (errors) {
      if (result.data.errors?.some(it => it.code === ERROR_UNAUTHORIZED)) {
        throw new CruxInternalServerErrorException({
          message: 'Unauthorized v2 registry API!',
        })
      }

      if (result.data.errors?.some(it => it.code === ERROR_DENIED)) {
        throw new CruxInternalServerErrorException({
          message: 'Access denied to v2 registry!',
        })
      }

      if (result.data.errors?.some(it => it.code === ERROR_MANIFEST_UNKNOWN)) {
        return null
      }

      throw new CruxInternalServerErrorException({
        message: 'Failed to fetch v2 API!',
      })
    }

    return result.data
  }

  async fetchLabels(image: string, tag: string): Promise<Record<string, string>> {
    const manifest = await this.fetchV2<ManifestResponse>(`${image}/manifests/${tag ?? 'latest'}`, {
      headers: {
        Accept: this.manifestMimeType,
      },
    })
    if (!manifest) {
      return {}
    }

    const configManifest = await this.fetchV2<BlobResponse>(`${image}/blobs/${manifest.config.digest}`)

    return configManifest.config.Labels
  }
}
