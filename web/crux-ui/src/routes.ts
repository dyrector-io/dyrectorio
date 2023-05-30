import { AuditLogQuery, ContainerIdentifier, ContainerOperation, VersionSectionsState } from './models'

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

export const ROUTE_PROJECTS = '/projects'
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

export const API_REGISTRIES = '/api/registries'
export const API_PROJECTS = '/api/projects'
export const API_NODES = '/api/nodes'
export const API_DEPLOYMENTS = '/api/deployments'

export const API_TEAMS = '/api/teams'
export const API_USERS_ME = '/api/users/me'
export const API_USERS_ME_ACTIVE_TEAM = `${API_USERS_ME}/active-team`
export const API_USERS_ME_INVITATIONS = `${API_USERS_ME}/invitations`

export const API_NOTIFICATIONS = '/api/notifications'

export const API_AUDIT = `/api/audit-log`

export const API_TEMPLATES = `/api/templates`

export const API_DASHBOARD = '/api/dashboard'

export const API_TOKENS = '/api/tokens'

export const API_STORAGES = '/api/storages'
export const API_STORAGES_OPTIONS = `${API_STORAGES}/options`

export const WS_NODES = `/nodes`
export const WS_REGISTRIES = `/registries`

export const API_HEALTH = '/api/health'

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
export const verificationUrl = (email: string) => `${ROUTE_VERIFICATION}?email=${encodeURIComponent(email)}`

// project
export const projectUrl = (id: string, params?: VersionUrlParams) => appendUrlParams(`${ROUTE_PROJECTS}/${id}`, params)
export const projectApiUrl = (id: string) => `${API_PROJECTS}/${id}`
export const projectVersionsApiUrl = (projectId: string) => `${projectApiUrl(projectId)}/versions`

// registry
export const registryUrl = (id: string) => `${ROUTE_REGISTRIES}/${id}`
export const registryApiUrl = (id: string) => `${API_REGISTRIES}/${id}`

// node
export const nodeUrl = (id: string) => `${ROUTE_NODES}/${id}`
export const nodeInspectUrl = (id: string, prefix?: string) => `${nodeUrl(id)}?prefix=${prefix}`
export const nodeApiUrl = (id: string) => `${API_NODES}/${id}`
export const nodeScriptApiUrl = (id: string) => `${nodeApiUrl(id)}/script`
export const nodeTokenApiUrl = (id: string) => `${nodeApiUrl(id)}/token`
export const nodeUpdateApiUrl = (id: string) => `${nodeApiUrl(id)}/update`
export const nodeWsUrl = (id: string) => `/nodes/${id}`

// node-global-container
export const nodeGlobalContainerListApiUrl = (nodeId: string) => `${nodeApiUrl(nodeId)}/containers`
export const nodeGlobalContainerApiUrl = (nodeId: string, containerName: string) =>
  `${nodeGlobalContainerListApiUrl(nodeId)}/${containerName}`
export const nodeGlobalContainerOperationApiUrl = (
  nodeId: string,
  containerName: string,
  operation: ContainerOperation,
) => `${nodeGlobalContainerApiUrl(nodeId, containerName)}/${operation}`

// node-prefix-container
export const nodePrefixContainerListApiUrl = (nodeId: string, prefix: string) =>
  `${nodeApiUrl(nodeId)}/${prefix}/containers`
export const nodePrefixContainerApiUrl = (nodeId: string, contianer: ContainerIdentifier) =>
  `${nodePrefixContainerListApiUrl(nodeId, contianer.prefix)}/${contianer.name}`
export const nodePrefixContainerOperationApiUrl = (
  nodeId: string,
  container: ContainerIdentifier,
  operation: ContainerOperation,
) => `${nodePrefixContainerApiUrl(nodeId, container)}/${operation}`

// version

export type VersionUrlAnchor = 'edit'
export type VersionUrlParams = {
  anchor?: VersionUrlAnchor
  section?: VersionSectionsState
}

export const versionUrl = (projectId: string, versionId: string, params?: VersionUrlParams) =>
  appendUrlParams(`${projectUrl(projectId)}/versions/${versionId}`, params)

