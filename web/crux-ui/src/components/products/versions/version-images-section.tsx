import DyoWrap from '@app/elements/dyo-wrap'
import { PatchVersionImage, VersionImage } from '@app/models'
import { WebSocketEndpoint } from '@app/websockets/client'
import EditImageCard from './images/edit-image-card'
import { imageTagKey, ImageTagsMap } from './use-images-websocket'

interface VersionImagesSectionProps {
  disabled?: boolean
  productId: string
  versionId: string
  images: VersionImage[]
  imageTags: ImageTagsMap
  versionSock: WebSocketEndpoint
  onTagSelected: (image: VersionImage, tag: string) => void
}

const VersionImagesSection = (props: VersionImagesSectionProps) => {
  const { images, imageTags, versionSock, onTagSelected } = props

  return (
    <DyoWrap>
      {images
        .sort((one, other) => one.order - other.order)
        .map(it => {
          const key = imageTagKey(it.registryId, it.name)
          const details = imageTags[key]

          return (
            <EditImageCard
              disabled={props.disabled}
              versionSock={versionSock}
              key={it.order}
              image={it}
              tags={details?.tags ?? []}
              onTagSelected={tag => onTagSelected(it, tag)}
            />
          )
        })}
    </DyoWrap>
  )
}

export default VersionImagesSection

export const mergeImagePatch = (oldImage: VersionImage, newImage: PatchVersionImage): VersionImage => {
  return {
    ...oldImage,
    ...newImage,
    config: {
      name: newImage.config?.name ?? oldImage.config.name,
      environment: newImage.config?.environment ?? oldImage.config.environment,
      capabilities: newImage.config?.capabilities ?? oldImage.config.capabilities,
      config: newImage.config?.config ?? oldImage.config.config,
    },
  }
}
