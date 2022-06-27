import { Logger } from '@app/logger'
import {
  AddImagesMessage,
  DeleteImageMessage,
  GetImageMessage,
  ImageDeletedMessage,
  ImageMessage,
  ImagesAddedMessage,
  ImagesWereReorderedMessage,
  ImageUpdateMessage,
  OrderImagesMessage,
  PatchImageMessage,
  WS_TYPE_ADD_IMAGES,
  WS_TYPE_DELETE_IMAGE,
  WS_TYPE_GET_IMAGE,
  WS_TYPE_IMAGE,
  WS_TYPE_IMAGES_ADDED,
  WS_TYPE_IMAGES_WERE_REORDERED,
  WS_TYPE_IMAGE_DELETED,
  WS_TYPE_IMAGE_UPDATED,
  WS_TYPE_ORDER_IMAGES,
  WS_TYPE_PATCH_IMAGE,
} from '@app/models'
import { WsMessage } from '@app/websockets/common'
import { WsConnection, WsEndpoint } from '@app/websockets/server'
import crux, { cruxFromConnection } from '@server/crux/crux'
import { routedWebSocketEndpoint } from '@server/websocket-endpoint'
import { useWebsocketErrorMiddleware } from '@server/websocket-error-middleware'
import { NextApiRequest } from 'next'

const logger = new Logger('ws-version')

const onAuthorize = async (endpoint: WsEndpoint, req: NextApiRequest): Promise<boolean> => {
  const versionId = endpoint.query.versionId as string

  try {
    await crux(req).versions.getById(versionId)
    return true
  } catch {
    return false
  }
}

const onGetImage = async (endpoint: WsEndpoint, connection: WsConnection, message: WsMessage<GetImageMessage>) => {
  const req = message.payload

  const image = await cruxFromConnection(connection).images.getById(req.id)
  connection.send(WS_TYPE_IMAGE, image as ImageMessage)
}

const onAddImages = async (endpoint: WsEndpoint, connection: WsConnection, message: WsMessage<AddImagesMessage>) => {
  const versionId = endpoint.query.versionId as string

  const req = message.payload

  const images = await cruxFromConnection(connection).images.addImagesToVersion(versionId, req.registryId, req.images)

  endpoint.sendAll(WS_TYPE_IMAGES_ADDED, {
    images,
  } as ImagesAddedMessage)
}

const onDeleteImage = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<DeleteImageMessage>,
) => {
  const req = message.payload

  await cruxFromConnection(connection).images.deleteImage(req.imageId)

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

  endpoint.sendAllExcept(WS_TYPE_IMAGES_WERE_REORDERED, req as ImagesWereReorderedMessage, connection)
}

export default routedWebSocketEndpoint(
  logger,
  [
    [WS_TYPE_GET_IMAGE, onGetImage],
    [WS_TYPE_ADD_IMAGES, onAddImages],
    [WS_TYPE_DELETE_IMAGE, onDeleteImage],
    [WS_TYPE_PATCH_IMAGE, onPatchImage],
    [WS_TYPE_ORDER_IMAGES, onOrderImages],
  ],
  [useWebsocketErrorMiddleware],
  {
    onAuthorize,
  },
)
