import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { CruxBadRequestException } from 'src/exception/crux-exception'
import { REGISTRY_GITLAB_URLS, REGISTRY_HUB_URL } from 'src/shared/const'
import { REGISTRY_HUB_CACHE_EXPIRATION } from '../registry.const'
import {
  GithubRegistryDetailsDto,
  GitlabRegistryDetailsDto,
  GoogleRegistryDetailsDto,
  HubRegistryDetailsDto,
  V2RegistryDetailsDto,
} from '../registry.dto'
import RegistryService from '../registry.service'
import HubApiCache from './caches/hub-api-cache'
import GithubRegistryClient from './github-api-client'
import { GitlabRegistryClient } from './gitlab-api-client'
import { GoogleRegistryClient } from './google-api-client'
import HubApiClient from './hub-api-client'
import { RegistryApiClient } from './registry-api-client'
import RegistryV2ApiClient from './v2-api-client'

@Injectable()
export default class RegistryConnections {
  private hubCaches: Map<string, HubApiCache> = new Map() // imageNamePrefix to cache

  private registryIdToHubCache: Map<string, string> = new Map()

  private clients: Map<string, RegistryApiClient> = new Map()

  private authorized: Map<string, string[]> = new Map() // identityId to registyIds

  constructor(private readonly service: RegistryService) {}

  invalidate(registryId: string) {
    this.clients.delete(registryId)

    const hubImageNamePrefix = this.registryIdToHubCache.get(registryId)
    if (!hubImageNamePrefix) {
      return
    }

    this.registryIdToHubCache.delete(registryId)

    const cache = this.hubCaches.get(hubImageNamePrefix)
    if (!cache) {
      return
    }

    cache.clients -= 1
    if (cache.clients > 0) {
      return
    }

    this.hubCaches.delete(hubImageNamePrefix)
  }

  resetAuthorization(identity: Identity) {
    this.authorized.delete(identity.id)
  }

  async getByRegistryId(registryId: string, identity: Identity): Promise<RegistryApiClient> {
    let client = this.clients.get(registryId)
    if (client) {
      await this.authorize(registryId, identity)
      return client
    }

    const registry = await this.service.getRegistryDetails(registryId)

    if (registry.type === 'unchecked') {
      throw new CruxBadRequestException({ message: 'Unchecked registries have no API' })
    }

    const createV2 = (details: V2RegistryDetailsDto) =>
      new RegistryV2ApiClient(
        details.url,
        details.user
          ? {
              username: details.user,
              password: details.token,
            }
          : null,
      )

    const createHub = (details: HubRegistryDetailsDto) =>
      new HubApiClient(
        this.getHubCacheForImageNamePrefix(registry.id, details.imageNamePrefix),
        REGISTRY_HUB_URL,
        details.imageNamePrefix,
      )

    const createGithub = (details: GithubRegistryDetailsDto) =>
      new GithubRegistryClient(
        details.imageNamePrefix,
        {
          username: details.user,
          password: details.token,
        },
        details.namespace,
      )

    const createGitlab = (details: GitlabRegistryDetailsDto) =>
      new GitlabRegistryClient(
        details.imageNamePrefix,
        {
          username: details.user,
          password: details.token,
        },
        !!details.apiUrl
          ? {
              apiUrl: details.apiUrl,
              registryUrl: details.url,
            }
          : REGISTRY_GITLAB_URLS,
        details.namespace,
      )

    const createGoogle = (details: GoogleRegistryDetailsDto) =>
      new GoogleRegistryClient(
        details.url,
        details.imageNamePrefix,
        !!details.user
          ? {
              username: details.user,
              password: details.token,
            }
          : null,
      )

    client =
      registry.type === 'v2'
        ? createV2(registry.details as V2RegistryDetailsDto)
        : registry.type === 'hub'
        ? createHub(registry.details as HubRegistryDetailsDto)
        : registry.type === 'github'
        ? createGithub(registry.details as GithubRegistryDetailsDto)
        : registry.type === 'gitlab'
        ? createGitlab(registry.details as GitlabRegistryDetailsDto)
        : createGoogle(registry.details as GoogleRegistryDetailsDto)

    this.clients.set(registry.id, client)

    return client
  }

  private async authorize(registryId: string, identity: Identity): Promise<void> {
    const authorizedRegistries = this.authorized.get(identity.id)
    if (authorizedRegistries && authorizedRegistries.includes(registryId)) {
      return
    }

    // TODO(@robot9706): Auth
    // await crux.getRegistryDetails(registryId)
  }

  private getHubCacheForImageNamePrefix(registryId: string, prefix: string): HubApiCache {
    let cache = this.hubCaches.get(prefix)
    if (!cache) {
      cache = new HubApiCache(REGISTRY_HUB_CACHE_EXPIRATION * 60 * 1000) // minutes to millis
      this.hubCaches.set(prefix, cache)
    } else {
      cache.clients += 1
    }

    this.registryIdToHubCache.set(registryId, prefix)

    return cache
  }
}
