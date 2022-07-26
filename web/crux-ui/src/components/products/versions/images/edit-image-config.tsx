import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { DyoInput } from '@app/elements/dyo-input'
import { useThrottleing } from '@app/hooks/use-throttleing'
import { ContainerConfig, Environment } from '@app/models'
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
  const { config, disabled, disabledContainerNameEditing } = props

  const { t } = useTranslation('images')

  const patch = useRef<Partial<ContainerConfig>>({})
  const [containerName, setContainerName] = useState(config?.name)

  const throttle = useThrottleing(IMAGE_WS_REQUEST_DELAY)

  const sendPatch = (config: Partial<ContainerConfig>) => {
    const newPatch = {
      ...patch.current,
      ...config,
    }
    patch.current = newPatch

    throttle(() => {
      props.onPatch(patch.current)

      patch.current = {}
    })
  }

  const onEnvChange = (environment: Environment) =>
    sendPatch({
      environment,
    })

  const onContainerNameChange = (name: string) => {
    setContainerName(name)

    sendPatch({
      name,
    })
  }

  useEffect(() => setContainerName(props.config?.name), [props.config])

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
      />
    </>
  )
}

export default EditImageConfig
