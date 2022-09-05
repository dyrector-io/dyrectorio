import { WebSocketContext } from '@app/providers/websocket'
import { WebSocketClientOptions } from '@app/websockets/common'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import { useContext, useEffect, useRef, useState } from 'react'

const useWebSocket = (route: string, options?: WebSocketClientOptions): WebSocketClientEndpoint => {
  const wsContext = useContext(WebSocketContext)

  const [readyState, setReadyState] = useState<number>(null)
  const endpointRef = useRef(new WebSocketClientEndpoint(route))
  const endpoint = endpointRef.current

  const destructCallback = useRef<VoidFunction>(() => {
    setReadyState(undefined)

    if (wsContext.client) {
      wsContext.client.remove(endpoint.url, this)
      endpoint.kill()
    }
  })

  endpoint.setup(setReadyState, options)

  useEffect(() => destructCallback.current, [])

  useEffect(() => {
    if (!wsContext.client) {
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

export default useWebSocket
