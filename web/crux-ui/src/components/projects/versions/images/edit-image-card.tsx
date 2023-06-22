import useItemEditorState from '@app/components/editor/use-item-editor-state'
import { DyoCard } from '@app/elements/dyo-card'
import DyoImgButton from '@app/elements/dyo-img-button'
import DyoMessage from '@app/elements/dyo-message'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import {
  imageConfigToJsonContainerConfig,
  JsonContainerConfig,
  mergeJsonConfigToImageContainerConfig,
  VersionImage,
} from '@app/models'
import { containerConfigSchema, getValidationError } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { VerionState, VersionActions } from '../use-version-state'
import EditImageHeading from './edit-image-heading'
import EditImageJson from './edit-image-json'
import useImageEditorState from './use-image-editor-state'

interface EditImageCardProps {
  disabled?: boolean
  image: VersionImage
  imagesState: VerionState
  imagesActions: VersionActions
}

const EditImageCard = (props: EditImageCardProps) => {
  const { disabled, image, imagesState, imagesActions } = props
  const { editor, versionSock } = imagesState

  const { t } = useTranslation('images')

  const [state, actions] = useImageEditorState({
    image,
    imagesState,
    imagesActions,
    sock: versionSock,
  })

  const editorState = useItemEditorState(editor, versionSock, image.id)
  const errorMessage = state.parseError ?? getValidationError(containerConfigSchema, image.config)?.message

  return (
    <>
      <DyoCard className="flex flex-col flex-grow px-6 pb-6 pt-4 h-full">
        <div className="flex mb-2 flex-row items-start">
          <EditImageHeading
            className="flex-1"
            imageName={image.name}
            imageTag={image.tag}
            containerName={image.config.name}
          />

          {disabled ? null : (
            <DyoImgButton
              className="ml-6"
              onClick={actions.deleteImage}
              src="/trash-can.svg"
              alt={t('common:delete')}
            />
          )}
        </div>

        {errorMessage ? (
          <DyoMessage message={errorMessage} className="text-xs italic w-full" messageType="error" />
        ) : null}

        <div className="flex flex-col mt-2 h-128">
          <EditImageJson
            disabled={disabled}
            config={image.config}
            editorOptions={editorState}
            onPatch={(it: JsonContainerConfig) =>
              actions.onPatch(mergeJsonConfigToImageContainerConfig(image.config, it))
            }
            onParseError={actions.setParseError}
            convertConfigToJson={imageConfigToJsonContainerConfig}
          />
        </div>
      </DyoCard>

      <DyoConfirmationModal
        config={state.deleteModal}
        title={t('common:areYouSureDeleteName', { name: image.name })}
        description={t('common:proceedYouLoseAllDataToName', { name: image.name })}
        confirmText={t('common:delete')}
        className="w-1/4"
        confirmColor="bg-error-red"
      />
    </>
  )
}

export default EditImageCard
