import useWebSocket from '@app/hooks/use-websocket'
import {
  AddImagesMessage,
  DeleteImageMessage,
  FetchImageTagsMessage,
  GetImageMessage,
  ImageMessage,
  ImagesAddedMessage,
  ImagesWereReorderedMessage,
  ImageUpdateMessage,
  OrderImagesMessage,
  PatchImageMessage,
  PatchVersionImage,
  RegistryImages,
  RegistryImageTags,
  RegistryImageTagsMessage,
  VersionImage,
  WS_TYPE_ADD_IMAGES,
  WS_TYPE_GET_IMAGE,
  WS_TYPE_IMAGE,
  WS_TYPE_IMAGES_ADDED,
  WS_TYPE_IMAGES_WERE_REORDERED,
  WS_TYPE_IMAGE_DELETED,
  WS_TYPE_IMAGE_UPDATED,
  WS_TYPE_ORDER_IMAGES,
  WS_TYPE_PATCH_IMAGE,
  WS_TYPE_REGISTRY_FETCH_IMAGE_TAGS,
  WS_TYPE_REGISTRY_IMAGE_TAGS,
} from '@app/models'
import { versionWsUrl, WS_REGISTRIES } from '@app/routes'
import { fold } from '@app/utils'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'

import { Dispatch, SetStateAction } from 'react'

export type ImageTagsMap = { [key: string]: RegistryImageTags }

export const imageTagKey = (registryId: string, imageName: string) => `${registryId}/${imageName}`

const mergeImagePatch = (oldImage: VersionImage, newImage: PatchVersionImage): VersionImage => ({
  ...oldImage,
  ...newImage,
  config: {
    name: newImage.config?.name ?? oldImage.config.name,
    environment: newImage.config?.environment ?? oldImage.config.environment,
    capabilities: newImage.config?.capabilities ?? oldImage.config.capabilities,
    config: newImage.config?.config ?? oldImage.config.config,
  },
})

export interface ImagesWebSocketOptions {
  productId: string
  versionId: string
  images: VersionImage[]
  imageTags: ImageTagsMap
  setImages: Dispatch<SetStateAction<VersionImage[]>>
  setImageTags: Dispatch<SetStateAction<ImageTagsMap>>
  setPatchingImage: Dispatch<SetStateAction<boolean>>
}

export interface ImagesWebSocket {
  versionSock: WebSocketClientEndpoint
  fetchImageTags: (image: RegistryImages) => void
  addImages: (images: RegistryImages[]) => void
  orderImages: (ids: string[]) => void
  patchImage: (id: string, tag?: string) => void
}

export const useImagesWebSocket = (options: ImagesWebSocketOptions): ImagesWebSocket => {
  const { productId, versionId, images, imageTags, setImages, setImageTags, setPatchingImage } = options

  const registriesSock = useWebSocket(WS_REGISTRIES, {
    onOpen: () => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      updateImageTags(images)
    },
  })

  const updateImageTags = (imgs: VersionImage[]) => {
    const fetchTags = fold(imgs, new Map<string, Set<string>>(), (map, it) => {
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
  }

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

  const versionSock = useWebSocket(versionWsUrl(productId, versionId), {
    onSend: message => {
      if (message.type === WS_TYPE_PATCH_IMAGE) {
        setPatchingImage(true)
      }
    },
    onReceive: message => {
      if (WS_TYPE_IMAGE_UPDATED === message.type) {
        setPatchingImage(false)
      }
    },
  })

  versionSock.on(WS_TYPE_IMAGES_WERE_REORDERED, (message: ImagesWereReorderedMessage) => {
    const ids = [...message]

    const newImages = ids.map((id, index) => {
      const image = images.find(it => it.id === id)
      return {
        ...image,
        order: index,
      }
    })

    setImages(newImages)
  })

  versionSock.on(WS_TYPE_IMAGES_ADDED, (message: ImagesAddedMessage) => {
    const newImages = [...images, ...message.images]
    setImages(newImages)
    updateImageTags(newImages)
  })

  versionSock.on(WS_TYPE_IMAGE, (message: ImageMessage) => {
    const newImages = [...images, message]
    setImages(newImages)
    updateImageTags(newImages)
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
    updateImageTags(newImages)
  })

  versionSock.on(WS_TYPE_IMAGE_DELETED, (message: DeleteImageMessage) => {
    setImages(images.filter(it => it.id !== message.imageId))
  })

  const fetchImageTags = image => registriesSock.send(WS_TYPE_REGISTRY_FETCH_IMAGE_TAGS, image)

  const addImages = registryImages => {
    versionSock.send(WS_TYPE_ADD_IMAGES, {
      registryImages,
    } as AddImagesMessage)
  }

  const orderImages = ids => versionSock.send(WS_TYPE_ORDER_IMAGES, ids as OrderImagesMessage)

  const patchImage = (id, tag?) => {
    versionSock.send(WS_TYPE_PATCH_IMAGE, {
      id,
      tag,
    } as PatchImageMessage)
  }

  return { versionSock, fetchImageTags, addImages, orderImages, patchImage }
}
