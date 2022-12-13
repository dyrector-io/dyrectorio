import { defaultWsErrorHandler } from '@app/errors'
import { isServerSide } from '@app/utils'
import WebSocketClient from '@app/websockets/websocket-client'
import useTranslation from 'next-translate/useTranslation'
import React, { useState } from 'react'

interface WebSocketContextInterface {
  client: WebSocketClient
}

export const WebSocketContext = React.createContext<WebSocketContextInterface>({ client: null })

export const WebSocketProvider = (props: React.PropsWithChildren<{}>) => {
  const { children } = props

  const { t } = useTranslation('common')

  const [wsClient] = useState(() => {
    if (isServerSide()) {
      return null
    }

    const client = new WebSocketClient()

    const wsErrorHandler = defaultWsErrorHandler(t)
    client.setErrorHandler(msg => wsErrorHandler(msg))

    return client
  })

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  return <WebSocketContext.Provider value={{ client: wsClient }}>{children}</WebSocketContext.Provider>
}
