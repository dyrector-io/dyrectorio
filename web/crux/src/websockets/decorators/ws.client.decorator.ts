import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { WsClient } from '../common'

const SocketClient = createParamDecorator(
  (_: unknown, context: ExecutionContext): WsClient => context.switchToWs().getClient(),
)

export default SocketClient
