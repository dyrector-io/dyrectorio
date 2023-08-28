import { defaultWsErrorHandler } from '@app/errors'
import WebSocketClient from '@app/websockets/websocket-client'
import useTranslation from 'next-translate/useTranslation'
import React, { useEffect, useState } from 'react'

interface WebSocketContextInterface {
  client: WebSocketClient
}

export const WebSocketContext = React.createContext<WebSocketContextInterface>({ client: null })

export const WebSocketProvider = (props: React.PropsWithChildren<{}>) => {
  const { children } = props

  const { t } = useTranslation('common')

  const [wsClient, setWsClient] = useState(null)

  useEffect(() => {
    console.debug('Creating WS')

    const client = new WebSocketClient()

    const wsErrorHandler = defaultWsErrorHandler(t)
    client.setErrorHandler(msg => wsErrorHandler(msg))

    setWsClient(client)
  }, [])

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  return <WebSocketContext.Provider value={{ client: wsClient }}>{children}</WebSocketContext.Provider>
}
