import { DyoConfirmationModalConfig } from '@app/elements/dyo-modal'
import { useState } from 'react'

type DyoConfirmationModalConfigOverride = Omit<DyoConfirmationModalConfig, 'onClose'> & {
  onCanceled?: () => void
}

const useConfirmation = (): [
  DyoConfirmationModalConfig,
  (onConfirmed: () => void, overridenConfig?: DyoConfirmationModalConfigOverride) => void,
] => {
  const [config, setConfig] = useState<DyoConfirmationModalConfig>(null)

  const confirm = (onConfirmed: () => void, overridenConfig?: DyoConfirmationModalConfigOverride) => {
    const onClose = confirmed => {
      setConfig(null)
      if (confirmed) {
        onConfirmed()
      } else {
        overridenConfig?.onCanceled?.call(null)
      }
    }

    setConfig({
      ...overridenConfig,
      onClose,
    })
  }

  return [config, confirm]
}

export default useConfirmation