export const versionApiUrl = (projectId: string, versionId: string) =>
  `${projectApiUrl(projectId)}/versions/${versionId}`
export const versionIncreaseApiUrl = (projectId: string, versionId: string) =>
  `${versionApiUrl(projectId, versionId)}/increase`
export const versionSetDefaultApiUrl = (projectId: string, versionId: string) =>
  `${versionApiUrl(projectId, versionId)}/default`
export const versionWsUrl = (versionId: string) => `/versions/${versionId}`

// deployment
export const versionDeploymentsUrl = (projectId: string, versionId: string) =>
  `${versionUrl(projectId, versionId)}/deployments`
export const versionDeploymentsApiUrl = (projectId: string, versionId: string) =>
  `/api${versionDeploymentsUrl(projectId, versionId)}`

export const deploymentUrl = (deploymentId: string) => `${ROUTE_DEPLOYMENTS}/${deploymentId}`

export const deploymentApiUrl = (deploymentId: string) => `${API_DEPLOYMENTS}/${deploymentId}`

export const deploymentWsUrl = (deploymentId: string) => `${deploymentUrl(deploymentId)}`

export const deploymentDeployUrl = (deploymentId: string) => `${deploymentUrl(deploymentId)}/deploy`

export const deploymentCopyUrl = (deploymentId: string, force?: boolean) =>
  `${deploymentApiUrl(deploymentId)}/copy${force ? '?overwrite=true' : ''}`

export const deploymentStartApiUrl = (deploymentId: string) => `${deploymentApiUrl(deploymentId)}/start`

export const instanceApiUrl = (deploymentId: string, instanceId: string) =>
  `${deploymentApiUrl(deploymentId)}/instances/${instanceId}`

export const instanceSecretsApiUrl = (deploymentId: string, instanceId: string) =>
  `${instanceApiUrl(deploymentId, instanceId)}/secrets`

// team
export const teamUrl = (id: string) => `${ROUTE_TEAMS}/${id}`
export const teamApiUrl = (id: string) => `${API_TEAMS}/${id}`
export const teamInvitationUrl = (teamId: string) => `${ROUTE_TEAMS}/${teamId}/invitation`
export const teamUserListApiUrl = (teamId: string) => `${teamApiUrl(teamId)}/users`
export const teamUserApiUrl = (teamId: string, userId: string) => `${teamUserListApiUrl(teamId)}/${userId}`
export const teamUserRoleApiUrl = (teamId: string, userId: string) => `${teamUserApiUrl(teamId, userId)}/role`
export const teamUserReinviteUrl = (teamId: string, userId: string) => `${teamUserApiUrl(teamId, userId)}/reinvite`

export const userInvitationApiUrl = (teamId: string) => `${API_USERS_ME_INVITATIONS}/${teamId}`

// notification
export const notificationUrl = (id: string) => `${ROUTE_NOTIFICATIONS}/${id}`
export const notificationApiUrl = (id: string) => `${API_NOTIFICATIONS}/${id}`
export const notificationApiHookUrl = (id: string) => `${notificationApiUrl(id)}/test`

// image config
export const imageConfigUrl = (projectId: string, versionId: string, imageId: string) =>
  `${versionUrl(projectId, versionId)}/images/${imageId}`

export const versionImagesApiUrl = (projectId: string, versionId: string) =>
  `${versionApiUrl(projectId, versionId)}/images`

export const versionImagesOrderApiUrl = (projectId: string, versionId: string) =>
  `${versionImagesApiUrl(projectId, versionId)}/order`

export const imageApiUrl = (projectId: string, versionId: string, imageId: string) =>
  `${versionImagesApiUrl(projectId, versionId)}/${imageId}`

// instance
export const instanceConfigUrl = (deploymentId: string, instanceId: string) =>
  `${deploymentUrl(deploymentId)}/instances/${instanceId}`

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

export const deploymentContainerLogUrl = (deploymentId: string, params: ContainerLogParams) =>
  appendUrlParams(`${deploymentUrl(deploymentId)}/log`, params)

// storage
export const storageUrl = (id: string) => `${ROUTE_STORAGES}/${id}`
export const storageApiUrl = (id: string) => `${API_STORAGES}/${id}`
