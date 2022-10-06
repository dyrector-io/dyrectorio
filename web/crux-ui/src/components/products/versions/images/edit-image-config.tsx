import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { useThrottling } from '@app/hooks/use-throttleing'
import { ContainerConfig, Environment, InstanceContainerConfig, Secrets } from '@app/models'

import EditorInput from '@app/components/editor/editor-input'
import { EditorOptions } from '@app/components/editor/use-editor-state'
import SecretKeyOnlyInput from '@app/components/shared/secret-key-input'
import { sensitiveKeyRule } from '@app/validations/container'
import useTranslation from 'next-translate/useTranslation'
import { useRef } from 'react'
import KeyValueInput from '../../../shared/key-value-input'

interface EditImageConfigProps {
  disabled?: boolean
  disabledContainerNameEditing?: boolean
  editorOptions: EditorOptions
  config: ContainerConfig | InstanceContainerConfig
  onPatch: (config: Partial<ContainerConfig | InstanceContainerConfig>) => void
}

const EditImageConfig = (props: EditImageConfigProps) => {
  const { config, disabled, editorOptions, disabledContainerNameEditing, onPatch } = props

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

  const onSecretSubmit = (secrets: Secrets) => {
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
      {disabledContainerNameEditing ? null : (
        <EditorInput
          id="name"
          disabled={disabled}
          label={t('containerName').toUpperCase()}
          labelClassName="mt-2 mb-2.5"
          className="mb-4"
          options={editorOptions}
          value={config?.name}
          onPatch={onContainerNameChange}
        />
      )}

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
        onSubmit={onSecretSubmit}
      />
    </>
  )
}

export default EditImageConfig
