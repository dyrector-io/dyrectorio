import MultiInput from '@app/components/editor/multi-input'
import { ItemEditorState } from '@app/components/editor/use-item-editor-state'
import KeyValueInput from '@app/components/shared/key-value-input'
import SecretKeyInput from '@app/components/shared/secret-key-input'
import { ContainerConfigData, UniqueKeyValue, UniqueSecretKey } from '@app/models'
import { sensitiveKeyRule } from '@app/validations/container'
import useTranslation from 'next-translate/useTranslation'

type EditImageConfigProps = {
  config: ContainerConfigData
  onPatch: (config: Partial<ContainerConfigData>) => void
  disabled?: boolean
  editorOptions: ItemEditorState
}

const EditImageConfig = (props: EditImageConfigProps) => {
  const { config, disabled, editorOptions, onPatch } = props

  const { t } = useTranslation('images')

  const onEnvChange = (environment: UniqueKeyValue[]) =>
    onPatch({
      environment,
    })

  const onSecretChange = (secrets: UniqueSecretKey[]) => {
    onPatch({
      secrets,
    })
  }

  const onContainerNameChange = (name: string) =>
    onPatch({
      name,
    })

  return (
    <div className="flex flex-col overflow-y-auto">
      <MultiInput
        id="common.containerName"
        disabled={disabled}
        label={t('containerName').toUpperCase()}
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

      <SecretKeyInput
        disabled={disabled}
        className="mt-2"
        label={t('secrets').toUpperCase()}
        items={config.secrets ?? []}
        keyPlaceholder={t('common:key')}
        description={t('common:cannotDefineSecretsHere')}
        onChange={secrets => onSecretChange(secrets)}
        editorOptions={editorOptions}
      />
    </div>
  )
}

export default EditImageConfig
