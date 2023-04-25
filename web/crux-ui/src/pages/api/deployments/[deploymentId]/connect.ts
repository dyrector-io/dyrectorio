/*import { Logger } from '@app/logger'
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
import { WsMessage } from '@app/websockets/common'
import WsConnection from '@app/websockets/connection'
import WsEndpoint from '@app/websockets/endpoint'
import { getCrux, patchCrux } from '@server/crux-api'
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
    onMessage: message => endpoint.sendAll(message.type, message.data),
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

const onFocusInput = async (endpoint: WsEndpoint, connection: WsConnection, message: WsMessage<InputFocusMessage>) => {
  const { token } = connection
  const editors = endpoint.services.get(EditorService)

  const res = editors.onFocus(token, message.data)

  endpoint.sendAllExcept(connection, WS_TYPE_INPUT_FOCUSED, res)
}

const onBlurInput = async (endpoint: WsEndpoint, connection: WsConnection, message: WsMessage<InputFocusMessage>) => {
  const { token } = connection
  const editors = endpoint.services.get(EditorService)

  const res = editors.onBlur(token, message.data)
  if (!res) {
    return
  }

  endpoint.sendAllExcept(connection, WS_TYPE_INPUT_BLURED, res)
}

export default routedWebSocketEndpoint(
  logger,
  [
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
)*/
