import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common'
import { WebSocketExceptionOptions, convertHttpExceptionToWsExceptionOptions } from 'src/exception/websocket-exception'
import { WS_TYPE_ERROR, WsClient, WsMessage } from 'src/websockets/common'
import CruxExceptionFilter from './crux.exception-filter'

@Catch()
export default class WsExceptionFilter extends CruxExceptionFilter {
  constructor() {
    super(new Logger(WsExceptionFilter.name))
  }

  protected handleHttpException(exception: HttpException, host: ArgumentsHost) {
    const res = exception.getResponse()
    this.logger.error(`${exception.getStatus()} ${typeof res === 'object' ? JSON.stringify(res) : res}`)

    const contextType = host.getType()
    if (contextType === 'ws') {
      const ctx = host.switchToWs()
      const client: WsClient = ctx.getClient()

      const message: WsMessage<WebSocketExceptionOptions> = {
        type: WS_TYPE_ERROR,
        data: convertHttpExceptionToWsExceptionOptions(exception),
      }

      client.sendWsMessage(message)
      return
    }

    this.logger.error(`DyoExceptionFilter was executed on a ${contextType} context`)
    throw Error('Invalid context.')
  }
}
