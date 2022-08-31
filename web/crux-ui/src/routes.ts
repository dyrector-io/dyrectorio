import {
  API_NOTIFICATIONS,
  ROUTE_NODES,
  ROUTE_NOTIFICATIONS,
  ROUTE_PRODUCTS,
  ROUTE_REGISTRIES,
  ROUTE_TEAMS,
} from './const'
import { VersionSectionsState } from './models'
import { appendUrlParams } from './utils'

// product
export const productUrl = (id: string, params?: VersionUrlParams) => appendUrlParams(`${ROUTE_PRODUCTS}/${id}`, params)
export const productApiUrl = (id: string) => `/api${productUrl(id)}`
export const productVersionsApiUrl = (productId: string) => `${productApiUrl(productId)}/versions`

// registry
export const registryUrl = (id: string) => `${ROUTE_REGISTRIES}/${id}`
export const registryApiUrl = (id: string) => `/api${registryUrl(id)}`

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

export const versionApiUrl = (productId: string, versionId: string) => `/api${versionUrl(productId, versionId)}`
export const versionIncreaseApiUrl = (productId: string, versionId: string) =>
  `${versionApiUrl(productId, versionId)}/increase`
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

// team
export const teamUrl = (id: string) => `${ROUTE_TEAMS}/${id}`
export const teamApiUrl = (id: string) => `/api${teamUrl(id)}`
export const teamInviteUrl = (teamId: string) => `${ROUTE_TEAMS}/${teamId}/invite`
export const teamUsersApiUrl = (teamId: string) => `${teamApiUrl(teamId)}/users`
export const userApiUrl = (teamId: string, userId: string) => `${teamUsersApiUrl(teamId)}/${userId}`
export const userRoleApiUrl = (teamId: string, userId: string) => `${userApiUrl(teamId, userId)}/role`
export const teamAcceptInviteApiUrl = (teamId: string) => `${teamApiUrl(teamId)}/accept`

// notification
export const notificationUrl = (id: string) => `${ROUTE_NOTIFICATIONS}/${id}`
export const notificationApiUrl = (id: string) => `${API_NOTIFICATIONS}/${id}`
export const notificationApiHookUrl = (id: string) => `${notificationApiUrl(id)}/hook`
