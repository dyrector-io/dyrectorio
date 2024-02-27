/* eslint-disable no-underscore-dangle */
import { GetServerSidePropsContext } from 'next'
import { AuditLogQuery, ContainerIdentifier, ContainerOperation, PaginationQuery, VersionSectionsState } from './models'

// Routes:
export const ROUTE_DOCS = 'https://docs.dyrector.io'
export const ROUTE_INDEX = '/'
export const ROUTE_STATUS = '/status'
export const ROUTE_404 = '/404'
export const ROUTE_PROFILE = '/auth/settings'
export const ROUTE_NEW_PASSWORD = '/auth/settings/new-password'
export const ROUTE_LOGIN = '/auth/login'
export const ROUTE_LOGOUT = '/auth/logout'
export const ROUTE_REGISTER = '/auth/register'
export const ROUTE_REGISTER_OIDC = '/auth/register-oidc'

export const ROUTE_SETTINGS = '/auth/settings'
export const ROUTE_SETTINGS_TOKENS = '/auth/settings/tokens'
export const ROUTE_SETTINGS_EDIT_PROFILE = '/auth/settings/edit-profile'
export const ROUTE_SETTINGS_CHANGE_PASSWORD = '/auth/settings/change-password'
export const ROUTE_RECOVERY = '/auth/recovery'
export const ROUTE_RECOVERY_EXPIRED = `${ROUTE_RECOVERY}/expired`
export const ROUTE_VERIFICATION = '/auth/verify'

export const ROUTE_TEAMS = '/teams'
export const ROUTE_TEAMS_CREATE = '/teams/create'

export const ROUTE_TEMPLATES = '/templates'

export const API_AUTH_REGISTER = '/api/auth/register'
export const API_AUTH_LOGIN = '/api/auth/login'
export const API_AUTH_LOGOUT = '/api/auth/logout'

export const API_SETTINGS = '/api/auth/settings'
export const API_SETTINGS_EDIT_PROFILE = '/api/auth/settings/edit-profile'
export const API_SETTINGS_CHANGE_PASSWORD = '/api/auth/settings/change-password'
export const API_SETTINGS_OIDC = '/api/auth/settings/oidc'
export const API_RECOVERY = '/api/auth/recovery'
export const API_VERIFICATION = '/api/auth/verify'
export const API_CREATE_ACCOUNT = '/api/auth/create-account'
export const API_QUALITY_ASSURANCE = '/api/quality-assurance'

export const API_STATUS = '/api/status'

export const API_TEMPLATES = `/api/templates`
export const API_TOKENS = '/api/tokens'
export const API_HEALTH = '/api/health'
export const API_TEAMS = '/api/teams'
export const API_USERS_ME = '/api/users/me'
export const API_USERS_ME_INVITATIONS = `${API_USERS_ME}/invitations`
export const API_USERS_ME_PREFERENCES_ONBOARDING = `${API_USERS_ME}/preferences/onboarding`

export const ANCHOR_NEW = '#new'
export const ANCHOR_EDIT = '#edit'
export const ANCHOR_TRIGGER = '#trigger'

export type AnchorUrlParams = Record<string, string | boolean> & {
  anchor?: string | undefined
}

export type ListRouteOptions = {
  new?: boolean
}

type DetailsRouteOptions = {
  edit?: boolean
}

const appendAnchorWhenDeclared = (url: string, anchor: string, anchorProp?: boolean) => {
  if (anchorProp) {
    return `${url}${anchor}`
  }

  return url
}

const appendUrlParams = (url: string, params?: AnchorUrlParams): string => {
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
    result = `${result}?${firstKey}=${encodeURIComponent(firstValue)}`

    if (entries.length > 1) {
      const rest = entries.slice(1)

      result = rest.reduce((prev, current) => {
        const [key, value] = current
        return `${prev}&${key}=${encodeURIComponent(value)}`
      }, result)
    }
  }

  return anchor ? `${result}${anchor}` : result
}

