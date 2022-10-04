import { ViewMode } from '@app/components/shared/view-mode-toggle'
import useWebSocket from '@app/hooks/use-websocket'
import {
  AddImagesMessage,
  AllImageEditorsMessage,
  DeleteImageMessage,
  Editor,
  EditorJoinedMessage,
  EditorLeftMessage,
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
  VersionDetails,
  VersionImage,
  VersionSectionsState,
  WS_TYPE_ADD_IMAGES,
  WS_TYPE_ALL_IMAGE_EDITORS,
  WS_TYPE_EDITOR_IDENTITY,
  WS_TYPE_EDITOR_JOINED,
  WS_TYPE_EDITOR_LEFT,
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
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'

import { useState } from 'react'

// state
export type ImageTagsMap = { [key: string]: RegistryImageTags } // image key to RegistryImageTags

export type VersionAddSection = 'image' | 'deployment' | 'none'

const VERSION_SECTIONS_STATE_VALUES = ['images', 'deployments', 'reorder'] as const
export type VersionSection = typeof VERSION_SECTIONS_STATE_VALUES[number]

const ADD_SECTION_TO_SECTION: Record<VersionAddSection, VersionSection> = {
  image: 'images',
  deployment: 'deployments',
  none: 'images',
}

export type ImagesState = {
  saving: boolean
  addSection: VersionAddSection
  section: VersionSection
  images: VersionImage[]
  tags: ImageTagsMap
  me: Editor
  editors: Editor[]
  viewMode: ViewMode
  versionSock: WebSocketClientEndpoint
}

// actions
export type ImagesActions = {
  selectAddSection: (addSection: VersionAddSection) => void
  discardAddSection: VoidFunction
  setSection: (section: VersionSection) => void
  addImages: (images: RegistryImages[]) => void
  orderImages: (imgs: VersionImage[]) => void
  selectViewMode: (mode: ViewMode) => void
  getOrFetchImageTags: (image: VersionImage) => RegistryImageTags
  selectTagForImage: (image: VersionImage, tag: string) => void
}

export const imageTagKey = (registryId: string, imageName: string) => `${registryId}/${imageName}`

const mergeImagePatch = (oldImage: VersionImage, newImage: PatchVersionImage): VersionImage => ({
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

export interface ImagesStateOptions {
  productId: string
  version: VersionDetails
  initialSection: VersionSectionsState
}

const refreshImageTags = (registriesSock: WebSocketClientEndpoint, images: VersionImage[]): void => {
  const fetchTags = images.reduce((map, it) => {
    let names = map.get(it.registryId)
    if (!names) {
      names = new Set()
      map.set(it.registryId, names)
    }

    names.add(it.name)
    return map
  }, new Map())

  fetchTags.forEach((names, registryId) => {
    registriesSock.send(WS_TYPE_REGISTRY_FETCH_IMAGE_TAGS, {
      registryId,
      images: Array.from(names),
    } as FetchImageTagsMessage)
  })
}

export const useImagesState = (options: ImagesStateOptions): [ImagesState, ImagesActions] => {
  const { productId, version, initialSection } = options

  const [saving, setSaving] = useState(false)
  const [section, setSection] = useState(initialSection)
  const [addSection, setAddSection] = useState<VersionAddSection>('none')
  const [images, setImages] = useState(version.images)
  const [tags, setTags] = useState<ImageTagsMap>({})
  const [me, setMe] = useState<Editor>(null)
  const [editors, setEditors] = useState<Editor[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('tile')

  const registriesSock = useWebSocket(WS_REGISTRIES, {
    onOpen: () => refreshImageTags(registriesSock, images),
  })

  const fetchImageTags = (message: FetchImageTagsMessage) =>
    registriesSock.send(WS_TYPE_REGISTRY_FETCH_IMAGE_TAGS, message)

  registriesSock.on(WS_TYPE_REGISTRY_IMAGE_TAGS, (message: RegistryImageTagsMessage) => {
    if (message.images.length < 1) {
      return
    }

    const newTags = { ...tags }
    message.images.forEach(it => {
      const key = imageTagKey(message.registryId, it.name)
      newTags[key] = it
    })
    setTags(newTags)
  })

  const versionSock = useWebSocket(versionWsUrl(productId, version.id), {
    onSend: message => {
      if (message.type === WS_TYPE_PATCH_IMAGE) {
        setSaving(true)
      }
    },
    onReceive: message => {
      if (WS_TYPE_IMAGE_UPDATED === message.type) {
        setSaving(false)
      }
    },
  })

  versionSock.on(WS_TYPE_EDITOR_IDENTITY, (message: EditorJoinedMessage) => setMe(message))

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
    refreshImageTags(registriesSock, message.images)
  })

  versionSock.on(WS_TYPE_IMAGE, (message: ImageMessage) => {
    const newImages = [...images, message]
    setImages(newImages)
    refreshImageTags(registriesSock, [message])
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

  versionSock.on(WS_TYPE_IMAGE_DELETED, (message: DeleteImageMessage) =>
    setImages(images.filter(it => it.id !== message.imageId)),
  )

  versionSock.on(WS_TYPE_EDITOR_JOINED, (message: EditorJoinedMessage) => {
    if (editors.find(it => it.id === message.id)) {
      return
    }

    setEditors([...editors, message])
  })

  versionSock.on(WS_TYPE_EDITOR_LEFT, (message: EditorLeftMessage) => {
    if (!editors.find(it => it.id === message.userId)) {
      return
    }

    setEditors([...editors].filter(it => it.id !== message.userId))
  })

  versionSock.on(WS_TYPE_ALL_IMAGE_EDITORS, (message: AllImageEditorsMessage) => setEditors(message.editors))

  const selectAddSection = (newAddSection: VersionAddSection) => {
    setAddSection(newAddSection)
    setSection(ADD_SECTION_TO_SECTION[newAddSection])
  }

  const discardAddSection = () => {
    setAddSection('none')

    if (section === 'reorder') {
      setSection('images')
    }
  }

  const addImages = registryImages => {
    setAddSection('none')

    versionSock.send(WS_TYPE_ADD_IMAGES, {
      registryImages,
    } as AddImagesMessage)
  }

  const orderImages = (imgs: VersionImage[]) => {
    const ids = imgs.map(it => it.id)
    versionSock.send(WS_TYPE_ORDER_IMAGES, ids as OrderImagesMessage)

    const newImages = imgs.map((it, index) => ({
      ...it,
      order: index,
    }))

    setImages(newImages)
    setAddSection('none')
  }

  const getOrFetchImageTags = (image: VersionImage): RegistryImageTags => {
    const key = imageTagKey(image.registryId, image.name)
    const imgTags = tags[key]

    if (!imgTags) {
      return imgTags
    }

    fetchImageTags({
      registryId: image.registryId,
      images: [image.name],
    })

    return null
  }

  const selectViewMode = (mode: ViewMode) => setViewMode(mode)

  const selectTagForImage = (image: VersionImage, tag: string) => {
    const newImages = [...images]
    const index = newImages.findIndex(it => it.id === image.id)

    if (index < 0) {
      return
    }

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

  return [
    { addSection, section, images, me, editors, saving, tags, viewMode, versionSock },
    {
      selectAddSection,
      discardAddSection,
      setSection,
      addImages,
      orderImages,
      selectViewMode,
      selectTagForImage,
      getOrFetchImageTags,
    },
  ]
}
