import { WS_PATCH_DELAY } from '@app/const'
import { CANCEL_THROTTLE, useThrottling } from '@app/hooks/use-throttleing'
import { ContainerConfigData, PatchConfigMessage, WS_TYPE_PATCH_CONFIG } from '@app/models'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import { useCallback, useRef } from 'react'
import { ContainerConfigDispatch, patchConfig, resetSection } from './use-container-config-state'

type PatchConfig = (config: PatchConfigMessage) => void

const usePatchContainerConfig = (
  sock: WebSocketClientEndpoint,
  dispatch: ContainerConfigDispatch,
): [PatchConfig, VoidFunction] => {
  const configPatches = useRef<ContainerConfigData>({})

  const throttle = useThrottling(WS_PATCH_DELAY)

  const wsSend = sock.send

  const patchCallback = useCallback(
    (patch: PatchConfigMessage) => {
      if (patch.resetSection) {
        dispatch(resetSection(patch.resetSection))
        wsSend(WS_TYPE_PATCH_CONFIG, patch)
        return
      }

      configPatches.current = {
        ...configPatches.current,
        ...patch.config,
      }

      dispatch(patchConfig(patch.config))

      throttle(() => {
        const wsPatch: PatchConfigMessage = {
          config: configPatches.current,
        }

        wsSend(WS_TYPE_PATCH_CONFIG, wsPatch)
      })
    },
    [wsSend, throttle, dispatch],
  )

  const cancelThrottle = useCallback(() => {
    throttle(CANCEL_THROTTLE)
    configPatches.current = {}
  }, [throttle])

  return [patchCallback, cancelThrottle]
}

export default usePatchContainerConfig