const urlQuery = (url: string, query: object) => {
  const params = Object.entries(query)
    .map(it => {
      const [key, value] = it

      if (value === undefined || value === null) {
        return null
      }

      return `${key}=${encodeURIComponent(value)}`
    })
    .filter(it => !!it)

  if (params.length < 1) {
    return url
  }

  url = `${url}?${params[0]}`

  if (params.length > 1) {
    url = params.slice(1).reduce((prev, it) => `${prev}&${it}`, url)
  }

  return url
}

// docs
export const apiDocsUrl = (params: AnchorUrlParams) => appendUrlParams(`${ROUTE_DOCS}/basics/api`, params)

// auth
export type VerificationUrlParams = {
  email?: string
  restart?: boolean
}

export const verificationUrl = (params: VerificationUrlParams) => appendUrlParams(ROUTE_VERIFICATION, params)

// team
export const teamListUrl = (options?: ListRouteOptions) =>
  appendAnchorWhenDeclared(ROUTE_TEAMS, ANCHOR_NEW, options?.new)
export const teamUrl = (id: string) => `${ROUTE_TEAMS}/${id}`
export const teamApiUrl = (id: string) => `${API_TEAMS}/${id}`
export const teamInvitationUrl = (teamId: string) => `${ROUTE_TEAMS}/${teamId}/invitation`
export const teamUserListApiUrl = (teamId: string) => `${teamApiUrl(teamId)}/users`
export const teamUserApiUrl = (teamId: string, userId: string) => `${teamUserListApiUrl(teamId)}/${userId}`
export const teamUserRoleApiUrl = (teamId: string, userId: string) => `${teamUserApiUrl(teamId, userId)}/role`
export const teamUserReinviteUrl = (teamId: string, userId: string) => `${teamUserApiUrl(teamId, userId)}/reinvite`
export const teamUserLeaveApiUrl = (teamId: string) => `${teamUserListApiUrl(teamId)}/leave`
export const selectTeamUrl = (teamSlug: string) => `/${teamSlug}`

export const userInvitationApiUrl = (teamId: string) => `${API_USERS_ME_INVITATIONS}/${teamId}`

// template
export const templateImageUrl = (templateId: string) => `${API_TEMPLATES}/${templateId}/image`

// tokens
export const tokensApiUrl = (tokenId: string) => `${API_TOKENS}/${tokenId}`

// dashboard
class DashboardRoutes {
  private readonly root: string

  constructor(root: string) {
    this.root = `${root}/dashboard`
  }

  api = () => `/api${this.root}`

  index = () => this.root
}

export const registerOidcUrl = (flow: string) => `${ROUTE_REGISTER_OIDC}?flow=${encodeURIComponent(flow)}`

// audit
class AuditRoutes {
  private readonly root: string

  constructor(root: string) {
    this.root = `${root}/audit-log`
  }

  api = (query: AuditLogQuery) => urlQuery(`/api${this.root}`, query)

  list = () => `${this.root}`
}

// node
export type ContainerLogParams = {
  prefix?: string
  name?: string
}

class NodeApi {
  private readonly root: string

  constructor(root: string) {
    this.root = `/api${root}`
  }

  list = () => this.root

  details = (id: string) => `${this.root}/${id}`

  script = (id: string) => `${this.details(id)}/script`

  token = (id: string) => `${this.details(id)}/token`

  update = (id: string) => `${this.details(id)}/update`

  audit = (id: string, query: AuditLogQuery) => urlQuery(`${this.details(id)}/audit`, query)

  deployments = (id: string) => `${this.details(id)}/deployments`

  kick = (id: string) => `${this.details(id)}/kick`

  // node-global-container
  globalContainerList = (id: string) => `${this.details(id)}/containers`

  globalContainer = (id: string, containerName: string) => `${this.globalContainerList(id)}/${containerName}`

  globalContainerOperation = (id: string, containerName: string, operation: ContainerOperation) =>
    `${this.globalContainer(id, containerName)}/${operation}`

