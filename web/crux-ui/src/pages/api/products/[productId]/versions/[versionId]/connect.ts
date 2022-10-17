import { Logger } from '@app/logger'
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
} from '@app/models'
import { WsMessage } from '@app/websockets/common'
import WsConnection from '@app/websockets/connection'
import WsEndpoint from '@app/websockets/endpoint'
import crux, { cruxFromConnection } from '@server/crux/crux'
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
  const versionId = endpoint.query.versionId as string

  try {
    await crux(req).versions.getById(versionId)
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

const onGetImage = async (endpoint: WsEndpoint, connection: WsConnection, message: WsMessage<GetImageMessage>) => {
  const req = message.payload

  const image = await cruxFromConnection(connection).images.getById(req.id)
  connection.send(WS_TYPE_IMAGE, image as ImageMessage)
}

const onAddImages = async (endpoint: WsEndpoint, connection: WsConnection, message: WsMessage<AddImagesMessage>) => {
  const versionId = endpoint.query.versionId as string

  const req = message.payload

  const images = await cruxFromConnection(connection).images.addImagesToVersion(versionId, req.registryImages)

  endpoint.sendAll(WS_TYPE_IMAGES_ADDED, {
    images,
  } as ImagesAddedMessage)
}

const onDeleteImage = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<DeleteImageMessage>,
) => {
  const editors = endpoint.services.get(EditorService)

  const req = message.payload

  await cruxFromConnection(connection).images.deleteImage(req.imageId)

  editors.onDeleteItem(req.imageId)

  endpoint.sendAll(WS_TYPE_IMAGE_DELETED, {
    imageId: req.imageId,
  } as ImageDeletedMessage)
}

const onPatchImage = async (endpoint: WsEndpoint, connection: WsConnection, message: WsMessage<PatchImageMessage>) => {
  const req = message.payload

  await cruxFromConnection(connection).images.patchImage(req.id, req)

  endpoint.sendAll(WS_TYPE_IMAGE_UPDATED, {
    ...req,
  } as ImageUpdateMessage)
}

const onOrderImages = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<OrderImagesMessage>,
) => {
  const req = message.payload

  const versionId = endpoint.query.versionId as string

  await cruxFromConnection(connection).images.orderImages(versionId, req)

  endpoint.sendAllExcept(connection, WS_TYPE_IMAGES_WERE_REORDERED, req as ImagesWereReorderedMessage)
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
    [WS_TYPE_GET_IMAGE, onGetImage],
    [WS_TYPE_ADD_IMAGES, onAddImages],
    [WS_TYPE_DELETE_IMAGE, onDeleteImage],
    [WS_TYPE_PATCH_IMAGE, onPatchImage],
    [WS_TYPE_ORDER_IMAGES, onOrderImages],
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
