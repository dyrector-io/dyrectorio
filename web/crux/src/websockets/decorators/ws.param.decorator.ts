import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { WsMessageWithParams } from '../common'
import { subscriptionOfContext } from './ws.subscription.decorator'

const WsParam = createParamDecorator((data: string, context: ExecutionContext): string => {
  const message: WsMessageWithParams = context.switchToWs().getData()
  if (!message) {
    return null
  }

  const { params } = message
  if (params) {
    return params[data]
  }

  const sub = subscriptionOfContext(context)
  return sub.getParameter(data)
})

export default WsParam
