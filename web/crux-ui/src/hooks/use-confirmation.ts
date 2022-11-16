import { DyoConfirmationModalConfig } from '@app/elements/dyo-modal'
import { useState } from 'react'

type DyoConfirmationModalConfigOverride = Omit<DyoConfirmationModalConfig, 'onClose'>

const useConfirmation = (): [
  DyoConfirmationModalConfig,
  (onConfirmed?: VoidFunction, overridenConfig?: DyoConfirmationModalConfigOverride) => Promise<boolean>,
] => {
  const [config, setConfig] = useState<DyoConfirmationModalConfig>(null)

  const confirm = (
    onConfirmed?: VoidFunction,
    overridenConfig?: DyoConfirmationModalConfigOverride,
  ): Promise<boolean> =>
    new Promise(resolve => {
      const onClose = (confirmed: boolean) => {
        setConfig(null)

        if (confirmed && onConfirmed) {
          onConfirmed()
        }

        resolve(confirmed)
      }

      setConfig({
        ...overridenConfig,
        onClose,
      })
    })

  return [config, confirm]
}

export default useConfirmation
