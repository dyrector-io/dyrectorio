export const REGISTRY_HUB_URL = 'hub.docker.com'
export const REGISTRY_GITHUB_URL = 'ghcr.io'

export const REGISTRY_GITLAB_URLS = {
  apiUrl: 'gitlab.com',
  registryUrl: 'registry.gitlab.com',
}

export const SIMPLE_PRODUCT_VERSION_NAME = 'rolling'

const DAY_IN_MILLIS = 24 * 60 * 60 * 1000
export const TEAM_INVITATION_EXPIRATION = 7 * DAY_IN_MILLIS
export const JWT_EXPIRATION = 10 * 60 * 1000 // 10 minutes
export const CONTAINER_DELETE_TIMEOUT = 1000 // millis

export const DEFAULT_CONTAINER_LOG_TAIL = 40

export const API_CREATED_LOCATION_HEADERS = {
  Location: {
    description: 'URL of the created object.',
    schema: {
      type: 'URL',
    },
  },
}
