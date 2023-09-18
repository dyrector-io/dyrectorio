import { defaultWsErrorHandler } from '@app/errors'
import { isServerSide } from '@app/utils'
import WebSocketClient from '@app/websockets/websocket-client'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

interface WebSocketContextInterface {
  client: WebSocketClient
}

export const WebSocketContext = React.createContext<WebSocketContextInterface>({ client: null })

export const WebSocketProvider = (props: React.PropsWithChildren<{}>) => {
  const { children } = props

  const { t } = useTranslation('common')
  const router = useRouter()

  const [wsClient] = useState(() => {
    if (isServerSide()) {
      return null
    }

    const client = new WebSocketClient()

    const wsErrorHandler = defaultWsErrorHandler(t, router)
    client.setErrorHandler(wsErrorHandler)

    return client
  })

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  return <WebSocketContext.Provider value={{ client: wsClient }}>{children}</WebSocketContext.Provider>
}
