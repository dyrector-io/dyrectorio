import { internalError } from '@app/error-responses'
import { DyoApiError, WS_TYPE_DYO_ERROR } from '@app/models'
import { isDyoApiError } from '@app/utils'
import { WsMessage } from '@app/websockets/common'
import WsConnection from '@app/websockets/connection'
import WsEndpoint from '@app/websockets/endpoint'
import { Logger } from '../logger'

const useWebsocketErrorMiddleware = async (
  logger: Logger,
  endpoint: WsEndpoint,
  connection: WsConnection,
  message: WsMessage<object>,
  next: () => Promise<void>,
): Promise<void> => {
  try {
    await next()
  } catch (error) {
    if (isDyoApiError(e) && e.status < 500) {
      const error = e as DyoApiError
      connection.send(WS_TYPE_DYO_ERROR, error)
    } else {
      logger.error('Internal Server Error: ', e)
      connection.send(WS_TYPE_DYO_ERROR, internalError('Internal error.'))
    }
  }
}

export default useWebsocketErrorMiddleware
