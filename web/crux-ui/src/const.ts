export const SECOND_IN_MILLIS = 1000
export const HOUR_IN_SECONDS = 3600
export const NODE_SETUP_SCRIPT_TIMEOUT = 600 // 10 min in seconds
export const GRPC_STREAM_RECONNECT_TIMEOUT = 5_000 // millis
export const IMAGE_FILTER_MIN_LENGTH = 1 // characters
export const IMAGE_WS_REQUEST_DELAY = 500 // millis
export const INSTANCE_WS_REQUEST_DELAY = IMAGE_WS_REQUEST_DELAY // millis
export const DEPLOYMENT_EDIT_WS_REQUEST_DELAY = 500 // millis
export const WS_RECONNECT_TIMEOUT = 5_000 // millis

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
export const HEADER_SET_COOKIE = 'set-cookie'
export const HEADER_LOCATION = 'location'
export const AUTH_RESEND_DELAY = 30 // seconds
export const WEBOOK_TEST_DELAY = 500 // millis

export const KRATOS_ERROR_NO_VERIFIED_EMAIL_ADDRESS = 4000010

export const STORAGE_VIEW_MODE = 'view-mode'
