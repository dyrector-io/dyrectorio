import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { useThrottling } from '@app/hooks/use-throttleing'
import { ContainerConfig, Environment, Secrets } from '@app/models'

import MultiInput from '@app/components/editor/multi-input'
import { EditorStateOptions } from '@app/components/editor/use-editor-state'
import SecretKeyOnlyInput from '@app/components/shared/secret-key-input'
import { sensitiveKeyRule } from '@app/validations/container'
import useTranslation from 'next-translate/useTranslation'
import { useRef } from 'react'
import KeyValueInput from '../../../shared/key-value-input'

interface EditImageConfigProps {
  disabled?: boolean
  config: ContainerConfig
  editorOptions: EditorStateOptions
  onPatch: (config: Partial<ContainerConfig>) => void
}

const EditImageConfig = (props: EditImageConfigProps) => {
  const { config, disabled, editorOptions, onPatch } = props

  const { t } = useTranslation('images')

  const patch = useRef<Partial<ContainerConfig>>({})

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

  const onSecretsChange = (secrets: Secrets) => {
    sendPatch({
      secrets,
    })
  }

  const onContainerNameChange = (name: string) =>
    sendPatch({
      name,
    })

  return (
    <>
      <MultiInput
        id="name"
        disabled={disabled}
        label={t('containerName').toUpperCase()}
        labelClassName="mt-2 mb-2.5"
        className="mb-4"
        editorOptions={editorOptions}
        value={config?.name}
        onPatch={onContainerNameChange}
      />

      <KeyValueInput
        disabled={disabled}
        heading={t('environment').toUpperCase()}
        editorOptions={editorOptions}
        items={config?.environment ?? []}
        onChange={onEnvChange}
        hint={{ hintValidation: sensitiveKeyRule, hintText: t('sensitiveKey') }}
      />

      <SecretKeyOnlyInput
        disabled={disabled}
        heading={t('secrets').toUpperCase()}
        items={config.secrets ?? []}
        editorOptions={editorOptions}
        onChange={onSecretsChange}
      />
    </>
  )
}

export default EditImageConfig
