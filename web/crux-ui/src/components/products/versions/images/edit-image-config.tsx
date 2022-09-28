import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { DyoInput } from '@app/elements/dyo-input'
import { useThrottling } from '@app/hooks/use-throttleing'
import { ContainerConfig, Environment, InstanceContainerConfig, Secrets } from '@app/models'

import SecretKeyOnlyInput from '@app/components/shared/secret-key-input'
import { sensitiveKeyRule } from '@app/validations/container'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useRef, useState } from 'react'
import KeyValueInput from '../../../shared/key-value-input'

interface EditImageConfigProps {
  disabled?: boolean
  disabledContainerNameEditing?: boolean
  config: ContainerConfig | InstanceContainerConfig
  onPatch: (config: Partial<ContainerConfig | InstanceContainerConfig>) => void
}

const EditImageConfig = (props: EditImageConfigProps) => {
  const { config, disabled, disabledContainerNameEditing, onPatch } = props

  const { t } = useTranslation('images')

  const patch = useRef<Partial<ContainerConfig>>({})
  const [containerName, setContainerName] = useState(config?.name)

  const throttle = useThrottling(IMAGE_WS_REQUEST_DELAY)

  const sendPatch = (cfg: Partial<ContainerConfig>) => {
    const newPatch = {
      ...patch.current,
      ...cfg,
    }
    patch.current = newPatch

    throttle(() => {
      onPatch(patch.current)

      patch.current = {}
    })
  }

  const onEnvChange = (environment: Environment) =>
    sendPatch({
      environment,
    })

  const onSecretSubmit = (secrets: Secrets) => {
    sendPatch({
      secrets,
    })
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
          labelClassName="mt-2 mb-2.5"
          className="mb-4"
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
      <SecretKeyOnlyInput
        disabled={disabled}
        heading={t('secrets').toUpperCase()}
        items={config.secrets ?? []}
        onSubmit={onSecretSubmit}
      />
    </>
  )
}

export default EditImageConfig
