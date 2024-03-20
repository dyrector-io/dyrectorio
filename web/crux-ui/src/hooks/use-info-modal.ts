import { DyoInfoModalConfig } from '@app/elements/dyo-modal'
import { useCallback, useState } from 'react'

export type DyoInfoModalConfigOptions = Omit<DyoInfoModalConfig, 'onClose'>
export type DyoInfoModalAction = (config: DyoInfoModalConfigOptions) => void

const useInfoModal = (): [DyoInfoModalConfig, DyoInfoModalAction] => {
  const [config, setConfig] = useState<DyoInfoModalConfig>(null)

  const close = useCallback(() => setConfig(null), [])

  const show = useCallback<DyoInfoModalAction>(
    (options: DyoInfoModalConfigOptions) => {
      setConfig({
        ...options,
        onClose: close,
      })
    },
    [close],
  )

  return [config, show]
}

export default useInfoModal
