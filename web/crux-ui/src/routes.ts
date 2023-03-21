import { AuditLogQuery, VersionSectionsState } from './models'

// Routes:
export const ROUTE_INDEX = '/'
export const ROUTE_STATUS = '/status'
export const ROUTE_404 = '/404'
export const ROUTE_PROFILE = '/auth/settings'
export const ROUTE_NEW_PASSWORD = '/auth/settings/new-password'
export const ROUTE_LOGIN = '/auth/login'
export const ROUTE_LOGOUT = '/auth/logout'
export const ROUTE_REGISTER = '/auth/register'

export const ROUTE_SETTINGS = '/auth/settings'
export const ROUTE_SETTINGS_TOKENS = '/auth/settings/tokens'
export const ROUTE_SETTINGS_EDIT_PROFILE = '/auth/settings/edit-profile'
export const ROUTE_SETTINGS_CHANGE_PASSWORD = '/auth/settings/change-password'
export const ROUTE_RECOVERY = '/auth/recovery'
export const ROUTE_RECOVERY_EXPIRED = `${ROUTE_RECOVERY}/expired`
export const ROUTE_VERIFICATION = '/auth/verify'

export const ROUTE_TEAMS = '/teams'
export const ROUTE_AUDIT = '/audit-log'
export const ROUTE_TEAMS_CREATE = '/teams/create'

export const ROUTE_PRODUCTS = '/products'
export const ROUTE_DEPLOYMENTS = '/deployments'

export const ROUTE_NODES = '/nodes'
export const ROUTE_REGISTRIES = '/registries'
export const ROUTE_NOTIFICATIONS = '/notifications'
export const ROUTE_TEMPLATES = '/templates'
export const ROUTE_STORAGES = '/storages'

export const ROUTE_DASHBOARD = '/dashboard'

export const API_AUTH_REGISTER = '/api/auth/register'
export const API_AUTH_LOGIN = '/api/auth/login'
export const API_AUTH_LOGOUT = '/api/auth/logout'

export const API_SETTINGS = '/api/auth/settings'
export const API_SETTINGS_EDIT_PROFILE = '/api/auth/settings/edit-profile'
export const API_SETTINGS_CHANGE_PASSWORD = '/api/auth/settings/change-password'
export const API_RECOVERY = '/api/auth/recovery'
export const API_VERIFICATION = '/api/auth/verify'
export const API_CREATE_ACCOUNT = '/api/auth/create-account'

export const API_STATUS = '/api/status'

export const API_REGISTRIES = '/api/new/registries'
export const API_PRODUCTS = '/api/new/products'
export const API_NODES = '/api/nodes'

export const API_TEAMS = '/api/teams'
export const API_TEAMS_ACTIVE = '/api/teams/active'
export const API_WHOAMI = '/api/whoami'

export const API_NOTIFICATIONS = '/api/notifications'

export const API_AUDIT = `/api/new/audit-log`

export const API_TEMPLATES = `/api/templates`

export const API_DASHBOARD = '/api/new/dashboard'

export const API_TOKENS = '/api/new/tokens'

export const API_STORAGES = '/api/storages'
export const API_STORAGES_OPTIONS = `${API_STORAGES}/options`

export const WS_NODES = `${API_NODES}/connect`
export const WS_REGISTRIES = `/api/registries/connect`

export type CruxUrlParams = {
  anchor?: string
}

export const appendUrlParams = <T extends CruxUrlParams>(url: string, params: T): string => {
  let result = url
  const paramMap: Map<string, any> = new Map()
  const anchor = params?.anchor

  if (params) {
    delete params.anchor

    Object.entries(params)
      .filter(([_, value]) => value)
      .map(entry => {
        const [key, value] = entry
        if (key) {
          paramMap.set(key, value)
        }

        return entry
      })
  }

  if (paramMap.size > 0) {
    const entries = Array.from(paramMap.entries())
    const [firstKey, firstValue] = entries[0]
    result = `${result}?${firstKey}=${firstValue}`

    if (entries.length > 1) {
      const rest = entries.slice(1)

      result = rest.reduce((prev, current) => {
        const [key, value] = current
        return `${prev}&${key}=${value}`
      }, result)
    }
  }

  return anchor ? `${result}#${anchor}` : result
}

const urlQuery = (url: string, query: object) => {
  const params = Object.entries(query)
    .map(it => {
      const [key, value] = it

      if (value === undefined || value === null) {
        return null
      }

      return `${key}=${value}`
    })
    .filter(it => it !== null)

  if (params.length < 1) {
    return url
  }

  url = `${url}?${params[0]}`

  if (params.length > 1) {
    url = params.slice(1).reduce((prev, it) => `${prev}&${it}`, url)
  }

  return url
}

// audit
export const auditApiUrl = (query: AuditLogQuery) => urlQuery(API_AUDIT, query)

// auth
export const verificationUrl = (email: string) => `${ROUTE_VERIFICATION}?email=${email}`

// product
export const productUrl = (id: string, params?: VersionUrlParams) => appendUrlParams(`${ROUTE_PRODUCTS}/${id}`, params)
export const productApiUrl = (id: string) => `${API_PRODUCTS}/${id}`
export const productVersionsApiUrl = (productId: string) => `${productApiUrl(productId)}/${productId}/versions`

// registry
export const registryUrl = (id: string) => `${ROUTE_REGISTRIES}/${id}`
export const registryApiUrl = (id: string) => `${API_REGISTRIES}/${id}`

