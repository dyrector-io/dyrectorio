import { WsMessage } from '@app/websockets/common'
import { Page, WebSocket } from 'playwright'

export const waitSocket = (page: Page) => page.waitForEvent('websocket', it => it.url().endsWith('/api/new'))

export const waitSocketReceived = (
  ws: WebSocket,
  route: string,
  type: string = null,
  match: (data: any) => boolean = null,
) =>
  ws.waitForEvent(
    'framereceived',
    !type && !match
      ? undefined
      : (data: { payload: string }) => {
          const message: WsMessage = JSON.parse(data.payload as string)

          if (type && message.type !== `${route}/${type}`) {
            return false
          }

          if (match) {
            return match(message.data)
          }

          return true
        },
  )

export const waitSocketSent = (
  ws: WebSocket,
  route: string,
  type: string = null,
  match: (data: any) => boolean = null,
) =>
  ws.waitForEvent(
    'framesent',
    !type
      ? undefined
      : data => {
          const message: WsMessage = JSON.parse(data.payload as string)

          if (type && message.type !== `${route}/${type}`) {
            return false
          }

          if (match) {
            return match(message.data)
          }

          return true
        },
  )
