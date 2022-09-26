import { DyoHeading } from '@app/elements/dyo-heading'
import { PatchVersionImage, VersionImage } from '@app/models'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import useTranslation from 'next-translate/useTranslation'
import { ImageTagsMap } from './use-images-websocket'
import VersionViewList from './version-view-list'
import VersionViewTile from './version-view-tile'

interface VersionImagesSectionProps {
  disabled?: boolean
  images: VersionImage[]
  imageTags: ImageTagsMap
  viewMode: string
  versionSock: WebSocketClientEndpoint
  onTagSelected: (image: VersionImage, tag: string) => void
  onFetchTags: (image: VersionImage) => void
}

const VersionImagesSection = (props: VersionImagesSectionProps) => {
  const { images, imageTags, versionSock, viewMode, onTagSelected, onFetchTags, disabled } = props

  const { t } = useTranslation('images')

  return images.length ? (
    viewMode === 'tile' ? (
      <VersionViewTile
        disabled={disabled}
        images={images}
        imageTags={imageTags}
        versionSock={versionSock}
        onFetchTags={onFetchTags}
        onTagSelected={onTagSelected}
      />
    ) : (
      <VersionViewList
        images={images}
        imageTags={imageTags}
        versionSock={versionSock}
        onFetchTags={onFetchTags}
        onTagSelected={onTagSelected}
      />
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
