import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { useThrottling } from '@app/hooks/use-throttleing'
import { ContainerConfig, UniqueKeyValue, UniqueSecretKeyValue } from '@app/models'

import MultiInput from '@app/components/editor/multi-input'
import { EditorStateOptions } from '@app/components/editor/use-editor-state'
import KeyValueInput from '@app/components/shared/key-value-input'
import SecretKeyValInput from '@app/components/shared/secret-key-value-input'
import { sensitiveKeyRule } from '@app/validations/container'
import useTranslation from 'next-translate/useTranslation'
import { useRef } from 'react'

interface EditInstanceProps {
  disabled?: boolean
  publicKey: string
  definedSecrets: string[]
  config: ContainerConfig
  onPatch: (config: Partial<ContainerConfig>) => void
  editorOptions: EditorStateOptions
}

const EditInstanceConfig = (props: EditInstanceProps) => {
  const { config, disabled, publicKey, definedSecrets, editorOptions, onPatch } = props

  const { t } = useTranslation('images')

  const patch = useRef<Partial<ContainerConfig>>({})

  const throttle = useThrottling(IMAGE_WS_REQUEST_DELAY)

  const sendPatchImmediately = (newConfig: Partial<ContainerConfig>) => {
    onPatch({
      ...patch.current,
      ...newConfig,
    })
    patch.current = {}
  }

  const sendPatch = (newConfig: Partial<ContainerConfig>) => {
    const newPatch = {
      ...patch.current,
      ...newConfig,
    }
    patch.current = newPatch

    throttle(() => {
      onPatch(patch.current)
      patch.current = {}
    })
  }

  const onEnvChange = (environment: UniqueKeyValue[]) =>
    sendPatch({
      environment,
    })

  const onSecretSubmit = (secrets: UniqueSecretKeyValue[]) =>
    sendPatchImmediately({
      secrets,
    })

  const onContainerNameChange = (name: string) =>
    sendPatch({
      ...patch.current,
      name,
    })

  return (
    <>
      <MultiInput
        id="name"
        disabled={disabled}
        label={t('containerName').toUpperCase()}
        labelClassName="mt-2 mb-2.5"
        className="mb-4 ml-2"
        containerClassName="w-5/12"
        grow
        editorOptions={editorOptions}
        value={config?.name}
        onPatch={onContainerNameChange}
      />

      <KeyValueInput
        disabled={disabled}
        label={t('environment').toUpperCase()}
        items={config.environment ?? []}
        editorOptions={editorOptions}
        onChange={onEnvChange}
        hint={{ hintValidation: sensitiveKeyRule, hintText: t('sensitiveKey') }}
      />

      <SecretKeyValInput
        disabled={disabled || !publicKey}
        unique
        editorOptions={editorOptions}
        label={t('secrets').toUpperCase()}
        publicKey={publicKey}
        items={(config.secrets as UniqueSecretKeyValue[]) ?? []}
        definedSecrets={definedSecrets}
        onSubmit={onSecretSubmit}
      />
    </>
  )
}

export default EditInstanceConfig
