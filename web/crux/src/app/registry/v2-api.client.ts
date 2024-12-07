import { Logger } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { CruxInternalServerErrorException } from 'src/exception/crux-exception'
import { USER_AGENT_CRUX } from 'src/shared/const'

type V2Error = {
  code: string
  message: string
  detail: string[]
}

type BaseResponse = {
  errors?: V2Error[]
}

type ManifestBaseResponse = BaseResponse & {
  schemaVersion: number
  mediaType: string
}

type ManifestResponse = ManifestBaseResponse & {
  config: {
    digest: string
  }
}

type ManifestIndexResponse = ManifestBaseResponse & {
  manifests: {
    mediaType: string
    digest: string
  }[]
}

type BlobResponse = BaseResponse & {
  config: {
    Labels: Record<string, string>
  }
  created: string
}

type TokenResponse = {
  token: string
}

type FetchResponse<T> = {
  res: Response
  data: T
}

export type V2ApiClientOptions = {
  baseUrl: string,
  imageNamePrefix?: string,
  requestInit?: RequestInit,
  manifestMime?: string,
  tokenInit?: RequestInit,
}

export type TagInfo = {
  createdAt: string
}

const ERROR_UNAUTHORIZED = 'UNAUTHORIZED'
const ERROR_DENIED = 'DENINED'
const ERROR_MANIFEST_UNKNOWN = 'MANIFEST_UNKNOWN'

const HEADER_WWW_AUTHENTICATE = 'www-authenticate'

const MEDIA_TYPE_INDEX = 'application/vnd.oci.image.index.v1+json'
const MEDIA_TYPE_MANIFEST = 'application/vnd.oci.image.manifest.v1+json'
const MEDIA_TYPE_DISTRIBUTION_MANIFEST_V2 = 'application/vnd.docker.distribution.manifest.v2+json'

const MANIFEST_MAX_DEPTH = 5

export default class V2ApiClient {
  private readonly logger = new Logger(V2ApiClient.name)

  private token?: string

  private manifestMimeType: string

  private requestInit: RequestInit

  private readonly baseUrl: string

  private readonly imageNamePrefix?: string

  private readonly tokenInit?: RequestInit

  constructor(options: V2ApiClientOptions, private cache: Cache) {
    this.baseUrl = options.baseUrl;
    this.imageNamePrefix = options.imageNamePrefix;
    this.tokenInit = options.tokenInit;

    this.requestInit = options.requestInit ?? {}
    this.requestInit = {
      ...this.requestInit,
      headers: {
        ...(this.requestInit.headers ?? {}),
        'User-Agent': USER_AGENT_CRUX,
      },
    }

    this.token = null

    this.manifestMimeType = options.manifestMime ?? MEDIA_TYPE_DISTRIBUTION_MANIFEST_V2
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

    const tokenInit = this.tokenInit ?? this.requestInit

    const tokenUrl = `${tokenServer}?service=${encodeURIComponent(tokenService)}&scope=${encodeURIComponent(
      tokenScope,
    )}`

    this.logger.debug(`Fetching token from '${tokenUrl}'`)

    const tokenResponse = await fetch(tokenUrl, tokenInit)

    this.logger.debug(`Got token response for '${tokenUrl}' - ${tokenResponse.status}`)

    if (tokenResponse.status !== 200) {
      this.logger.error('V2 token fetch failed', tokenResponse.status, await tokenResponse.text())

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

      this.logger.error('V2 API fetch failed', result.res.status, result.data)
      throw new CruxInternalServerErrorException({
        message: 'Failed to fetch v2 API!',
      })
    }

    return result.data
  }

  private async fetchV2Cached<T extends BaseResponse>(cacheKey: string, endpoint: string, init?: RequestInit): Promise<T> {
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached as T;
    }

    const fetched = await this.fetchV2<T>(endpoint, init);
    await this.cache.set(cacheKey, fetched, 0);

    return fetched as T;
  }

  private async fetchLabelsByManifest(
    image: string,
    manifest: ManifestBaseResponse,
    depth: number,
  ): Promise<Record<string, string>> {
    if (manifest.mediaType === MEDIA_TYPE_MANIFEST || manifest.mediaType === MEDIA_TYPE_DISTRIBUTION_MANIFEST_V2) {
      const labelManifest = manifest as ManifestResponse

      const configManifest = await this.fetchV2Cached<BlobResponse>(labelManifest.config.digest, `${image}/blobs/${labelManifest.config.digest}`)

      return configManifest.config.Labels
    }

    if (manifest.mediaType === MEDIA_TYPE_INDEX) {
      if (depth > MANIFEST_MAX_DEPTH) {
        return {}
      }

      const indexManifest = manifest as ManifestIndexResponse

      const subManifestPromises = indexManifest.manifests.map(async it => {
        const subManifest = await this.fetchV2Cached<ManifestBaseResponse>(it.digest, `${image}/manifests/${it.digest}`, {
          headers: {
            Accept: it.mediaType,
          },
        })

        return this.fetchLabelsByManifest(image, subManifest, depth + 1)
      })

      const subManifestLabels = await Promise.all(subManifestPromises)

      return subManifestLabels.reduce(
        (map, it) => ({
          ...map,
          ...it,
        }),
        {},
      )
    }

    throw new Error(`Unknown manifest type: ${manifest.mediaType}`)
  }

  async fetchLabels(image: string, tag: string): Promise<Record<string, string>> {
    if (this.imageNamePrefix) {
      image = `${this.imageNamePrefix}/${image}`
    }

    const manifest = await this.fetchV2Cached<ManifestBaseResponse>(`manifest/${image}:${tag}`, `${image}/manifests/${tag ?? 'latest'}`, {
      headers: {
        Accept: this.manifestMimeType,
      },
    })

    if (!manifest) {
      return {}
    }

    return this.fetchLabelsByManifest(image, manifest, 0)
  }

  private async fetchConfigManifest(
    image: string,
    manifest: {
      mediaType?: string
    },
  ): Promise<BlobResponse> {
    if (manifest.mediaType === MEDIA_TYPE_MANIFEST || manifest.mediaType === MEDIA_TYPE_DISTRIBUTION_MANIFEST_V2) {
      const labelManifest = manifest as ManifestResponse

      const configManifest = await this.fetchV2Cached<BlobResponse>(labelManifest.config.digest, `${image}/blobs/${labelManifest.config.digest}`)

      return configManifest
    }

    if (manifest.mediaType === MEDIA_TYPE_INDEX) {
      const indexManifest = manifest as ManifestIndexResponse

      const subManifestData = indexManifest.manifests[0];
      const subManifest = await this.fetchConfigManifest(image, subManifestData);

      return subManifest
    }

    throw new Error(`Unknown manifest type: ${manifest.mediaType}`)
  }

  async fetchTagInfo(image: string, tag: string): Promise<TagInfo> {
    if (this.imageNamePrefix) {
      image = `${this.imageNamePrefix}/${image}`
    }

    const manifest = await this.fetchV2Cached<ManifestBaseResponse>(`manifest/${image}:${tag}`, `${image}/manifests/${tag ?? 'latest'}`, {
      headers: {
        Accept: this.manifestMimeType,
      },
    })

    if (!manifest) {
      return null
    }

    const blob = await this.fetchConfigManifest(image, manifest)

    return {
      createdAt: blob.created
    }
  }
}