// node
export const nodeUrl = (id: string) => `${ROUTE_NODES}/${id}`
export const nodeApiUrl = (id: string) => `/api${nodeUrl(id)}`
export const nodeWsUrl = (id: string) => `${nodeApiUrl(id)}/connect`
export const nodeSetupApiUrl = (id: string) => `${nodeApiUrl(id)}/setup`
export const nodeScriptApiUrl = (id: string) => `${nodeApiUrl(id)}/script`
export const nodeTokenApiUrl = (id: string) => `${nodeApiUrl(id)}/token`
export const nodeInspectUrl = (id: string, prefix?: string) => `${nodeUrl(id)}?prefix=${prefix}`

// version

export type VersionUrlAnchor = 'edit'
export type VersionUrlParams = {
  anchor?: VersionUrlAnchor
  section?: VersionSectionsState
}

export const versionUrl = (productId: string, versionId: string, params?: VersionUrlParams) =>
  appendUrlParams(`${productUrl(productId)}/versions/${versionId}`, params)

export const versionApiUrl = (productId: string, versionId: string) => `/api/new${versionUrl(productId, versionId)}`
export const versionIncreaseApiUrl = (productId: string, versionId: string) =>
  `${versionApiUrl(productId, versionId)}/increase`
export const versionSetDefaultApiUrl = (productId: string, versionId: string) =>
  `${versionApiUrl(productId, versionId)}/default`
export const versionWsUrl = (productId: string, versionId: string) => `${versionApiUrl(productId, versionId)}/connect`

// deployment
export const versionDeploymentsUrl = (productId: string, versionId: string) =>
  `${versionUrl(productId, versionId)}/deployments`
export const versionDeploymentsApiUrl = (productId: string, versionId: string) =>
  `/api${versionDeploymentsUrl(productId, versionId)}`

export const deploymentUrl = (productId: string, versionId: string, deploymentId: string) =>
  `${versionUrl(productId, versionId)}/deployments/${deploymentId}`

export const deploymentApiUrl = (productId: string, versionId: string, deploymentId: string) =>
  `/api${deploymentUrl(productId, versionId, deploymentId)}`

export const deploymentWsUrl = (productId: string, versionId: string, deploymentId: string) =>
  `${deploymentApiUrl(productId, versionId, deploymentId)}/connect`

export const deploymentDeployUrl = (productId: string, versionId: string, deploymentId: string) =>
  `${deploymentUrl(productId, versionId, deploymentId)}/deploy`

export const deploymentCopyUrl = (productId: string, versionId: string, deploymentId: string, force?: boolean) =>
  `${deploymentApiUrl(productId, versionId, deploymentId)}/copy${force ? '?overwrite=true' : ''}`

export const deploymentStartApiUrl = (productId: string, versionId: string, deploymentId: string) =>
  `${deploymentApiUrl(productId, versionId, deploymentId)}/start`

// team
export const teamUrl = (id: string) => `${ROUTE_TEAMS}/${id}`
export const teamApiUrl = (id: string) => `/api${teamUrl(id)}`
export const teamInvitationUrl = (teamId: string) => `${ROUTE_TEAMS}/${teamId}/invitation`
export const teamUsersApiUrl = (teamId: string) => `${teamApiUrl(teamId)}/users`
export const userApiUrl = (teamId: string, userId: string) => `${teamUsersApiUrl(teamId)}/${userId}`
export const userRoleApiUrl = (teamId: string, userId: string) => `${userApiUrl(teamId, userId)}/role`
export const teamReinviteUrl = (teamId: string, userId: string) => `${userApiUrl(teamId, userId)}/reinvite`
export const teamInvitationApiUrl = (teamId: string) => `${teamApiUrl(teamId)}/invitation`

// notification
export const notificationUrl = (id: string) => `${ROUTE_NOTIFICATIONS}/${id}`
export const notificationApiUrl = (id: string) => `${API_NOTIFICATIONS}/${id}`
export const notificationApiHookUrl = (id: string) => `${notificationApiUrl(id)}/hook`

// image config
export const imageConfigUrl = (productId: string, versionId: string, imageId: string) =>
  `${versionUrl(productId, versionId)}/image/${imageId}`

// instance
export const instanceConfigUrl = (productId: string, versionId: string, deploymentId: string, instanceId: string) =>
  `${deploymentUrl(productId, versionId, deploymentId)}/instance/${instanceId}`

// template
export const templateImageUrl = (templateId: string) => `${API_TEMPLATES}/${templateId}/image`

// tokens
export const tokensApiUrl = (tokenId: string) => `${API_TOKENS}/${tokenId}`

// log
export type ContainerLogParams = {
  anchor?: VersionUrlAnchor
  prefix?: string
  name?: string
}

export const nodeContainerLogUrl = (nodeId: string, params: ContainerLogParams) =>
  appendUrlParams(`${nodeUrl(nodeId)}/log`, params)

export const deploymentContainerLogUrl = (
  productId: string,
  versionId: string,
  deploymentId: string,
  params: ContainerLogParams,
) => appendUrlParams(`${deploymentUrl(productId, versionId, deploymentId)}/log`, params)

// storage
export const storageUrl = (id: string) => `${ROUTE_STORAGES}/${id}`
export const storageApiUrl = (id: string) => `/api${storageUrl(id)}`
