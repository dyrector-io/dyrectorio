import { Logger } from '@app/logger'
import {
  DeploymentDetails,
  DeploymentEventMessage,
  EditorJoinedMessage,
  GetInstanceMessage,
  GetInstanceSecretsMessage,
  InputFocusMessage,
  Instance,
  InstanceMessage,
  InstanceSecrets,
  InstanceSecretsMessage,
  PatchDeployment,
  PatchDeploymentEnvMessage,
  PatchInstance,
  PatchInstanceMessage,
  WS_TYPE_ALL_ITEM_EDITORS,
  WS_TYPE_BLUR_INPUT,
  WS_TYPE_DEPLOYMENT_ENV_UPDATED,
  WS_TYPE_DEPLOYMENT_EVENT_LIST,
  WS_TYPE_EDITOR_IDENTITY,
  WS_TYPE_EDITOR_JOINED,
  WS_TYPE_EDITOR_LEFT,
  WS_TYPE_FETCH_DEPLOYMENT_EVENTS,
  WS_TYPE_FOCUS_INPUT,
  WS_TYPE_GET_INSTANCE,
  WS_TYPE_GET_INSTANCE_SECRETS,
  WS_TYPE_INPUT_BLURED,
  WS_TYPE_INPUT_FOCUSED,
  WS_TYPE_INSTANCE,
  WS_TYPE_INSTANCE_SECRETS,
  WS_TYPE_INSTANCE_UPDATED,
  WS_TYPE_PATCH_DEPLOYMENT_ENV,
  WS_TYPE_PATCH_INSTANCE,
  WS_TYPE_PATCH_RECEIVED,
} from '@app/models'
import { deploymentApiUrl, instanceApiUrl } from '@app/routes'
import { getCrux, patchCrux } from '@app/utils'
import { WsMessage } from '@app/websockets/common'
import WsConnection from '@app/websockets/connection'
import WsEndpoint from '@app/websockets/endpoint'
import { Crux } from '@server/crux/crux'
import DeploymentEventsService from '@server/deployment-event-service'
import EditorService from '@server/editing/editor-service'
import { routedWebSocketEndpoint } from '@server/websocket-endpoint'
import useWebsocketErrorMiddleware from '@server/websocket-error-middleware'
import { NextApiRequest } from 'next'

const logger = new Logger('ws-deployment')

const onReady = async (endpoint: WsEndpoint) => {
  const { services } = endpoint

  const deploymentId = endpoint.query.deploymentId as string

  services.register(EditorService, () => new EditorService())
  services.register(
    DeploymentEventsService,
    () => new DeploymentEventsService(endpoint, endpoint.query.deploymentId as string),
  )

  Crux.withIdentity(null, null).deployments.subscribeToDeploymentEditEvents(deploymentId, {
    onClose: () => logger.debug(`Crux disconnected for: ${deploymentId}`),
    onMessage: message => endpoint.sendAll(message.type, message.payload),
  })
}

const onAuthorize = async (endpoint: WsEndpoint, req: NextApiRequest): Promise<boolean> => {
  const deploymentId = endpoint.query.deploymentId as string

  try {
    await getCrux<DeploymentDetails>(req, deploymentApiUrl(deploymentId))
    return true
  } catch {
    return false
  }
}

const onConnect = (endpoint: WsEndpoint, connection: WsConnection) => {
  const { token, identity } = connection
  const editors = endpoint.services.get(EditorService)

  const editor = editors.onWebSocketConnected(token, identity)
  connection.send(WS_TYPE_EDITOR_IDENTITY, editor)

  const allEditor = editors.getEditors()
  connection.send(WS_TYPE_ALL_ITEM_EDITORS, allEditor)

  endpoint.sendAllExcept(connection, WS_TYPE_EDITOR_JOINED, editor as EditorJoinedMessage)
}

const onDisconnect = (endpoint: WsEndpoint, connection: WsConnection) => {
  const { token } = connection
  const editors = endpoint.services.get(EditorService)

  const disconnectMessage = editors.onWebSocketDisconnected(token)

  endpoint.sendAll(WS_TYPE_EDITOR_LEFT, disconnectMessage)
}

