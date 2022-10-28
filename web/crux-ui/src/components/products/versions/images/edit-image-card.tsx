import useItemEditorState from '@app/components/editor/use-item-editor-state'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoImgButton from '@app/elements/dyo-img-button'
import DyoMessage from '@app/elements/dyo-message'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import { imageConfigToJsonContainerConfig, VersionImage } from '@app/models'
import { containerConfigSchema, getValidationError } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import EditImageConfig from './edit-image-config'
import EditImageHeading from './edit-image-heading'
import EditImageJson from './edit-image-json'
import EditImageTags from './edit-image-tags'
import useImageEditorState from './use-image-editor-state'
import { ImagesActions, ImagesState } from './use-images-state'

interface EditImageCardProps {
  disabled?: boolean
  image: VersionImage
  imagesState: ImagesState
  imagesActions: ImagesActions
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

  const { section } = state
  const { selectSection } = actions

  const errorMessage = state.parseError ?? getValidationError(containerConfigSchema, image.config)?.message

  return (
    <>
      <DyoCard className="flex flex-col flex-grow px-6 pb-6 pt-4 h-full">
        <div className="flex mb-2 flex-row items-start">
          <EditImageHeading imageName={image.name} imageTag={image.tag} containerName={image.config.name} />

          <DyoButton
            text
            thin
            textColor="text-bright"
            underlined={section === 'tag'}
            onClick={() => selectSection('tag')}
            className="ml-auto"
            heightClassName="pb-2"
          >
            {t('tag')}
          </DyoButton>

          <DyoButton
            text
            thin
            textColor="text-bright"
            underlined={section === 'config'}
            onClick={() => selectSection('config')}
            className="mx-8"
            heightClassName="pb-2"
          >
            {t('config')}
          </DyoButton>

          <DyoButton
            text
            thin
            textColor="text-bright"
            underlined={section === 'json'}
            onClick={() => selectSection('json')}
            className="mr-0"
            heightClassName="pb-2"
          >
            {t('json')}
          </DyoButton>

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
          {section === 'tag' ? (
            <EditImageTags
              disabled={disabled}
              selected={image.tag}
              tags={state.tags}
              onTagSelected={actions.selectTag}
            />
          ) : section === 'config' ? (
            <EditImageConfig
              disabled={disabled}
              config={image.config}
              editorOptions={editorState}
              onPatch={actions.patchImage}
            />
          ) : (
            <EditImageJson
              disabled={disabled}
              config={image.config}
              editorOptions={editorState}
              onPatch={actions.patchImage}
              onParseError={actions.setParseError}
              convertConfigToJson={imageConfigToJsonContainerConfig}
            />
          )}
        </div>
      </DyoCard>

      <DyoConfirmationModal
        config={state.deleteModal}
        title={t('common:confirmDelete', { name: image.name })}
        description={t('common:deleteDescription', { name: image.name })}
        confirmText={t('common:delete')}
        className="w-1/4"
        confirmColor="bg-error-red"
      />
    </>
  )
}

export default EditImageCard