  // node-prefix-container
  prefixContainerList = (id: string, prefix: string) => `${this.details(id)}/${prefix}/containers`

  prefixContainer = (id: string, contianer: ContainerIdentifier) =>
    `${this.prefixContainerList(id, contianer.prefix)}/${contianer.name}`

  prefixContainerOperation = (id: string, container: ContainerIdentifier, operation: ContainerOperation) =>
    `${this.prefixContainer(id, container)}/${operation}`
}

class NodeRoutes {
  private readonly root: string

  constructor(root: string) {
    this.root = `${root}/nodes`
  }

  private _api: NodeApi

  get api() {
    if (!this._api) {
      this._api = new NodeApi(this.root)
    }

    return this._api
  }

  socket = () => this.root

  detailsSocket = (id: string) => this.details(id)

  list = (options?: ListRouteOptions) => appendAnchorWhenDeclared(this.root, ANCHOR_NEW, options?.new)

  details = (id: string, options?: DetailsRouteOptions) =>
    appendAnchorWhenDeclared(`${this.root}/${id}`, ANCHOR_EDIT, options?.edit)

  inspect = (id: string, prefix?: string) => `${this.details(id)}?prefix=${prefix}`

  containerLog = (id: string, params: ContainerLogParams) =>
    appendUrlParams(`${this.details(id)}/log`, {
      ...params,
    })

  containerInspect = (id: string, params: ContainerLogParams) =>
    appendUrlParams(`${this.details(id)}/inspect`, {
      ...params,
    })
}

class RegistryApi {
  private readonly root: string

  constructor(root: string) {
    this.root = `/api${root}`
  }

  list = () => this.root

  details = (id: string) => `${this.root}/${id}`

  token = (id: string) => `${this.details(id)}/token`
}

class RegistryRoutes {
  private readonly root: string

  constructor(root: string) {
    this.root = `${root}/registries`
  }

  private _api: RegistryApi

  get api() {
    if (!this._api) {
      this._api = new RegistryApi(this.root)
    }

    return this._api
  }

  socket = () => this.root

  list = (options?: ListRouteOptions) => appendAnchorWhenDeclared(this.root, ANCHOR_NEW, options?.new)

  details = (id: string) => `${this.root}/${id}`
}

// version
export type VersionUrlParams = {
  edit?: boolean
  section?: VersionSectionsState
}

class VersionApi {
  private readonly root: string

  constructor(root: string) {
    this.root = `/api${root}`
  }

  list = () => this.root

  details = (id: string) => `${this.root}/${id}`

  increase = (id: string) => `${this.details(id)}/increase`

  setAsDefault = (id: string) => `${this.details(id)}/default`

  deployments = (versionId: string) => `${this.details(versionId)}/deployments`

  images = (versionId: string) => `${this.details(versionId)}/images`

  orderImages = (versionId: string) => `${this.details(versionId)}/order`

  imageDetails = (versionId: string, imageId: string) => `${this.images(versionId)}/${imageId}`
}

class VersionRoutes {
  private readonly root: string

  constructor(root: string, projectId: string) {
    this.root = `${root}/${projectId}/versions`
  }

  private _api: VersionApi

  get api() {
    if (!this._api) {
      this._api = new VersionApi(this.root)
    }

    return this._api
  }

  detailsSocket = (id: string) => `${this.root}/${id}`

  details = (id: string, params?: VersionUrlParams) => appendUrlParams(`${this.root}/${id}`, params)

  deployments = (versionId: string) => `${this.details(versionId)}/deployments`

  imageDetails = (versionId: string, imageId: string) => `${this.details(versionId)}/images/${imageId}`
}

// project
class ProjectApi {
  private readonly root: string

  constructor(root: string) {
    this.root = `/api${root}`
  }

  list = () => this.root

  details = (id: string) => `${this.root}/${id}`

  convertToVersioned = (id: string) => `${this.details(id)}/convert`
}

class ProjectRoutes {
  private readonly root: string

  constructor(root: string) {
    this.root = `${root}/projects`
  }

