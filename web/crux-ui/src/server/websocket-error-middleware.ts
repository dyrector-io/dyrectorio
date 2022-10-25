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
  } catch (err) {
    if (isDyoApiError(err) && err.status < 500) {
      const error = err as DyoApiError
      connection.send(WS_TYPE_DYO_ERROR, error)
    } else {
      logger.error('Internal Server Error: ', err)
      connection.send(WS_TYPE_DYO_ERROR, internalError('Internal error.'))
    }
  }
}

export default useWebsocketErrorMiddleware
