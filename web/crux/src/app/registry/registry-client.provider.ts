import { Injectable } from '@nestjs/common'
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
import {
  GithubRegistryDetailsDto,
  GitlabRegistryDetailsDto,
  GoogleRegistryDetailsDto,
  HubRegistryDetailsDto,
  RegistryType,
  V2RegistryDetailsDto,
} from './registry.dto'
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

  constructor(private readonly service: RegistryService) {
    service.watchRegistryEvents().subscribe(it => this.invalidate(it))
  }

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

    const registry = await this.service.getRegistryDetails(registryId)

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

    const createHub = async (details: HubRegistryDetailsDto) => {
      if (!details.token) {
        return new CachedPublicHubApiClient(
          this.getHubCacheForImageNamePrefix(registry.id, details.imageNamePrefix),
          REGISTRY_HUB_URL,
          details.imageNamePrefix,
        )
      }

      const hubClient = new PrivateHubApiClient(REGISTRY_HUB_URL, details.imageNamePrefix)
      await hubClient.login(details.user, details.token)

      return hubClient
    }

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
        details.apiUrl
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
        details.user
          ? {
              username: details.user,
              password: details.token,
            }
          : null,
      )

    const createUnchecked = () => new UncheckedApiClient()

    client = {
      type: registry.type,
      client:
        registry.type === 'v2'
          ? createV2(registry.details as V2RegistryDetailsDto)
          : registry.type === 'hub'
          ? await createHub(registry.details as HubRegistryDetailsDto)
          : registry.type === 'github'
          ? createGithub(registry.details as GithubRegistryDetailsDto)
          : registry.type === 'gitlab'
          ? createGitlab(registry.details as GitlabRegistryDetailsDto)
          : registry.type === 'google'
          ? createGoogle(registry.details as GoogleRegistryDetailsDto)
          : createUnchecked(),
    }

    this.clients.set(registry.id, client)

    const teamRegistries = this.registriesByTeam.get(teamId) ?? []

    teamRegistries.push(registryId)

    return client
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
