import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { useThrottleing } from '@app/hooks/use-throttleing'
import { ContainerConfig, Environment } from '@app/models'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import KeyValueInput from '../../../shared/key-value-input'

interface EditImageConfigProps {
  disabled?: boolean
  id: string
  config: ContainerConfig
  onPatch: (id: string, config: ContainerConfig) => void
}

const EditImageConfig = (props: EditImageConfigProps) => {
  const { id, config, disabled } = props

  const { t } = useTranslation('images')

  const throttleEnv = useThrottleing(IMAGE_WS_REQUEST_DELAY)

  const onEnvChange = (env: Environment) =>
    throttleEnv(() => {
      props.onPatch(id, { environment: env })
    })

  return (
    <KeyValueInput
      disabled={disabled}
      heading={t('environment').toUpperCase()}
      items={config?.environment ?? []}
      onChange={onEnvChange}
    />
  )
}

export default EditImageConfig
