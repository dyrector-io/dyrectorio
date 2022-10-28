import MultiInput from '@app/components/editor/multi-input'
import { EditorStateOptions } from '@app/components/editor/use-editor-state'
import KeyValueInput from '@app/components/shared/key-value-input'
import SecretKeyInput from '@app/components/shared/secret-key-input'
import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { useThrottling } from '@app/hooks/use-throttleing'
import { ContainerConfig, UniqueSecretKeyValue } from '@app/models'
import { UniqueKeyValue } from '@app/models/grpc/protobuf/proto/crux'
import { sensitiveKeyRule } from '@app/validations/container'
import useTranslation from 'next-translate/useTranslation'
import { useRef } from 'react'

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
      ...config,
      ...patch.current,
      ...cfg,
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

  const onSecretChange = (secrets: UniqueSecretKeyValue[]) => {
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
        items={config?.environment ?? []}
        editorOptions={editorOptions}
        onChange={onEnvChange}
        hint={{ hintValidation: sensitiveKeyRule, hintText: t('sensitiveKey') }}
      />

      <SecretKeyInput
        disabled={disabled}
        unique
        className="mt-2"
        label={t('secrets').toUpperCase()}
        items={config.secrets ?? []}
        keyPlaceholder={t('common:key')}
        description={t('common:cannotDefineSecretsHere')}
        onChange={it => onSecretChange(it.map(sit => ({ ...sit, value: '', publicKey: '' })))}
        editorOptions={editorOptions}
      />
    </>
  )
}

export default EditImageConfig
