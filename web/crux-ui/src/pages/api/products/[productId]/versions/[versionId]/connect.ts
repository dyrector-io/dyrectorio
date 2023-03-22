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
  PatchVersionImage,
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
import { fetchCruxFromRequest } from '@app/utils'
import { WsMessage } from '@app/websockets/common'
import WsConnection from '@app/websockets/connection'
import WsEndpoint from '@app/websockets/endpoint'
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
    await fetchCruxFromRequest(req, versionApiUrl(productId, versionId))
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
  const productId = endpoint.query.productId as string
  const versionId = endpoint.query.versionId as string

  const image = await fetchCruxFromRequest(connection.request, imageApiUrl(productId, versionId, req.id))

  connection.send(WS_TYPE_IMAGE, (await image.json()) as ImageMessage)
}

const onAddImages = async (endpoint: WsEndpoint, connection: WsConnection, message: WsMessage<AddImagesMessage>) => {
  const req = message.payload
  const productId = endpoint.query.productId as string
  const versionId = endpoint.query.versionId as string

  const images = await fetchCruxFromRequest(connection.request, versionImagesApiUrl(productId, versionId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.registryImages),
  })

  endpoint.sendAll(WS_TYPE_IMAGES_ADDED, {
    images: await images.json(),
  } as ImagesAddedMessage)
}

const onDeleteImage = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<DeleteImageMessage>,
) => {
  const editors = endpoint.services.get(EditorService)

  const req = message.payload
  const productId = endpoint.query.productId as string
  const versionId = endpoint.query.versionId as string

  await fetchCruxFromRequest(connection.request, imageApiUrl(productId, versionId, req.imageId), {
    method: 'DELETE',
  })

  editors.onDeleteItem(req.imageId)

  endpoint.sendAll(WS_TYPE_IMAGE_DELETED, {
    imageId: req.imageId,
  } as ImageDeletedMessage)
}

const onPatchImage = async (endpoint: WsEndpoint, connection: WsConnection, message: WsMessage<PatchImageMessage>) => {
  const req = message.payload
  const productId = endpoint.query.productId as string
  const versionId = endpoint.query.versionId as string

  let cruxReq: Pick<PatchVersionImage, 'tag' | 'config'> = {}

  if (req.resetSection) {
    cruxReq.config = {}
    cruxReq.config[req.resetSection as string] = null
  } else {
    cruxReq = req
  }

  await fetchCruxFromRequest(connection.request, imageApiUrl(productId, versionId, req.id), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cruxReq),
  })

  connection.send(WS_TYPE_PATCH_RECEIVED, {})

  endpoint.sendAllExcept(connection, WS_TYPE_IMAGE_UPDATED, {
    ...req,
  } as ImageUpdateMessage)
}

const onOrderImages = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<OrderImagesMessage>,
) => {
  const req = message.payload
  const productId = endpoint.query.productId as string
  const versionId = endpoint.query.versionId as string

  await fetchCruxFromRequest(connection.request, versionImagesOrderApiUrl(productId, versionId), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })

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
