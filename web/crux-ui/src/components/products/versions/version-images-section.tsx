import { DyoHeading } from '@app/elements/dyo-heading'
import { PatchVersionImage, VersionImage } from '@app/models'
import useTranslation from 'next-translate/useTranslation'
import { ImagesActions, ImagesState } from './images/use-images-state'
import VersionViewList from './version-view-list'
import VersionViewTile from './version-view-tile'

interface VersionImagesSectionProps {
  disabled?: boolean
  state: ImagesState
  actions: ImagesActions
}

interface VersionImagesSectionProps {
  disabled?: boolean
  state: ImagesState
  actions: ImagesActions
}

const VersionImagesSection = (props: VersionImagesSectionProps) => {
  const { state, actions, disabled } = props
  const { images, viewMode } = state

  const { t } = useTranslation('images')

  return images.length ? (
    viewMode === 'tile' ? (
      <VersionViewTile disabled={disabled} state={state} actions={actions} />
    ) : (
      <VersionViewList state={state} actions={actions} />
    )
  ) : (
    <DyoHeading element="h3" className="text-md text-center text-light-eased pt-32">
      {t('noItems')}
    </DyoHeading>
  )
}

export default VersionImagesSection

export const mergeImagePatch = (oldImage: VersionImage, newImage: PatchVersionImage): VersionImage => ({
  ...oldImage,
  ...newImage,
  config: {
    name: newImage.config?.name ?? oldImage.config.name,
    environment: newImage.config?.environment ?? oldImage.config.environment,
    capabilities: newImage.config?.capabilities ?? oldImage.config.capabilities,
    config: newImage.config?.config ?? oldImage.config.config,
    secrets: newImage.config?.secrets ?? oldImage.config.secrets,
  },
})
