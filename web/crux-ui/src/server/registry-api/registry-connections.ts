import { REGISTRY_GITLAB_URLS, REGISTRY_HUB_CACHE_EXPIRATION, REGISTRY_HUB_URL } from '@app/const'
import { invalidArgument } from '@app/error-responses'
import { RegistryDetails } from '@app/models'
import { Identity } from '@ory/kratos-client'
import HubApiCache from './caches/hub-api-cache'
import GithubRegistryClient from './github-api-client'
import { GitlabRegistryClient } from './gitlab-api-client'
import { GoogleRegistryClient } from './google-api-client'
import HubApiClient from './hub-api-client'
import { RegistryApiClient } from './registry-api-client'
import RegistryV2ApiClient from './v2-api-client'

export type CruxRegistryConnectionsServices = {
  getIdentity: () => Identity
  getRegistryDetails: (id: string) => Promise<RegistryDetails>
}

export class RegistryConnections {
  private hubCaches: Map<string, HubApiCache> = new Map() // imageNamePrefix to cache

  private registryIdToHubCache: Map<string, string> = new Map()

  private clients: Map<string, RegistryApiClient> = new Map()

  private authorized: Map<string, string[]> = new Map() // identityId to registyIds

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

  async getByRegistryId(registryId: string, crux: CruxRegistryConnectionsServices): Promise<RegistryApiClient> {
    let client = this.clients.get(registryId)
    if (client) {
      await this.authorize(registryId, crux)
      return client
    }

    const registry = await crux.getRegistryDetails(registryId)

    if (registry.type === 'unchecked') {
      throw invalidArgument('type', 'Unchecked registries have no API', registry.type)
    }

    client =
      registry.type === 'v2'
        ? new RegistryV2ApiClient(
            registry.url,
            registry.private
              ? {
                  username: registry.user,
                  password: registry.token,
                }
              : null,
          )
        : registry.type === 'hub'
        ? new HubApiClient(
            this.getHubCacheForImageNamePrefix(registry.id, registry.imageNamePrefix),
            REGISTRY_HUB_URL,
            registry.imageNamePrefix,
          )
        : registry.type === 'github'
        ? new GithubRegistryClient(
            registry.imageNamePrefix,
            {
              username: registry.user,
              password: registry.token,
            },
            registry.namespace,
          )
        : registry.type === 'gitlab'
        ? new GitlabRegistryClient(
            registry.imageNamePrefix,
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
            registry.namespace,
          )
        : new GoogleRegistryClient(
            registry.url,
            registry.imageNamePrefix,
            registry.private
              ? {
                  username: registry.user,
                  password: registry.token,
                }
              : null,
          )

    this.clients.set(registry.id, client)

    return client
  }

  private async authorize(registryId: string, crux: CruxRegistryConnectionsServices): Promise<void> {
    const authorizedRegistries = this.authorized.get(crux.getIdentity().id)
    if (authorizedRegistries && authorizedRegistries.includes(registryId)) {
      return
    }

    await crux.getRegistryDetails(registryId)
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

const registryConnections: RegistryConnections =
  global.registryConnections ?? (global.registryConnections = new RegistryConnections())

export default registryConnections
