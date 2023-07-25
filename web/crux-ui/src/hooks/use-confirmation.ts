import { DyoConfirmationModalConfig } from '@app/elements/dyo-modal'
import { useState } from 'react'

type DyoConfirmationModalConfigOverride = Omit<DyoConfirmationModalConfig, 'onClose'>

const useConfirmation = (): [
  DyoConfirmationModalConfig,
  (overridenConfig: DyoConfirmationModalConfigOverride) => Promise<boolean>,
] => {
  const [config, setConfig] = useState<DyoConfirmationModalConfig>(null)

  const confirm = (overridenConfig: DyoConfirmationModalConfigOverride): Promise<boolean> =>
    new Promise(resolve => {
      const onClose = (confirmed: boolean) => {
        setConfig(null)
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
