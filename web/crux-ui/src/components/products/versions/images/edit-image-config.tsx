import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { DyoInput } from '@app/elements/dyo-input'
import { useThrottling } from '@app/hooks/use-throttleing'
import { ContainerConfig, UniqueKey } from '@app/models'

import KeyOnlyInput from '@app/components/shared/key-only-input'
import { UniqueKeyValue } from '@app/models/grpc/protobuf/proto/crux'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useRef, useState } from 'react'
import KeyValueInput from '../../../shared/key-value-input'

interface EditImageConfigProps {
  disabled?: boolean
  disabledContainerNameEditing?: boolean
  config: ContainerConfig
  onPatch: (config: Partial<ContainerConfig>) => void
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

  const onEnvChange = (environments: UniqueKeyValue[]) =>
    sendPatch({
      environments: environments,
    })

  const onSecretChange = (secrets: UniqueKey[]) => {
    sendPatch({
      secrets: secrets,
    })
  }

  const onContainerNameChange = (name: string) => {
    setContainerName(name)

    sendPatch({
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
          labelClassName="mt-2 mb-2.5"
          className="mb-4"
          value={containerName}
          onChange={ev => onContainerNameChange(ev.target.value)}
        />
      )}

      <KeyValueInput
        disabled={disabled}
        label={t('environment').toUpperCase()}
        items={config?.environments ?? []}
        onChange={onEnvChange}
      />

      <KeyOnlyInput
        disabled={disabled}
        label={t('secrets').toUpperCase()}
        items={config.secrets ?? []}
        keyPlaceholder={t('common:key')}
        description={t('common:cannotDefineSecretsHere')}
        onChange={onSecretChange}
      />
    </>
  )
}

export default EditImageConfig
