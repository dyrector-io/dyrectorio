import { isServerSide } from '@app/utils'
import { WebSocketClient, WebSocketClientOptions, WebSocketEndpoint } from '@app/websockets/client'
import { useEffect, useRef, useState } from 'react'

let client: WebSocketClient

export const useWebSocket = (route: string, options?: WebSocketClientOptions): WebSocketEndpoint => {
  if (!isServerSide() && !client) {
    client = new WebSocketClient()
  }

  const [readyState, setReadyState] = useState<number>(null)
  const endpointRef = useRef(new WebSocketEndpoint(route))
  const endpoint = endpointRef.current

  const destructCallback = useRef<VoidFunction>(() => {
    setReadyState(undefined)
    endpoint.close()
  })

  endpoint.setup(setReadyState, options)

  useEffect(() => destructCallback.current, [])

  useEffect(() => {
    if (!readyState) {
      client.register(endpointRef.current)
    } else if (readyState === WebSocket.CLOSED) {
      destructCallback.current()

      client.register(endpointRef.current)
    }
  }, [readyState])

  return endpoint
}
