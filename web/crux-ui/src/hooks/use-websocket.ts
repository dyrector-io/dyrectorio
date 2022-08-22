import { WebSocketContext } from '@app/providers/websocket'
import { WebSocketClientOptions, WebSocketEndpoint } from '@app/websockets/client'
import { useContext, useEffect, useRef, useState } from 'react'

export const useWebSocket = (route: string, options?: WebSocketClientOptions): WebSocketEndpoint => {
  const wsContext = useContext(WebSocketContext)

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
    if (wsContext.client == null) {
      return
    }

    if (!readyState) {
      wsContext.client.register(endpointRef.current)
    } else if (readyState === WebSocket.CLOSED) {
      destructCallback.current()

      wsContext.client.register(endpointRef.current)
    }
  }, [wsContext, readyState])

  return endpoint
}
