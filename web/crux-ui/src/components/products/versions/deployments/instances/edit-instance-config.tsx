import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { DyoInput } from '@app/elements/dyo-input'
import { useThrottling } from '@app/hooks/use-throttleing'
import { Environment, InstanceContainerConfig, UniqueKeyValue } from '@app/models'

import KeyValueInput from '@app/components/shared/key-value-input'
import SecretKeyValInput from '@app/components/shared/secret-key-value-input'
import { sensitiveKeyRule } from '@app/validations/container'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useRef, useState } from 'react'

interface EditInstanceProps {
  disabled?: boolean
  disabledContainerNameEditing?: boolean
  publicKey?: string
  config: InstanceContainerConfig
  onPatch: (config: Partial<InstanceContainerConfig>) => void
}

const EditInstanceConfig = (props: EditInstanceProps) => {
  const { config, disabled, disabledContainerNameEditing, publicKey, onPatch } = props

  const { t } = useTranslation('images')

  const patch = useRef<Partial<InstanceContainerConfig>>({})
  const [containerName, setContainerName] = useState(config?.name)

  const throttle = useThrottling(IMAGE_WS_REQUEST_DELAY)

  const sendPatch = (configPartial: Partial<InstanceContainerConfig>, immediate?: boolean) => {
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

  const onEnvChange = (environment: Environment) =>
    sendPatch({
      environment,
    })

  const onSecretSubmit = (secrets: UniqueKeyValue[]) => {
    sendPatch(
      {
        secrets,
      },
      true,
    )
  }

  const onContainerNameChange = (name: string) => {
    setContainerName(name)

    sendPatch({
      name,
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
        heading={t('environment').toUpperCase()}
        items={config?.environment ?? []}
        onChange={onEnvChange}
        hint={{ hintValidation: sensitiveKeyRule, hintText: t('sensitiveKey') }}
      />
      <SecretKeyValInput
        disabled={disabled || !publicKey}
        heading={t('secrets').toUpperCase()}
        publicKey={publicKey}
        items={config.secrets ?? []}
        onSubmit={onSecretSubmit}
      />
    </>
  )
}

export default EditInstanceConfig
