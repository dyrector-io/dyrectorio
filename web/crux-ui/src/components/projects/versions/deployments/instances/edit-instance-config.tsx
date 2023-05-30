import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { useThrottling } from '@app/hooks/use-throttleing'
import { InstanceContainerConfigData, UniqueKeyValue, UniqueSecretKeyValue } from '@app/models'

import MultiInput from '@app/components/editor/multi-input'
import { ItemEditorState } from '@app/components/editor/use-item-editor-state'
import KeyValueInput from '@app/components/shared/key-value-input'
import SecretKeyValueInput from '@app/components/shared/secret-key-value-input'
import { sensitiveKeyRule } from '@app/validations/container'
import useTranslation from 'next-translate/useTranslation'
import { useRef } from 'react'

interface EditInstanceProps {
  disabled?: boolean
  publicKey: string
  definedSecrets: string[]
  config: InstanceContainerConfigData
  onPatch: (config: InstanceContainerConfigData) => void
  editorOptions: ItemEditorState
}

const EditInstanceConfig = (props: EditInstanceProps) => {
  const { config, disabled, publicKey, definedSecrets, editorOptions, onPatch } = props

  const { t } = useTranslation('images')

  const patch = useRef<InstanceContainerConfigData>({})

  const throttle = useThrottling(IMAGE_WS_REQUEST_DELAY)

  const sendPatchImmediately = (newConfig: InstanceContainerConfigData) => {
    onPatch({
      ...patch.current,
      ...newConfig,
    })
    patch.current = {}
  }

  const sendPatch = (newConfig: InstanceContainerConfigData) => {
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
    <div className="flex flex-col overflow-y-auto">
      <MultiInput
        id="name"
        disabled={disabled}
        label={t('containerName').toUpperCase()}
        labelClassName="mt-2 mb-2.5"
        className="mb-4 ml-2"
        containerClassName="w-5/12"
        grow
        editorOptions={editorOptions}
        value={config.name}
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

      <SecretKeyValueInput
        disabled={disabled || !publicKey}
        editorOptions={editorOptions}
        label={t('secrets').toUpperCase()}
        publicKey={publicKey}
        items={(config.secrets as UniqueSecretKeyValue[]) ?? []}
        definedSecrets={definedSecrets}
        onSubmit={onSecretSubmit}
      />
    </div>
  )
}

export default EditInstanceConfig
