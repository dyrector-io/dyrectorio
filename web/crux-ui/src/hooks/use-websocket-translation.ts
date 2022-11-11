import { defaultWsErrorHandler } from '@app/errors'
import { WebSocketContext } from '@app/providers/websocket'
import { Translate } from 'next-translate'
import useTranslation from 'next-translate/useTranslation'
import { useContext, useEffect } from 'react'

const useWebsocketTranslate = (t: Translate) => {
  const wsContext = useContext(WebSocketContext)
  const { t: defaultTranslate } = useTranslation()

  useEffect(() => {
    wsContext.client.setErrorHandler(msg => defaultWsErrorHandler(t)(msg))
    return () => {
      wsContext.client.setErrorHandler(msg => defaultWsErrorHandler(defaultTranslate)(msg))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export default useWebsocketTranslate
