export const SECOND_IN_MILLIS = 1000
export const HOUR_IN_SECONDS = 3600
export const NODE_SETUP_SCRIPT_TIMEOUT = 600 // 10 min in seconds
export const GRPC_STREAM_RECONNECT_TIMEOUT = 5_000 // millis
export const IMAGE_FILTER_MIN_LENGTH = 1 // characters
export const INSTANCE_WS_REQUEST_DELAY = 500 // millis
export const DEPLOYMENT_EDIT_WS_REQUEST_DELAY = 500 // millis
export const CONFIG_BUNDLE_EDIT_WS_REQUEST_DELAY = 500 // millis
export const WS_CONNECT_DELAY_PER_TRY = 5_000 // millis
export const WS_MAX_CONNECT_TRY = 20
export const WS_PATCH_DELAY = 500 // millis

export const REGISTRY_HUB_URL = 'hub.docker.com'
export const REGISTRY_GITHUB_URL = 'ghcr.io'

export const REGISTRY_GITLAB_URLS = {
  apiUrl: 'gitlab.com',
  registryUrl: 'registry.gitlab.com',
}

export const WS_DATA_CRUX = 'crux'

export const SERVICE_STATUS_CHECK_INTERVAL = 5000 // sec in millis

export const INVITE_LINK_EXPIRATION = '12h'
export const ATTRIB_CSRF = 'csrf_token'
export const ATTRIB_OIDC_PROVIDER = 'provider'
export const HEADER_SET_COOKIE = 'set-cookie'
export const HEADER_LOCATION = 'location'
export const AUTH_RESEND_DELAY = 30 // seconds
export const WEBOOK_TEST_DELAY = 500 // millis

export const KRATOS_ERROR_NO_VERIFIED_EMAIL_ADDRESS = 4000010

export const STORAGE_VIEW_MODE = 'view-mode'

export const UID_MIN = -1
export const UID_MAX = 2147483647

export const STORAGE_TEAM_SLUG = 'teamSlug'

export const COOKIE_TEAM_SLUG = 'crux_team_slug'

export const TOAST_DURATION = 5000 // sec in millis

export const DYO_ENV_LABEL_PREFIX = 'org.dyrectorio.env'
