import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { REGISTRY_EVENT_UPDATE, RegistryUpdatedEvent } from 'src/domain/registry'
import { CruxForbiddenException } from 'src/exception/crux-exception'
import { REGISTRY_GITLAB_URLS, REGISTRY_HUB_URL } from 'src/shared/const'
import CachedPublicHubApiClient from './registry-clients/cached-hub-api-client'
import HubApiCache from './registry-clients/caches/hub-api-cache'
import GithubRegistryClient from './registry-clients/github-api-client'
import { GitlabRegistryClient } from './registry-clients/gitlab-api-client'
import { GoogleRegistryClient } from './registry-clients/google-api-client'
import PrivateHubApiClient from './registry-clients/private-hub-api-client'
import { RegistryApiClient } from './registry-clients/registry-api-client'
import UncheckedApiClient from './registry-clients/unchecked-api-client'
import RegistryV2ApiClient from './registry-clients/v2-api-client'
import { REGISTRY_HUB_CACHE_EXPIRATION } from './registry.const'
import { GithubNamespace, GitlabNamespace, RegistryType } from './registry.dto'
import RegistryService from './registry.service'

export type RegistryClientEntry = {
  client: RegistryApiClient
  type: RegistryType
}

@Injectable()
export default class RegistryClientProvider {
  private hubCaches: Map<string, HubApiCache> = new Map() // prefix to cache

  private registryIdToHubCache: Map<string, string> = new Map()

  private clients: Map<string, RegistryClientEntry> = new Map()

  private registriesByTeam: Map<string, string[]> = new Map() // teamId to registyIds

  constructor(
    @Inject(forwardRef(() => RegistryService))
    private readonly service: RegistryService,
  ) {}

  removeClientsByTeam(teamId: string) {
    const registries = this.registriesByTeam.get(teamId)
    if (!registries) {
      return
    }

    this.registriesByTeam.delete(teamId)

    registries.forEach(registryId => this.invalidate(registryId, REGISTRY_HUB_CACHE_EXPIRATION * 60 * 1000))
  }

  async getByRegistryId(teamId: string, registryId: string): Promise<RegistryClientEntry> {
    let client = this.clients.get(registryId)
    if (client) {
      await this.authorize(teamId, registryId)
      return client
    }

    const connInfo = await this.service.getRegistryConnectionInfoById(registryId)

    const createV2 = () =>
      new RegistryV2ApiClient(
        connInfo.url,
        !connInfo.public
          ? {
              username: connInfo.user,
              password: connInfo.token,
              imageNamePrefix: connInfo.imageNamePrefix,
            }
          : null,
      )

    const createHub = async () => {
      if (connInfo.public) {
        return new CachedPublicHubApiClient(
          this.getHubCacheForImageNamePrefix(registryId, connInfo.imageNamePrefix),
          REGISTRY_HUB_URL,
          connInfo.imageNamePrefix,
        )
      }

      const hubClient = new PrivateHubApiClient(REGISTRY_HUB_URL, connInfo.imageNamePrefix)
      await hubClient.login(connInfo.user, connInfo.token)

      return hubClient
    }

    const createGithub = () =>
      new GithubRegistryClient(
        connInfo.imageNamePrefix,
        {
          username: connInfo.user,
          password: connInfo.token,
        },
        connInfo.namespace as GithubNamespace,
      )

    const createGitlab = () =>
      new GitlabRegistryClient(
        connInfo.imageNamePrefix,
        {
          username: connInfo.user,
          password: connInfo.token,
        },
        connInfo.apiUrl
          ? {
              apiUrl: connInfo.apiUrl,
              registryUrl: connInfo.url,
            }
          : REGISTRY_GITLAB_URLS,
        connInfo.namespace as GitlabNamespace,
      )

    const createGoogle = () =>
      new GoogleRegistryClient(
        connInfo.url,
        connInfo.imageNamePrefix,
        !connInfo.public
          ? {
              username: connInfo.user,
              password: connInfo.token,
            }
          : null,
      )

    const createUnchecked = () => new UncheckedApiClient()

    client = {
      type: connInfo.type,
      client:
        connInfo.type === 'v2'
          ? createV2()
          : connInfo.type === 'hub'
          ? await createHub()
          : connInfo.type === 'github'
          ? createGithub()
          : connInfo.type === 'gitlab'
          ? createGitlab()
          : connInfo.type === 'google'
          ? createGoogle()
          : createUnchecked(),
    }

    this.clients.set(connInfo.id, client)

    const teamRegistries = this.registriesByTeam.get(teamId) ?? []

    teamRegistries.push(registryId)

    return client
  }

  @OnEvent(REGISTRY_EVENT_UPDATE)
  onRegistryUpdated(event: RegistryUpdatedEvent) {
    this.invalidate(event.id)
  }

  private invalidate(registryId: string, delay: number | null = null) {
    this.clients.delete(registryId)

    const organization = this.registryIdToHubCache.get(registryId)
    if (!organization) {
      return
    }

    this.registryIdToHubCache.delete(registryId)

    if (delay) {
      setTimeout(() => this.checkAndRemoveHubCache(organization), delay)
      return
    }

    this.checkAndRemoveHubCache(organization)
  }

  private checkAndRemoveHubCache(org: string) {
    const cache = this.hubCaches.get(org)
    if (!cache) {
      return
    }

    cache.clients -= 1
    if (cache.clients > 0) {
      return
    }

    this.hubCaches.delete(org)
  }

  private async authorize(teamId: string, registryId: string): Promise<void> {
    const authorizedRegistries = this.registriesByTeam.get(teamId)
    if (authorizedRegistries && authorizedRegistries.includes(registryId)) {
      return
    }

    const access = await this.service.checkRegistryIsInTeam(teamId, registryId)
    if (!access) {
      throw new CruxForbiddenException()
    }
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
