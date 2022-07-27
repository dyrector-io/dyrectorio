import DyoWrap from '@app/elements/dyo-wrap'
import { useWebSocket } from '@app/hooks/use-websocket'
import {
  DeleteImageMessage,
  FetchImageTagsMessage,
  GetImageMessage,
  ImageMessage,
  ImagesAddedMessage,
  ImageUpdateMessage,
  PatchImageMessage,
  PatchVersionImage,
  RegistryImageTags,
  RegistryImageTagsMessage,
  VersionImage,
  WS_TYPE_GET_IMAGE,
  WS_TYPE_IMAGE,
  WS_TYPE_IMAGES_ADDED,
  WS_TYPE_IMAGE_DELETED,
  WS_TYPE_IMAGE_UPDATED,
  WS_TYPE_PATCH_IMAGE,
  WS_TYPE_REGISTRY_FETCH_IMAGE_TAGS,
  WS_TYPE_REGISTRY_IMAGE_TAGS,
} from '@app/models'
import { versionWsUrl, WS_REGISTRIES } from '@app/routes'
import { fold } from '@app/utils'
import { useState } from 'react'
import EditImageCard from './images/edit-image-card'

type ImageTagsMap = { [key: string]: RegistryImageTags }
const imageTagKey = (registryId: string, imageName: string) => `${registryId}/${imageName}`

interface VersionImagesSectionProps {
  disabled?: boolean
  productId: string
  versionId: string
  images: VersionImage[]
}

const VersionImagesSection = (props: VersionImagesSectionProps) => {
  const [images, setImages] = useState(props.images ?? [])
  const [imageTags, setImageTags] = useState<ImageTagsMap>({})

  const registriesSock = useWebSocket(WS_REGISTRIES, {
    onOpen: () => {
      const fetchTags = fold(images, new Map<string, Set<string>>(), (map, it) => {
        let names = map.get(it.registryId)
        if (!names) {
          names = new Set()
          map.set(it.registryId, names)
        }

        names.add(it.name)
        return map
      })

      fetchTags.forEach((names, registryId) => {
        registriesSock.send(WS_TYPE_REGISTRY_FETCH_IMAGE_TAGS, {
          registryId,
          images: Array.from(names),
        } as FetchImageTagsMessage)
      })
    },
  })

  registriesSock.on(WS_TYPE_REGISTRY_IMAGE_TAGS, (message: RegistryImageTagsMessage) => {
    if (message.images.length < 1) {
      return
    }

    const tags = { ...imageTags }
    message.images.forEach(it => {
      const key = imageTagKey(message.registryId, it.name)
      tags[key] = it
    })
    setImageTags(tags)
  })

  const versionSock = useWebSocket(versionWsUrl(props.productId, props.versionId))

  versionSock.on(WS_TYPE_IMAGES_ADDED, (message: ImagesAddedMessage) => setImages([...images, ...message.images]))

  versionSock.on(WS_TYPE_IMAGE, (message: ImageMessage) => {
    setImages([...images, message])
  })

  versionSock.on(WS_TYPE_IMAGE_UPDATED, (message: ImageUpdateMessage) => {
    const index = images.findIndex(it => it.id === message.id)
    if (index < 0) {
      versionSock.send(WS_TYPE_GET_IMAGE, {
        id: message.id,
      } as GetImageMessage)
      return
    }

    const oldImage = images[index]
    const image = mergeImagePatch(oldImage, message)

    const newImages = [...images]
    newImages[index] = image

    setImages(newImages)
  })

  versionSock.on(WS_TYPE_IMAGE_DELETED, (message: DeleteImageMessage) => {
    setImages(images.filter(it => it.id !== message.imageId))
  })

  const onTagSelected = (image: VersionImage, tag: string) => {
    const index = images.indexOf(image)
    const newImages = [...images]
    newImages[index] = {
      ...image,
      tag,
    }
    setImages(newImages)

    versionSock.send(WS_TYPE_PATCH_IMAGE, {
      id: image.id,
      tag,
    } as PatchImageMessage)
  }

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
