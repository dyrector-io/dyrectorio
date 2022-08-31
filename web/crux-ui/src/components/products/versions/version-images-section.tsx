import DyoWrap from '@app/elements/dyo-wrap'
import { VersionImage } from '@app/models'
import WebSocketEndpoint from '@app/websockets/websocket-endpoint'
import EditImageCard from './images/edit-image-card'
import { imageTagKey, ImageTagsMap } from './use-images-websocket'

interface VersionImagesSectionProps {
  disabled?: boolean
  images: VersionImage[]
  imageTags: ImageTagsMap
  versionSock: WebSocketEndpoint
  onTagSelected: (image: VersionImage, tag: string) => void
}

const VersionImagesSection = (props: VersionImagesSectionProps) => {
  const { images, imageTags, versionSock, onTagSelected, disabled } = props

  return (
    <DyoWrap>
      {images
        .sort((one, other) => one.order - other.order)
        .map(it => {
          const key = imageTagKey(it.registryId, it.name)
          const details = imageTags[key]

          return (
            <EditImageCard
              disabled={disabled}
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
