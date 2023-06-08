import { WS_TYPE_PATCH_IMAGE, WS_TYPE_PATCH_RECEIVED } from '@app/models'
import { WsMessage } from '@app/websockets/common'
// eslint-disable-next-line import/no-extraneous-dependencies
import { Page, WebSocket } from 'playwright'

export const waitSocket = (page: Page) => page.waitForEvent('websocket', it => it.url().endsWith('/api'))

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

export const wsPatchSent = async (ws: WebSocket, route: string, match: (payload: any) => boolean = null) => {
  const frameReceived = waitSocketReceived(ws, route, WS_TYPE_PATCH_RECEIVED)

  await waitSocketSent(ws, route, WS_TYPE_PATCH_IMAGE, match)

  await frameReceived
}
