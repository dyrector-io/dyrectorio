import { defaultWsErrorHandler } from '@app/errors'
import { WebSocketContext } from '@app/providers/websocket'
import { Translate } from 'next-translate'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useContext, useEffect } from 'react'

const useWebsocketTranslate = (t: Translate) => {
  const wsContext = useContext(WebSocketContext)
  const router = useRouter()
  const { t: defaultTranslate } = useTranslation('common')

  useEffect(() => {
    if (wsContext.client) {
      wsContext.client.setErrorHandler(defaultWsErrorHandler(t, router))
    }
    return () => {
      if (wsContext.client) {
        wsContext.client.setErrorHandler(defaultWsErrorHandler(defaultTranslate, router))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsContext.client])
}

export default useWebsocketTranslate
