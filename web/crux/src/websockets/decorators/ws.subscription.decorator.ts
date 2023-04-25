import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import {
  SubscriptionMessage,
  WS_TYPE_SUBSCRIBE,
  WS_TYPE_UNSUBSCRIBE,
  WsClient,
  WsMessage,
  WsSubscription,
  namespaceOf,
} from '../common'

export const subscriptionOfContext = (context: ExecutionContext): WsSubscription => {
  const wsContext = context.switchToWs()
  const client: WsClient = wsContext.getClient()
  const message: WsMessage = wsContext.getData()

  let namespace: string
  if (message.type === WS_TYPE_SUBSCRIBE || message.type === WS_TYPE_UNSUBSCRIBE) {
    const subMsg: SubscriptionMessage = message.data
    namespace = subMsg.path
  } else {
    namespace = namespaceOf(message)
  }

  const sub = client.subscriptions.get(namespace)
  if (!sub) {
    throw new Error('Can not reference WsSubscription')
  }

  return sub
}

const SocketSubscription = createParamDecorator(
  (_: unknown, context: ExecutionContext): WsSubscription => subscriptionOfContext(context),
)

export default SocketSubscription