const onFetchEvents = async (endpoint: WsEndpoint, connection: WsConnection) => {
  const eventService = endpoint.services.get(DeploymentEventsService)

  const events = await eventService.fetchEvents(connection)

  connection.send(WS_TYPE_DEPLOYMENT_EVENT_LIST, events as DeploymentEventMessage[])
}

export const onPatchInstance = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<PatchInstanceMessage>,
) => {
  const deploymentId = endpoint.query.deploymentId as string

  const req = message.payload

  const cruxReq: Pick<PatchInstance, 'config'> = {}

  if (req.resetSection) {
    cruxReq.config = {}
    cruxReq.config[req.resetSection as string] = null
  } else {
    cruxReq.config = req.config
  }

  await patchCrux(connection.request, instanceApiUrl(deploymentId, req.instanceId), cruxReq)

  connection.send(WS_TYPE_PATCH_RECEIVED, {})

  endpoint.sendAllExcept(connection, WS_TYPE_INSTANCE_UPDATED, {
    ...req,
  })
}

const onPatchDeploymentEnvironment = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<PatchDeploymentEnvMessage>,
) => {
  const deploymentId = endpoint.query.deploymentId as string

  const req = message.payload

  const cruxReq: Omit<PatchDeployment, 'id'> = {
    environment: req,
  }

  await patchCrux(connection.request, deploymentApiUrl(deploymentId), cruxReq)

  connection.send(WS_TYPE_PATCH_RECEIVED, {})
  endpoint.sendAllExcept(connection, WS_TYPE_DEPLOYMENT_ENV_UPDATED, req)
}

const onGetInstance = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<GetInstanceMessage>,
) => {
  const deploymentId = endpoint.query.deploymentId as string

  const req = message.payload

  const instance = await getCrux<Instance>(connection.request, instanceApiUrl(deploymentId, req.id))

  connection.send(WS_TYPE_INSTANCE, instance as InstanceMessage)
}

const onGetSecrets = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<GetInstanceSecretsMessage>,
) => {
  const deploymentId = endpoint.query.deploymentId as string

  const req = message.payload

  const secrets = await getCrux<InstanceSecrets>(connection.request, instanceApiUrl(deploymentId, req.id))

  if (!secrets.keys) {
    return
  }

  connection.send(WS_TYPE_INSTANCE_SECRETS, {
    instanceId: message.payload.id,
    keys: secrets.keys,
  } as InstanceSecretsMessage)
}

const onFocusInput = async (endpoint: WsEndpoint, connection: WsConnection, message: WsMessage<InputFocusMessage>) => {
  const { token } = connection
  const editors = endpoint.services.get(EditorService)

  const res = editors.onFocus(token, message.payload)

  endpoint.sendAllExcept(connection, WS_TYPE_INPUT_FOCUSED, res)
}

const onBlurInput = async (endpoint: WsEndpoint, connection: WsConnection, message: WsMessage<InputFocusMessage>) => {
  const { token } = connection
  const editors = endpoint.services.get(EditorService)

  const res = editors.onBlur(token, message.payload)
  if (!res) {
    return
  }

  endpoint.sendAllExcept(connection, WS_TYPE_INPUT_BLURED, res)
}

export default routedWebSocketEndpoint(
  logger,
  [
    [WS_TYPE_FETCH_DEPLOYMENT_EVENTS, onFetchEvents],
    [WS_TYPE_PATCH_INSTANCE, onPatchInstance],
    [WS_TYPE_PATCH_DEPLOYMENT_ENV, onPatchDeploymentEnvironment],
    [WS_TYPE_GET_INSTANCE, onGetInstance],
    [WS_TYPE_GET_INSTANCE_SECRETS, onGetSecrets],
    [WS_TYPE_FOCUS_INPUT, onFocusInput],
    [WS_TYPE_BLUR_INPUT, onBlurInput],
  ],
  [useWebsocketErrorMiddleware],
  {
    onReady,
    onAuthorize,
    onConnect,
    onDisconnect,
  },
)
