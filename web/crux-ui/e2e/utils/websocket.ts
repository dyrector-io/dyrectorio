import { WS_TYPE_PATCH_RECEIVED } from '@app/models'
import { WsMessage } from '@app/websockets/common'
// eslint-disable-next-line import/no-extraneous-dependencies
import { Page, WebSocket } from 'playwright'

const DEBUG = !!process.env.REQUESTTHROTTLE

export type WebSocketRef = {
  current?: WebSocket
}

/**
 * Waits for the first WebSocket of the page, then updates the ref
 * each time the socket changes.
 */
export const waitSocketRef = (page: Page): Promise<WebSocketRef> => {
  return new Promise<WebSocketRef>(resolve => {
    const ref: WebSocketRef = {
      current: null,
    }

    page.on('websocket', it => {
      if (it.url().endsWith('/api')) {
        ref.current = it

        if (DEBUG) {
          it.on('close', it => {
            console.debug('Socket closed')
          })
          it.on('socketerror', err => {
            console.error(`Socket error ${err}`)
          })
        }

        resolve(ref)
      }
    })
  })
}

export const waitSocketReceived = (
  wsRef: WebSocketRef,
  route: string,
  type: string = null,
  match: (data: any) => boolean = null,
) => {
  const ws = wsRef.current
  if (!ws) {
    throw new Error('waitSocketReceived socket ref is null!')
  }

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
}

export const waitSocketSent = async (
  wsRef: WebSocketRef,
  route: string,
  type: string = null,
  match: (data: any) => boolean = null,
) => {
  const ws = wsRef.current
  if (!ws) {
    throw new Error('waitSocketSent socket ref is null!')
  }

  await ws.waitForEvent(
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
}

export const wsPatchSent = async (
  wsRef: WebSocketRef,
  route: string,
  sentWsType: string,
  match: (payload: any) => boolean = null,
) => {
  const frameReceived = waitSocketReceived(wsRef, route, WS_TYPE_PATCH_RECEIVED)

  await waitSocketSent(wsRef, route, sentWsType, match)

  await frameReceived
}
