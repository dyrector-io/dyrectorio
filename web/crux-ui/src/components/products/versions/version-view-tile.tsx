import DyoWrap from '@app/elements/dyo-wrap'
import { VersionImage } from '@app/models'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import clsx from 'clsx'
import EditImageCard from './images/edit-image-card'
import { getImageTags, ImageTagsMap } from './use-images-websocket'

interface VersionViewTileProps {
  disabled?: boolean
  images: VersionImage[]
  versionSock: WebSocketClientEndpoint
  imageTags: ImageTagsMap
  onTagSelected: (image: VersionImage, tag: string) => void
  onFetchTags: (image: VersionImage) => void
}

const VersionViewTile = (props: VersionViewTileProps) => {
  const { disabled, images, versionSock, imageTags, onTagSelected, onFetchTags } = props

  return (
    <DyoWrap itemClassName="xl:w-1/2 py-2">
      {images
        .sort((one, other) => one.order - other.order)
        .map((it, index) => (
          <div className={clsx('w-full h-full', index % 2 ? 'xl:pl-2' : 'xl:pr-2')} key={it.order}>
            <EditImageCard
              disabled={disabled}
              versionSock={versionSock}
              image={it}
              tags={getImageTags(imageTags, it)}
              onTagSelected={tag => onTagSelected(it, tag)}
              onFetchTags={() => onFetchTags(it)}
            />
          </div>
        ))}
    </DyoWrap>
  )
}

export default VersionViewTile
