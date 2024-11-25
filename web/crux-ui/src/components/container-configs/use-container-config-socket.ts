import useTeamRoutes from '@app/hooks/use-team-routes'
import useWebSocket from '@app/hooks/use-websocket'
import { ConfigUpdatedMessage, WS_TYPE_CONFIG_UPDATED, WS_TYPE_PATCH_CONFIG, WS_TYPE_PATCH_RECEIVED } from '@app/models'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import { useCallback } from 'react'
import { ContainerConfigDispatch, patchConfig, setSaveState } from './use-container-config-state'

const useContainerConfigSocket = (configId: string, dispatch: ContainerConfigDispatch): WebSocketClientEndpoint => {
  const routes = useTeamRoutes()

  const sock = useWebSocket(routes.containerConfig.detailsSocket(configId), {
    onOpen: () => dispatch(setSaveState('connected')),
    onClose: () => dispatch(setSaveState('disconnected')),
    onSend: message => {
      if (message.type === WS_TYPE_PATCH_CONFIG) {
        dispatch(setSaveState('saving'))
      }
    },
    onReceive: message => {
      if (message.type === WS_TYPE_PATCH_RECEIVED) {
        dispatch(setSaveState('saved'))
      }
    },
  })

  const onConfigUpdated = useCallback(
    (config: ConfigUpdatedMessage) => {
      dispatch(patchConfig(config))
    },
    [dispatch],
  )

  sock.on(WS_TYPE_CONFIG_UPDATED, onConfigUpdated)

  return sock
}

export default useContainerConfigSocket
