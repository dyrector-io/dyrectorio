import EditContainerConfigHeading from '@app/components/container-configs/edit-container-config-heading'
import useContainerConfigSocket from '@app/components/container-configs/use-container-config-socket'
import useContainerConfigState, { setParseError } from '@app/components/container-configs/use-container-config-state'
import usePatchContainerConfig from '@app/components/container-configs/use-patch-container-config'
import useEditorState from '@app/components/editor/use-editor-state'
import useItemEditorState from '@app/components/editor/use-item-editor-state'
import { DyoCard } from '@app/elements/dyo-card'
import DyoImgButton from '@app/elements/dyo-img-button'
import DyoMessage from '@app/elements/dyo-message'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import useConfirmation from '@app/hooks/use-confirmation'
import { ContainerConfig, ContainerConfigParent, VersionImage } from '@app/models'
import { createContainerConfigSchema, getValidationError } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { QA_DIALOG_LABEL_DELETE_IMAGE } from 'quality-assurance'
import ContainerConfigJsonEditor from './container-config-json-editor'

type EditContainerCardProps<Config extends ContainerConfig, Json> = {
  configParent: ContainerConfigParent
  containerConfig: Config
  image?: VersionImage
  onDelete?: VoidFunction
  convertConfigToJson: (config: Config) => Json
  mergeJsonWithConfig: (config: Config, json: Json) => Config
}

const EditContainerConfigCard = <Config extends ContainerConfig, Json>(props: EditContainerCardProps<Config, Json>) => {
  const { configParent, containerConfig, image, onDelete, convertConfigToJson, mergeJsonWithConfig } = props
  const disabled = !configParent.mutable

  const { t } = useTranslation('images')

  const [state, dispatch] = useContainerConfigState({
    config: containerConfig,
    parseError: null,
    saveState: 'disconnected',
  })
  const sock = useContainerConfigSocket(containerConfig.id, dispatch)
  const [wsPatchConfig, cancelPatch] = usePatchContainerConfig(sock, dispatch)
  const [deleteModal, confirmDelete] = useConfirmation()

  const name = containerConfig.name ?? configParent.name

  const deleteImage = async () => {
    const confirmed = await confirmDelete({
      qaLabel: QA_DIALOG_LABEL_DELETE_IMAGE,
      title: t('common:areYouSureDeleteName', { name }),
      description: t('common:proceedYouLoseAllDataToName', { name }),
      confirmText: t('common:delete'),
      confirmColor: 'bg-error-red',
    })

    if (!confirmed) {
      return
    }

    onDelete()
  }

  const editor = useEditorState(sock)
  const editorState = useItemEditorState(editor, sock, containerConfig.id)

  const onPatch = (patch: Json) => {
    const config = mergeJsonWithConfig(state.config as Config, patch)
    wsPatchConfig({
      config,
    })
  }

  const onParseError = (error: Error) => {
    cancelPatch()
    dispatch(setParseError(error.message))
  }

  const errorMessage =
    state.parseError ??
    getValidationError(createContainerConfigSchema(image?.labels ?? {}), state.config, null, t)?.message

  return (
    <>
      <DyoCard className="flex flex-col flex-grow px-6 pb-6 pt-4 h-full">
        <div className="flex mb-2 flex-row items-start">
          <EditContainerConfigHeading
            className="flex-1"
            imageName={configParent.name}
            imageTag={image?.tag}
            containerName={state.config.name}
          />

          {!disabled && onDelete && (
            <DyoImgButton className="ml-6" onClick={deleteImage} src="/trash-can.svg" alt={t('common:delete')} />
          )}
        </div>

        {errorMessage ? (
          <DyoMessage message={errorMessage} className="text-xs italic w-full" messageType="error" />
        ) : null}

        <div className="flex flex-col mt-2 h-128">
          <ContainerConfigJsonEditor
            disabled={disabled}
            config={state.config}
            editorOptions={editorState}
            onPatch={onPatch}
            onParseError={onParseError}
            convertConfigToJson={convertConfigToJson}
          />
        </div>
      </DyoCard>

      <DyoConfirmationModal config={deleteModal} className="w-1/4" />
    </>
  )
}

export default EditContainerConfigCard
