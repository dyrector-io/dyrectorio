import { Logger } from '@app/logger'
import {
  DeploymentEventMessage,
  DeploymentGetSecretListMessage,
  DeploymentSecretListMessage,
  EditorJoinedMessage,
  FetchDeploymentEventsMessage,
  GetInstanceMessage,
  InputFocusMessage,
  PatchDeploymentEnvMessage,
  PatchInstanceMessage,
  StartDeploymentMessage,
  WS_TYPE_ALL_ITEM_EDITORS,
  WS_TYPE_BLUR_INPUT,
  WS_TYPE_DEPLOYMENT_ENV_UPDATED,
  WS_TYPE_DEPLOYMENT_EVENT,
  WS_TYPE_DEPLOYMENT_EVENT_LIST,
  WS_TYPE_DEPLOYMENT_FINISHED,
  WS_TYPE_DEPLOYMENT_SECRETS,
  WS_TYPE_DYO_ERROR,
  WS_TYPE_EDITOR_IDENTITY,
  WS_TYPE_EDITOR_JOINED,
  WS_TYPE_EDITOR_LEFT,
  WS_TYPE_FETCH_DEPLOYMENT_EVENTS,
  WS_TYPE_FOCUS_INPUT,
  WS_TYPE_GET_DEPLOYMENT_SECRETS,
  WS_TYPE_GET_INSTANCE,
  WS_TYPE_INPUT_BLURED,
  WS_TYPE_INPUT_FOCUSED,
  WS_TYPE_INSTANCE,
  WS_TYPE_INSTANCE_UPDATED,
  WS_TYPE_PATCH_DEPLOYMENT_ENV,
  WS_TYPE_PATCH_INSTANCE,
  WS_TYPE_START_DEPLOYMENT,
} from '@app/models'
import { WsMessage } from '@app/websockets/common'
import WsConnection from '@app/websockets/connection'
import WsEndpoint from '@app/websockets/endpoint'
import crux, { Crux, cruxFromConnection } from '@server/crux/crux'
import EditorService from '@server/editing/editor-service'
import { fromGrpcError, parseGrpcError } from '@server/error-middleware'
import { routedWebSocketEndpoint } from '@server/websocket-endpoint'
import useWebsocketErrorMiddleware from '@server/websocket-error-middleware'
import { NextApiRequest } from 'next'

const logger = new Logger('ws-deployment')

const onReady = async (endpoint: WsEndpoint) => {
  const { services } = endpoint

  const deploymentId = endpoint.query.deploymentId as string

  services.register(EditorService, () => new EditorService())

  Crux.withIdentity(null).deployments.subscribeToDeploymentEditEvents(deploymentId, {
    onClose: () => logger.debug(`Crux disconnected for: ${deploymentId}`),
    onMessage: message => endpoint.sendAll(message.type, message.payload),
  })
}

const onAuthorize = async (endpoint: WsEndpoint, req: NextApiRequest): Promise<boolean> => {
  const deploymentId = endpoint.query.deploymentId as string

  try {
    crux(req).deployments.getById(deploymentId)
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

const onFetchEvents = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<FetchDeploymentEventsMessage>,
) => {
  const req = message.payload

  const events = await cruxFromConnection(connection).deployments.getEvents(req.id)
  connection.send(WS_TYPE_DEPLOYMENT_EVENT_LIST, events as DeploymentEventMessage[])
}

const onStartDeployment = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<StartDeploymentMessage>,
) => {
  const req = message.payload

  cruxFromConnection(connection).deployments.startDeployment(req.id, {
    onMessage: events => events.forEach(it => endpoint.sendAll(WS_TYPE_DEPLOYMENT_EVENT, it as DeploymentEventMessage)),
    onError: err => {
      const error = parseGrpcError(err)
      endpoint.sendAll(WS_TYPE_DYO_ERROR, fromGrpcError(error))
    },
    onClose: () => endpoint.sendAll(WS_TYPE_DEPLOYMENT_FINISHED, {}),
  })
}

export const onPatchInstance = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<PatchInstanceMessage>,
) => {
  const id = endpoint.query.deploymentId as string

  const req = message.payload

  await cruxFromConnection(connection).deployments.patch({
    id,
    instance: {
      instanceId: req.instanceId,
      config: {
        ...req,
      },
    },
  })

  endpoint.sendAll(WS_TYPE_INSTANCE_UPDATED, {
    ...req,
  })
}

const onPatchDeploymentEnvironment = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<PatchDeploymentEnvMessage>,
) => {
  const id = endpoint.query.deploymentId as string

  const req = message.payload

  await cruxFromConnection(connection).deployments.patch({
    id,
    environment: req,
  })

  endpoint.sendAll(WS_TYPE_DEPLOYMENT_ENV_UPDATED, req)
}

const onGetInstance = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<GetInstanceMessage>,
) => {
  const deploymentId = endpoint.query.deploymentId as string

  const req = message.payload

  const res = await cruxFromConnection(connection).deployments.getById(deploymentId)

  connection.send(
    WS_TYPE_INSTANCE,
    res.instances.find(it => it.id === req.id),
  )
}

const onGetSecrets = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<DeploymentGetSecretListMessage>,
) => {
  const deploymentId = endpoint.query.deploymentId as string

  const req = message.payload

  const res = await cruxFromConnection(connection).deployments.getSecretsList(deploymentId, req.instanceId)

  if (!res.hasKeys) {
    return
  }

  connection.send(WS_TYPE_DEPLOYMENT_SECRETS, {
    instanceId: message.payload.instanceId,
    keys: res.keys,
  } as DeploymentSecretListMessage)
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
    [WS_TYPE_START_DEPLOYMENT, onStartDeployment],
    [WS_TYPE_PATCH_INSTANCE, onPatchInstance],
    [WS_TYPE_PATCH_DEPLOYMENT_ENV, onPatchDeploymentEnvironment],
    [WS_TYPE_GET_INSTANCE, onGetInstance],
    [WS_TYPE_GET_DEPLOYMENT_SECRETS, onGetSecrets],
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
