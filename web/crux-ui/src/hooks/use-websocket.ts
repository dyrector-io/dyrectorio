import { WebSocketClient, WebSocketClientOptions, WebSocketEndpoint } from '@app/websockets/client'
import { useEffect, useState } from 'react'

let client: WebSocketClient

export const useWebSocket = (route: string, options?: WebSocketClientOptions): WebSocketEndpoint => {
  if (typeof window !== 'undefined' && !client) {
    client = new WebSocketClient()
  }

  const [readyState, setReadyState] = useState<number>()
  const [endpoint, _] = useState(new WebSocketEndpoint(route))

  endpoint.setup(setReadyState, options)

  const destruct = () => {
    setReadyState(undefined)
    endpoint.close()
  }

  useEffect(() => {
    if (!readyState) {
      setReadyState(WebSocket.CLOSED)
    }

    return destruct
  }, [])

  useEffect(() => {
    if (readyState === WebSocket.CLOSED) {
      destruct()

      client.register(route, endpoint)
    }
  }, [readyState])

  return endpoint
}
