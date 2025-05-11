import { coerce } from 'semver'

export const REGISTRY_HUB_URL = 'hub.docker.com'
export const REGISTRY_GITHUB_URL = 'ghcr.io'
export const PRODUCTION = 'production'

export const REGISTRY_GITLAB_URLS = {
  apiUrl: 'gitlab.com',
  registryUrl: 'registry.gitlab.com',
}

export const TAG_INFO_BATCH_SIZE = 5

export const VERSIONLESS_PROJECT_VERSION_NAME = 'rolling'

export const MAX_TIMEOUT = 2 ** 31 - 1

const DAY_IN_MILLIS = 24 * 60 * 60 * 1000
export const TEAM_INVITATION_EXPIRATION = 7 * DAY_IN_MILLIS
export const JWT_EXPIRATION_MILLIS = 10 * 60 * 1000 // 10 minutes
export const AGENT_DEFAULT_CALLBACK_TIMEOUT = 5000
export const AGENT_STREAM_TIMEOUT = 60_000
export const GET_CONTAINER_LOG_DEFAULT_TAKE = 100

// NOTE(@m8vago): This should be incremented, when a new release includes a proto file change
const AGENT_PROTO_COMPATIBILITY_MINIMUM_VERSION = '0.15.3'
export const AGENT_SUPPORTED_MINIMUM_VERSION = coerce(AGENT_PROTO_COMPATIBILITY_MINIMUM_VERSION)

export const API_CREATED_LOCATION_HEADERS = {
  Location: {
    description: 'URL of the created object.',
    schema: {
      type: 'string',
    },
  },
}

export const UID_MIN = -1
export const UID_MAX = 2147483647

export const KRATOS_LIST_PAGE_SIZE = 128

export const USER_AGENT_CRUX = 'crux'
