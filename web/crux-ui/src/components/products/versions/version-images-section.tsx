import { DyoHeading } from '@app/elements/dyo-heading'
import DyoWrap from '@app/elements/dyo-wrap'
import { PatchVersionImage, VersionImage } from '@app/models'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import EditImageCard from './images/edit-image-card'
import { imageTagKey, ImageTagsMap } from './use-images-websocket'

interface VersionImagesSectionProps {
  disabled?: boolean
  images: VersionImage[]
  imageTags: ImageTagsMap
  versionSock: WebSocketClientEndpoint
  onTagSelected: (image: VersionImage, tag: string) => void
}

const VersionImagesSection = (props: VersionImagesSectionProps) => {
  const { images, imageTags, versionSock, onTagSelected, disabled } = props

  const { t } = useTranslation('images')

  return images.length ? (
    <DyoWrap itemClassName="xl:w-1/2 py-2">
      {images
        .sort((one, other) => one.order - other.order)
        .map((it, index) => {
          const key = imageTagKey(it.registryId, it.name)
          const details = imageTags[key]

          return (
            <div className={clsx('w-full h-full min-w-min', index % 2 ? 'xl:pl-2' : 'xl:pr-2')} key={it.order}>
              <EditImageCard
                disabled={disabled}
                versionSock={versionSock}
                image={it}
                tags={details?.tags ?? []}
                onTagSelected={tag => onTagSelected(it, tag)}
              />
            </div>
          )
        })}
    </DyoWrap>
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