  private _api: ProjectApi

  private _versionProjectId: string

  private _versionRoutes: VersionRoutes

  get api() {
    if (!this._api) {
      this._api = new ProjectApi(this.root)
    }

    return this._api
  }

  list = (options?: ListRouteOptions) => appendAnchorWhenDeclared(this.root, ANCHOR_NEW, options?.new)

  details = (id: string, params?: VersionUrlParams) => appendUrlParams(`${this.root}/${id}`, params)

  versions = (projectId: string) => {
    if (this._versionProjectId !== projectId) {
      this._versionRoutes = new VersionRoutes(this.root, projectId)
    }

    return this._versionRoutes
  }
}

// deployment
export type DeployStartUrlParams = {
  ignoreProtected?: boolean
}

class DeploymentApi {
  private readonly root: string

  constructor(root: string) {
    this.root = `/api${root}`
  }

  list = () => this.root

  details = (id: string) => `${this.root}/${id}`

  copy = (id: string) => `${this.details(id)}/copy`

  start = (id: string, ignoreProtected?: boolean) =>
    appendUrlParams(`${this.details(id)}/start`, {
      ignoreProtected,
    })

  token = (id: string) => `${this.details(id)}/token`

  instanceDetails = (deploymentId: string, instanceId: string) =>
    `${this.details(deploymentId)}/instances/${instanceId}`

  instanceSecrets = (deploymentId: string, instanceId: string) =>
    `${this.instanceDetails(deploymentId, instanceId)}/secrets`
}

class DeploymentRoutes {
  private readonly root: string

  constructor(root: string) {
    this.root = `${root}/deployments`
  }

  private _api: DeploymentApi

  get api() {
    if (!this._api) {
      this._api = new DeploymentApi(this.root)
    }

    return this._api
  }

  detailsSocket = (id: string) => this.details(id)

  list = (options?: ListRouteOptions) => appendAnchorWhenDeclared(this.root, ANCHOR_NEW, options?.new)

  details = (id: string) => `${this.root}/${id}`

  deploy = (id: string) => `${this.details(id)}/deploy`

  instanceDetails = (deploymentId: string, instanceId: string) =>
    `${this.details(deploymentId)}/instances/${instanceId}`
}

// notification
class NotificationApi {
  private readonly root: string

  constructor(root: string) {
    this.root = `/api${root}`
  }

  list = () => this.root

  details = (id: string) => `${this.root}/${id}`

  test = (id: string) => `${this.details(id)}/test`
}

class NotificationRoutes {
  private readonly root: string

  constructor(root: string) {
    this.root = `${root}/notifications`
  }

  private _api: NotificationApi

  get api() {
    if (!this._api) {
      this._api = new NotificationApi(this.root)
    }

    return this._api
  }

  list = (options?: ListRouteOptions) => appendAnchorWhenDeclared(this.root, ANCHOR_NEW, options?.new)

  details = (id: string) => `${this.root}/${id}`
}

// storage

class StorageApi {
  private readonly root: string

  constructor(root: string) {
    this.root = `/api${root}`
  }

  list = () => this.root

  options = () => `${this.root}/options`

  details = (id: string) => `${this.root}/${id}`
}

class StorageRoutes {
  private readonly root: string

  constructor(root: string) {
    this.root = `${root}/storages`
  }

  private _api: StorageApi

  get api() {
    if (!this._api) {
      this._api = new StorageApi(this.root)
    }

    return this._api
  }

  list = (options?: ListRouteOptions) => appendAnchorWhenDeclared(this.root, ANCHOR_NEW, options?.new)

  details = (id: string) => `${this.root}/${id}`
}

// pipeline

class PipelineApi {
  private readonly root: string

  constructor(root: string) {
    this.root = `/api${root}`
  }

  list = () => this.root

  details = (id: string) => `${this.root}/${id}`

  runs = (pipelineId: string, query?: PaginationQuery) => {
    const url = `${this.details(pipelineId)}/runs`

    if (!query) {
      return url
    }

    return urlQuery(url, query)
  }

