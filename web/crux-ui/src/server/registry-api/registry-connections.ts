import { REGISTRY_HUB_CACHE_EXPIRATION, REGISTRY_HUB_PREFIX, REGISTRY_HUB_URL } from '@app/const'
import { Identity } from '@ory/kratos-client'
import { Crux } from '@server/crux/crux'
import HubApiClient, { HubApiCache } from './hub-api-client'
import { RegistryApiClient } from './registry-api-client'
import RegistryV2ApiClient from './v2-api-client'

export class RegistryConnections {
  private hubCache = new HubApiCache(REGISTRY_HUB_CACHE_EXPIRATION * 60 * 1000) // minutes to millis

  private clients: Map<string, RegistryApiClient> = new Map()
  private authorized: Map<string, string[]> = new Map() // identityId to registyIds

  invalidate(registryId: string) {
    this.clients.delete(registryId)
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
        ? new RegistryV2ApiClient(registry.url, {
            username: registry.user,
            password: registry.token,
          })
        : new HubApiClient(this.hubCache, REGISTRY_HUB_URL, REGISTRY_HUB_PREFIX)

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
}

if (!global._registryConnections) {
  global._registryConnections = new RegistryConnections()
}

const registryConnections: RegistryConnections = global._registryConnections
export default registryConnections
