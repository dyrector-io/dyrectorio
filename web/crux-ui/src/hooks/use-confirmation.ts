import { DyoConfirmationModalConfig } from '@app/elements/dyo-modal'
import { useState } from 'react'

const useConfirmation = (): [
  DyoConfirmationModalConfig,
  (onConfirmed: () => void, onCanceled?: () => void) => void,
] => {
  const [config, setConfig] = useState<DyoConfirmationModalConfig>(null)

  const confirm = (onConfirmed: () => void, onCanceled?: () => void) => {
    const onClose = confirmed => {
      setConfig(null)
      if (confirmed) {
        onConfirmed()
      } else {
        onCanceled?.call(null)
      }
    }

    setConfig({
      onClose,
    })
  }

  return [config, confirm]
}

export default useConfirmation
