/*import { Logger } from '@app/logger'
import {
  AddImagesMessage,
  DeleteImageMessage,
  EditorJoinedMessage,
  GetImageMessage,
  ImageDeletedMessage,
  ImageMessage,
  ImagesAddedMessage,
  ImagesWereReorderedMessage,
  ImageUpdateMessage,
  InputFocusMessage,
  OrderImagesMessage,
  PatchImageMessage,
  PatchVersionImage,
  RegistryImages,
  VersionDetails,
  VersionImage,
  WS_TYPE_ADD_IMAGES,
  WS_TYPE_ALL_ITEM_EDITORS,
  WS_TYPE_BLUR_INPUT,
  WS_TYPE_DELETE_IMAGE,
  WS_TYPE_EDITOR_IDENTITY,
  WS_TYPE_EDITOR_JOINED,
  WS_TYPE_EDITOR_LEFT,
  WS_TYPE_FOCUS_INPUT,
  WS_TYPE_GET_IMAGE,
  WS_TYPE_IMAGE,
  WS_TYPE_IMAGES_ADDED,
  WS_TYPE_IMAGES_WERE_REORDERED,
  WS_TYPE_IMAGE_DELETED,
  WS_TYPE_IMAGE_UPDATED,
  WS_TYPE_INPUT_BLURED,
  WS_TYPE_INPUT_FOCUSED,
  WS_TYPE_ORDER_IMAGES,
  WS_TYPE_PATCH_IMAGE,
  WS_TYPE_PATCH_RECEIVED,
} from '@app/models'
import { imageApiUrl, versionApiUrl, versionImagesApiUrl, versionImagesOrderApiUrl } from '@app/routes'
import { WsMessage } from '@app/websockets/common'
import WsConnection from '@app/websockets/connection'
import WsEndpoint from '@app/websockets/endpoint'
import { deleteCrux, getCrux, patchCrux, postCrux, putCrux } from '@server/crux-api'
import EditorService from '@server/editing/editor-service'
import { routedWebSocketEndpoint } from '@server/websocket-endpoint'
import useWebsocketErrorMiddleware from '@server/websocket-error-middleware'
import { NextApiRequest } from 'next'

const logger = new Logger('ws-version')

const onReady = async (endpoint: WsEndpoint): Promise<void> => {
  const { services } = endpoint
  services.register(EditorService, () => new EditorService())
}

const onAuthorize = async (endpoint: WsEndpoint, req: NextApiRequest): Promise<boolean> => {
  const productId = endpoint.query.productId as string
  const versionId = endpoint.query.versionId as string

  try {
    await getCrux<VersionDetails>(req, versionApiUrl(productId, versionId))
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
