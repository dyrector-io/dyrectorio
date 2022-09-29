import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { DyoInput } from '@app/elements/dyo-input'
import { useThrottling } from '@app/hooks/use-throttleing'
import { ContainerConfig, UniqueKeyValue } from '@app/models'

import KeyValueInput from '@app/components/shared/key-value-input'
import SecretKeyValInput from '@app/components/shared/secret-key-value-input'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useRef, useState } from 'react'

interface EditInstanceProps {
  disabled?: boolean
  disabledContainerNameEditing?: boolean
  publicKey?: string
  config: ContainerConfig
  onPatch: (config: Partial<ContainerConfig>) => void
}

const EditInstanceConfig = (props: EditInstanceProps) => {
  const { config, disabled, disabledContainerNameEditing, publicKey, onPatch } = props

  const { t } = useTranslation('images')

  const patch = useRef<Partial<ContainerConfig>>({})
  const [containerName, setContainerName] = useState(config?.name)

  const throttle = useThrottling(IMAGE_WS_REQUEST_DELAY)

  const sendPatch = (configPartial: Partial<ContainerConfig>, immediate?: boolean) => {
    const newPatch = {
      ...patch.current,
      ...configPartial,
    }
    patch.current = newPatch

    if (immediate) {
      onPatch(patch.current)
      patch.current = {}
    } else {
      throttle(() => {
        onPatch(patch.current)
        patch.current = {}
      })
    }
  }

  const onEnvChange = (environments: UniqueKeyValue[]) =>
    sendPatch({
      environments: environments,
    })

  const onSecretSubmit = (secrets: UniqueKeyValue[]) => {
    sendPatch(
      {
        secrets: secrets,
      },
      true,
    )
  }

  const onContainerNameChange = (name: string) => {
    setContainerName(name)

    sendPatch({
      ...patch.current,
      name: name,
    })
  }

  useEffect(() => setContainerName(config?.name), [config])

  return (
    <>
      {disabledContainerNameEditing ? null : (
        <DyoInput
          disabled={disabled}
          label={t('containerName').toUpperCase()}
          value={containerName}
          onChange={ev => onContainerNameChange(ev.target.value)}
        />
      )}
      <KeyValueInput
        disabled={disabled}
        label={t('environment').toUpperCase()}
        items={config.environments ?? []}
        onChange={onEnvChange}
      />
      <SecretKeyValInput
        disabled={disabled || !publicKey}
        heading={t('secrets').toUpperCase()}
        publicKey={publicKey}
        items={(config.secrets as UniqueKeyValue[]) ?? []}
        onSubmit={onSecretSubmit}
      />
    </>
  )
}

export default EditInstanceConfig
