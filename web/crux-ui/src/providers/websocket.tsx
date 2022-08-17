import { defaultWsErrorHandler } from '@app/errors'
import { isServerSide } from '@app/utils'
import { WebSocketClient } from '@app/websockets/client'
import useTranslation from 'next-translate/useTranslation'
import React, { useState } from 'react'

interface WebSocketContextInterface {
  client: WebSocketClient
}

export const WebSocketContext = React.createContext<WebSocketContextInterface>({ client: null })

export const WebSocketProvider = (props: React.PropsWithChildren<{}>) => {
  const { t } = useTranslation()

  const [wsClient, _] = useState(() => {
    if (isServerSide()) {
      return null
    }

    const client = new WebSocketClient()

    const wsErrorHandler = defaultWsErrorHandler(t)
    client.setErrorHandler(msg => wsErrorHandler(msg))

    return client
  })

  return <WebSocketContext.Provider value={{ client: wsClient }}>{props.children}</WebSocketContext.Provider>
}
