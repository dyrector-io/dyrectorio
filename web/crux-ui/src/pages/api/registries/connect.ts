import { IMAGE_FILTER_TAKE } from '@app/const'
import { Logger } from '@app/logger'
import {
  FetchImageTagsMessage,
  FindImageMessage,
  FindImageResultMessage,
  RegistryImageTagsMessage,
  WS_TYPE_FIND_IMAGE,
  WS_TYPE_FIND_IMAGE_RESULT,
  WS_TYPE_REGISTRY_FETCH_IMAGE_TAGS,
  WS_TYPE_REGISTRY_IMAGE_TAGS,
} from '@app/models'
import { WsMessage } from '@app/websockets/common'
import WsConnection from '@app/websockets/connection'
import WsEndpoint from '@app/websockets/endpoint'
import { cruxFromConnection } from '@server/crux/crux'
import registryConnections from '@server/registry-api/registry-connections'
import { routedWebSocketEndpoint } from '@server/websocket-endpoint'
import useWebsocketErrorMiddleware from '@server/websocket-error-middleware'

const logger = new Logger('ws-registries')

const onDisconnect = (endpoint: WsEndpoint, connection: WsConnection): void => {
  registryConnections.resetAuthorization(connection.identity)
}

const onFindImage = async (endpoint: WsEndpoint, connection: WsConnection, message: WsMessage<FindImageMessage>) => {
  const req = message.data

  const registry = await registryConnections.getByRegistryId(
    req.registryId,
    cruxFromConnection(connection).registryConnectionsServices,
  )

  const images = await registry.catalog(req.filter, IMAGE_FILTER_TAKE)
  connection.send(WS_TYPE_FIND_IMAGE_RESULT, {
    registryId: req.registryId,
    images: images.map(it => ({
      id: '',
      name: it,
      tags: 0,
    })),
  } as FindImageResultMessage)
}

const onFetchImageTags = async (
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<FetchImageTagsMessage>,
) => {
  const req = message.data

  const registry = await registryConnections.getByRegistryId(
    req.registryId,
    cruxFromConnection(connection).registryConnectionsServices,
  )

  const tags = req.images.map(it => registry.tags(it))
  connection.send(WS_TYPE_REGISTRY_IMAGE_TAGS, {
    registryId: req.registryId,
    images: await Promise.all(tags),
  } as RegistryImageTagsMessage)
}

export default routedWebSocketEndpoint(
  logger,
  [
    [WS_TYPE_FIND_IMAGE, onFindImage],
    [WS_TYPE_REGISTRY_FETCH_IMAGE_TAGS, onFetchImageTags],
  ],
  [useWebsocketErrorMiddleware],
  {
    onDisconnect,
  },
)
