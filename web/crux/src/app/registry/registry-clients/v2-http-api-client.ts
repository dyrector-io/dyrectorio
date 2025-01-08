import { Logger } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { CruxInternalServerErrorException } from 'src/exception/crux-exception'
import { USER_AGENT_CRUX } from 'src/shared/const'
import { RegistryImageTagInfo } from './registry-api-client'

type V2Error = {
  code: string
  message: string
  detail: string[]
}

type BaseResponse = {
  errors?: V2Error[]
}

type ManifestHistory = {
  v1Compatibility: string // string of ConfigBlobResponse
}

type ManifestBaseResponse = BaseResponse & {
  schemaVersion: number
  mediaType: string // v2
  history: ManifestHistory[] // v1
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

type ConfigBlobResponse = BaseResponse & {
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

export type V2Options = {
  baseUrl: string
  imageNamePrefix?: string
  requestInit?: RequestInit
  manifestMime?: string
  tokenInit?: RequestInit
  tryV1Manifest?: boolean
}

const ERROR_UNAUTHORIZED = 'UNAUTHORIZED'
const ERROR_DENIED = 'DENINED'
const ERROR_MANIFEST_UNKNOWN = 'MANIFEST_UNKNOWN'

const HEADER_WWW_AUTHENTICATE = 'www-authenticate'

const MEDIA_TYPE_INDEX = 'application/vnd.oci.image.index.v1+json'
const MEDIA_TYPE_MANIFEST = 'application/vnd.oci.image.manifest.v1+json'
const MEDIA_TYPE_DISTRIBUTION_MANIFEST_V1 = 'application/vnd.docker.distribution.manifest.v1+json'
const MEDIA_TYPE_DISTRIBUTION_MANIFEST_V2 = 'application/vnd.docker.distribution.manifest.v2+json'

const MANIFEST_MAX_DEPTH = 5

export default class V2HttpApiClient {
  private readonly logger = new Logger(V2HttpApiClient.name)

  private readonly baseUrl: string

  private readonly imageNamePrefix?: string

  private readonly tokenInit?: RequestInit

  private token?: string

  private manifestMimeType?: string

  private requestInit: RequestInit

  private tryV1Manifest: boolean

  constructor(
    options: V2Options,
    private readonly cache: Cache | null,
  ) {
    this.baseUrl = options.baseUrl
    this.imageNamePrefix = options.imageNamePrefix
    this.tokenInit = options.tokenInit
    this.manifestMimeType = options.manifestMime
    this.tryV1Manifest = options.tryV1Manifest ?? false

    this.requestInit = options.requestInit ?? {}
    this.requestInit = {
      ...this.requestInit,
      headers: {
        ...(this.requestInit.headers ?? {}),
        'User-Agent': USER_AGENT_CRUX,
      },
    }

    this.token = null
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

  private async fetchV2Cache<T extends BaseResponse>(
    cacheKey: string,
    endpoint: string,
    init?: RequestInit,
  ): Promise<T> {
    if (!this.cache) {
      return this.fetchV2<T>(endpoint, init)
    }

    const cached = await this.cache.get<T>(cacheKey)
    if (cached) {
      this.logger.debug(`Cached ${cacheKey}`)
      return cached
    }

    const result = await this.fetchV2<T>(endpoint, init)
    this.cache.set(cacheKey, result, 0)
    this.logger.debug(`Stored to cache ${cacheKey}`)

    return result
  }

  private async fetchLabelsByManifest(
    image: string,
    manifest: ManifestBaseResponse,
    depth: number,
  ): Promise<Record<string, string>> {
    if (!manifest.mediaType && manifest.schemaVersion == 1) {
      // NOTE(@robot9706): V1 manifests have 'v1Compatibility' history fields which have everything we need
      const lastHistory = manifest.history[0]
      const configBlob = JSON.parse(lastHistory.v1Compatibility) as ConfigBlobResponse

      return configBlob.config.Labels
    }

    if (manifest.mediaType === MEDIA_TYPE_MANIFEST || manifest.mediaType === MEDIA_TYPE_DISTRIBUTION_MANIFEST_V2) {
      const labelManifest = manifest as ManifestResponse

      const configManifest = await this.fetchV2Cache<ConfigBlobResponse>(
        `manifest-${labelManifest.config.digest}`,
        `${image}/blobs/${labelManifest.config.digest}`,
      )

      return configManifest.config.Labels
    }

    if (manifest.mediaType === MEDIA_TYPE_INDEX) {
      if (depth > MANIFEST_MAX_DEPTH) {
        return {}
      }

      const indexManifest = manifest as ManifestIndexResponse

      const subManifestPromises = indexManifest.manifests.map(async it => {
        const subManifest = await this.fetchV2Cache<ManifestBaseResponse>(
          `manifest-${it.digest}`,
          `${image}/manifests/${it.digest}`,
          {
            headers: {
              Accept: it.mediaType,
            },
          },
        )

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

  private async fetchConfigBlobByManifest(
    image: string,
    manifest: ManifestBaseResponse,
    depth: number,
  ): Promise<ConfigBlobResponse | null> {
    if (!manifest.mediaType && manifest.schemaVersion == 1) {
      // NOTE(@robot9706): V1 manifests have 'v1Compatibility' history fields which have everything we need
      const lastHistory = manifest.history[0]
      const configBlob = JSON.parse(lastHistory.v1Compatibility) as ConfigBlobResponse

      return configBlob
    }

    if (manifest.mediaType === MEDIA_TYPE_MANIFEST || manifest.mediaType === MEDIA_TYPE_DISTRIBUTION_MANIFEST_V2) {
      const labelManifest = manifest as ManifestResponse

      return this.fetchV2Cache<ConfigBlobResponse>(
        `manifest-${labelManifest.config.digest}`,
        `${image}/blobs/${labelManifest.config.digest}`,
      )
    }

    if (manifest.mediaType === MEDIA_TYPE_INDEX) {
      if (depth > MANIFEST_MAX_DEPTH) {
        return null
      }

      const indexManifest = manifest as ManifestIndexResponse
      if (indexManifest.manifests.length <= 0) {
        return null
      }

      // TODO(@robot9706): Decide which manifest to use
      const subManifestMeta = indexManifest.manifests[0]

      const subManifest = await this.fetchV2Cache<ManifestBaseResponse>(
        `manifest-${subManifestMeta.digest}`,
        `${image}/manifests/${subManifestMeta.digest}`,
        {
          headers: {
            Accept: subManifestMeta.mediaType,
          },
        },
      )

      return this.fetchConfigBlobByManifest(image, subManifest, depth + 1)
    }

    throw new Error(`Unknown manifest type: ${manifest.mediaType}`)
  }

  private async fetchTagManifest(image: string, tag: string): Promise<ManifestBaseResponse> {
    if (this.imageNamePrefix) {
      image = `${this.imageNamePrefix}/${image}`
    }

    if (!this.manifestMimeType && this.tryV1Manifest) {
      // NOTE(@robot9706): If the manifest mime type is not defined, try v1 first if we are allowed to do so
      const manifest = await this.fetchV2Cache<ManifestBaseResponse>(
        `image-${image}/${tag ?? 'latest'}`,
        `${image}/manifests/${tag ?? 'latest'}`,
        {
          headers: {
            Accept: MEDIA_TYPE_DISTRIBUTION_MANIFEST_V1,
          },
        },
      )

      if (!manifest) {
        return null
      }

      if (manifest.schemaVersion == 1) {
        return manifest
      }
    }

    return this.fetchV2Cache<ManifestBaseResponse>(
      `image-${image}/${tag ?? 'latest'}`,
      `${image}/manifests/${tag ?? 'latest'}`,
      {
        headers: {
          Accept: this.manifestMimeType ?? MEDIA_TYPE_DISTRIBUTION_MANIFEST_V2,
        },
      },
    )
  }

  async fetchLabels(image: string, tag: string): Promise<Record<string, string>> {
    const tagManifest = await this.fetchTagManifest(image, tag)
    if (!tagManifest) {
      return {}
    }

    return this.fetchLabelsByManifest(image, tagManifest, 0)
  }

  async fetchTagInfo(image: string, tag: string): Promise<RegistryImageTagInfo> {
    const tagManifest = await this.fetchTagManifest(image, tag)
    if (!tagManifest) {
      return null
    }

    const configBlob = await this.fetchConfigBlobByManifest(image, tagManifest, 0)

    return {
      created: configBlob.created,
    }
  }
}
