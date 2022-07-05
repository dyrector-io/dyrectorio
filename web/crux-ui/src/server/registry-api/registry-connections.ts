import { REGISTRY_GITLAB_URLS, REGISTRY_HUB_CACHE_EXPIRATION, REGISTRY_HUB_URL } from '@app/const'
import { Identity } from '@ory/kratos-client'
import { Crux } from '@server/crux/crux'
import { GithubRegistryClient } from './github-api-client'
import { GitlabRegistryClient } from './gitlab-api-client'
import HubApiClient, { HubApiCache } from './hub-api-client'
import { RegistryApiClient } from './registry-api-client'
import RegistryV2ApiClient from './v2-api-client'

export class RegistryConnections {
  private hubCaches: Map<string, HubApiCache> = new Map() // urlPrefix to cache
  private registryIdToHubCache: Map<string, string> = new Map()

  private clients: Map<string, RegistryApiClient> = new Map()
  private authorized: Map<string, string[]> = new Map() // identityId to registyIds

  invalidate(registryId: string) {
    this.clients.delete(registryId)

    const hubUrlPrefix = this.registryIdToHubCache.get(registryId)
    if (!hubUrlPrefix) {
      return
    }

    this.registryIdToHubCache.delete(registryId)

    const cache = this.hubCaches.get(hubUrlPrefix)
    if (!cache) {
      return
    }

    cache.clients--
    if (cache.clients > 0) {
      return
    }

    this.hubCaches.delete(hubUrlPrefix)
  }

  resetAuthorization(identity: Identity) {
    this.authorized.delete(identity.id)
  }

  async getByRegistryId(registryId: string, crux: Crux): Promise<RegistryApiClient> {
    let client = this.clients.get(registryId)
    if (client) {
      await this.authorize(registryId, crux)
      return client
    }

    const registry = await crux.registries.getRegistryDetails(registryId)

    client =
      registry.type === 'v2'
        ? new RegistryV2ApiClient(
            registry.url,
            registry._private
              ? {
                  username: registry.user,
                  password: registry.token,
                }
              : null,
          )
        : registry.type === 'hub'
        ? new HubApiClient(
            this.getHubCacheForUrlPrefix(registry.id, registry.urlPrefix),
            REGISTRY_HUB_URL,
            registry.urlPrefix,
          )
        : registry.type === 'github'
        ? new GithubRegistryClient(registry.urlPrefix, {
            username: registry.user,
            password: registry.token,
          })
        : new GitlabRegistryClient(
            registry.urlPrefix,
            {
              username: registry.user,
              password: registry.token,
            },
            registry.selfManaged
              ? {
                  apiUrl: registry.apiUrl,
                  registryUrl: registry.url,
                }
              : REGISTRY_GITLAB_URLS,
          )

    this.clients.set(registry.id, client)

    return client
  }

  private async authorize(registryId: string, crux: Crux) {
    const authorizedRegistries = this.authorized.get(crux.identity.id)
    if (authorizedRegistries && authorizedRegistries.includes(registryId)) {
      return
    }

    await crux.registries.getRegistryDetails(registryId)
  }

  private getHubCacheForUrlPrefix(registryId: string, prefix: string) {
    let cache = this.hubCaches.get(prefix)
    if (!cache) {
      cache = new HubApiCache(REGISTRY_HUB_CACHE_EXPIRATION * 60 * 1000) // minutes to millis
      this.hubCaches.set(prefix, cache)
    } else {
      cache.clients++
    }

    this.registryIdToHubCache.set(registryId, prefix)

    return cache
  }
}

if (!global._registryConnections) {
  global._registryConnections = new RegistryConnections()
}

const registryConnections: RegistryConnections = global._registryConnections
export default registryConnections