  eventWatchers = (pipelineId: string) => `${this.details(pipelineId)}/event-watchers`

  eventWatcherDetails = (pipelineId: string, eventWatcherId: string) =>
    `${this.eventWatchers(pipelineId)}/${eventWatcherId}`
}

type PipelineDetailsRouteOptions = {
  trigger?: boolean
}

class PipelineRoutes {
  private readonly root: string

  constructor(root: string) {
    this.root = `${root}/pipelines`
  }

  private _api: PipelineApi

  get api() {
    if (!this._api) {
      this._api = new PipelineApi(this.root)
    }

    return this._api
  }

  list = (options?: ListRouteOptions) => appendAnchorWhenDeclared(this.root, ANCHOR_NEW, options?.new)

  details = (id: string, options?: PipelineDetailsRouteOptions) =>
    appendUrlParams(
      `${this.root}/${id}`,
      options?.trigger
        ? {
            ANCHOR_TRIGGER,
          }
        : null,
    )

  socket = () => this.root
}

// config bundle

class ConfigBundleApi {
  private readonly root: string

  constructor(root: string) {
    this.root = `/api${root}`
  }

  list = () => this.root

  details = (id: string) => `${this.root}/${id}`

  options = () => `${this.root}/options`
}

class ConfigBundleRoutes {
  private readonly root: string

  constructor(root: string) {
    this.root = `${root}/config-bundles`
  }

  private _api: ConfigBundleApi

  get api() {
    if (!this._api) {
      this._api = new ConfigBundleApi(this.root)
    }

    return this._api
  }

  list = (options?: ListRouteOptions) => appendAnchorWhenDeclared(this.root, ANCHOR_NEW, options?.new)

  details = (id: string) => `${this.root}/${id}`

  detailsSocket = (id: string) => this.details(id)
}

export class TeamRoutes {
  readonly root: string

  constructor(readonly teamSlug: string) {
    this.root = `/${teamSlug}`
  }

  private _audit: AuditRoutes

  private _dashboard: DashboardRoutes

  private _node: NodeRoutes

  private _registry: RegistryRoutes

  private _project: ProjectRoutes

  private _deployment: DeploymentRoutes

  private _notification: NotificationRoutes

  private _storage: StorageRoutes

  private _pipeline: PipelineRoutes

  private _configBundles: ConfigBundleRoutes

  get audit() {
    if (!this._audit) {
      this._audit = new AuditRoutes(this.root)
    }

    return this._audit
  }

  get dashboard() {
    if (!this._dashboard) {
      this._dashboard = new DashboardRoutes(this.root)
    }

    return this._dashboard
  }

  get node() {
    if (!this._node) {
      this._node = new NodeRoutes(this.root)
    }

    return this._node
  }

  get registry() {
    if (!this._registry) {
      this._registry = new RegistryRoutes(this.root)
    }

    return this._registry
  }

  get project() {
    if (!this._project) {
      this._project = new ProjectRoutes(this.root)
    }

    return this._project
  }

  get deployment() {
    if (!this._deployment) {
      this._deployment = new DeploymentRoutes(this.root)
    }

    return this._deployment
  }

  get notification() {
    if (!this._notification) {
      this._notification = new NotificationRoutes(this.root)
    }

    return this._notification
  }

  get storage() {
    if (!this._storage) {
      this._storage = new StorageRoutes(this.root)
    }

    return this._storage
  }

  get pipeline() {
    if (!this._pipeline) {
      this._pipeline = new PipelineRoutes(this.root)
    }

    return this._pipeline
  }

  get configBundles() {
    if (!this._configBundles) {
      this._configBundles = new ConfigBundleRoutes(this.root)
    }

    return this._configBundles
  }

  static fromContext(context: GetServerSidePropsContext): TeamRoutes | null {
    const teamSlug = context.query.teamSlug as string
    if (!teamSlug) {
      return null
    }

    return new TeamRoutes(teamSlug)
  }
}
