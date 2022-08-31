export const NODE_SETUP_SCRIPT_TIMEOUT = 600 // 10 min in seconds
export const GRPC_STREAM_RECONNECT_TIMEOUT = 5_000 // millis
export const IMAGE_FILTER_MIN_LENGTH = 1 // characters
export const IMAGE_WS_REQUEST_DELAY = 500 // millis
export const DEPLOYMENT_EDIT_WS_REQUEST_DELAY = 500 // millis
export const IMAGE_FILTER_TAKE = 6 // number of images
export const WS_RECONNECT_TIMEOUT = 5_000 // millis

export const REGISTRY_HUB_URL = 'hub.docker.com'
export const REGISTRY_GITHUB_URL = 'ghcr.io'

export const REGISTRY_GITLAB_URLS = {
  apiUrl: 'gitlab.com',
  registryUrl: 'registry.gitlab.com',
}

export const REGISTRY_HUB_CACHE_EXPIRATION = 60 // minutes

export const WS_DATA_CRUX = 'crux'

export const SERVICE_STATUS_CHECK_INTERVAL = 5000 // sec in millis

export const INVITE_LINK_EXPIRATION = '12h'
export const ATTRIB_CSRF = 'csrf_token'
export const HEADER_SET_COOKIE = 'set-cookie'
export const AUTH_RESEND_DELAY = 30 // seconds
export const WEBOOK_TEST_DELAY = 500 // millis

// Routes:
export const ROUTE_INDEX = '/'
export const ROUTE_STATUS = '/status'
export const ROUTE_404 = '/404'
export const ROUTE_PROFILE = '/auth/settings'
export const ROUTE_LOGIN = '/auth/login'
export const ROUTE_LOGOUT = '/auth/logout'
export const ROUTE_REGISTER = '/auth/register'

export const ROUTE_INVITE = '/auth/invite'
export const ROUTE_SETTINGS = '/auth/settings'
export const ROUTE_SETTINGS_EDIT_PROFILE = '/auth/settings/edit-profile'
export const ROUTE_SETTINGS_CHANGE_PASSWORD = '/auth/settings/change-password'
export const ROUTE_RECOVERY = '/auth/recovery'
export const ROUTE_VERIFICATION = '/auth/verify'

export const ROUTE_TEAMS = '/teams'
export const ROUTE_AUDIT = '/audit-log'
export const ROUTE_TEAMS_CREATE = '/teams/create'

export const ROUTE_PRODUCTS = '/products'
export const ROUTE_DEPLOYMENTS = '/deployments'

export const ROUTE_NODES = '/nodes'
export const ROUTE_REGISTRIES = '/registries'
export const ROUTE_NOTIFICATIONS = '/notifications'

export const API_AUTH_REGISTER = '/api/auth/register'
export const API_AUTH_LOGIN = '/api/auth/login'
export const API_AUTH_LOGOUT = '/api/auth/logout'

export const API_SETTINGS = '/api/auth/settings'
export const API_SETTINGS_EDIT_PROFILE = '/api/auth/settings/edit-profile'
export const API_SETTINGS_CHANGE_PASSWORD = '/api/auth/settings/change-password'
export const API_RECOVERY = '/api/auth/recovery'
export const API_VERIFICATION = '/api/auth/verify'

export const API_STATUS = '/api/status'

export const API_PRODUCTS = '/api/products'
export const API_REGISTRIES = '/api/registries'
export const API_NODES = '/api/nodes'

export const API_TEAMS = '/api/teams'
export const API_TEAMS_ACTIVE = '/api/teams/active'
export const API_WHOAMI = '/api/whoami'

export const API_NOTIFICATIONS = '/api/notifications'

export const WS_NODES = `${API_NODES}/connect`
export const WS_REGISTRIES = `${API_REGISTRIES}/connect`
