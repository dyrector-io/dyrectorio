import { DyoConfirmationModalConfig } from '@app/elements/dyo-modal'
import { useState } from 'react'

export type DyoConfirmationModalConfigOverride = Omit<DyoConfirmationModalConfig, 'onClose'>
export type DyoConfirmationAction = (overridenConfig: DyoConfirmationModalConfigOverride) => Promise<boolean>

const useConfirmation = (): [DyoConfirmationModalConfig, DyoConfirmationAction] => {
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
