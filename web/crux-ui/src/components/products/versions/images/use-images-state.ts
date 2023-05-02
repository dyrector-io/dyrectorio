import useEditorState, { EditorState } from '@app/components/editor/use-editor-state'
import { ViewMode } from '@app/components/shared/view-mode-toggle'
import useWebSocket from '@app/hooks/use-websocket'
import {
  AddImagesMessage,
  ContainerConfigData,
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
  VersionDetails,
  VersionImage,
  VersionSectionsState,
  WS_TYPE_ADD_IMAGES,
  WS_TYPE_GET_IMAGE,
  WS_TYPE_IMAGE,
  WS_TYPE_IMAGES_ADDED,
  WS_TYPE_IMAGES_WERE_REORDERED,
  WS_TYPE_IMAGE_DELETED,
  WS_TYPE_IMAGE_UPDATED,
  WS_TYPE_ORDER_IMAGES,
  WS_TYPE_PATCH_IMAGE,
  WS_TYPE_PATCH_RECEIVED,
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
  productId: string
  versionId: string
  saving: boolean
  addSection: VersionAddSection
  section: VersionSection
  images: VersionImage[]
  tags: ImageTagsMap
  editor: EditorState
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
  fetchImageTags: (image: VersionImage) => void
  selectTagForImage: (image: VersionImage, tag: string) => void
  updateImageConfig: (image: VersionImage, config: Partial<ContainerConfigData>) => void
}

export const imageTagKey = (registryId: string, imageName: string) => `${registryId}/${imageName}`

const mergeImagePatch = (oldImage: VersionImage, newImage: PatchVersionImage): VersionImage => ({
  ...oldImage,
  ...newImage,
  config: newImage.config
    ? {
        ...oldImage.config,
        ...newImage.config,
      }
    : oldImage.config,
})

export interface ImagesStateOptions {
  productId: string
  version: VersionDetails
  initialSection: VersionSectionsState
}

const refreshImageTags = (registriesSock: WebSocketClientEndpoint, images: VersionImage[]): void => {
  const fetchTags = images.reduce((map, it) => {
    let names = map.get(it.registry.id)
    if (!names) {
      names = new Set()
      map.set(it.registry.id, names)
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

export const selectTagsOfImage = (state: ImagesState, image: VersionImage): string[] => {
  const regImgTags = state.tags[imageTagKey(image.registry.id, image.name)]
  return regImgTags ? regImgTags.tags : image.tag ? [image.tag] : []
}

export const useImagesState = (options: ImagesStateOptions): [ImagesState, ImagesActions] => {
  const { productId, version, initialSection } = options

  const [saving, setSaving] = useState(false)
  const [section, setSection] = useState(initialSection)
  const [addSection, setAddSection] = useState<VersionAddSection>('none')
  const [images, setImages] = useState(version.images)
  const [tags, setTags] = useState<ImageTagsMap>({})
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const versionSock = useWebSocket(versionWsUrl(version.id), {
    onSend: message => {
      if (message.type === WS_TYPE_PATCH_IMAGE) {
        setSaving(true)
      }
    },
    onReceive: message => {
      if (WS_TYPE_PATCH_RECEIVED === message.type) {
        setSaving(false)
      }
    },
  })

  const editor = useEditorState(versionSock)

  const registriesSock = useWebSocket(WS_REGISTRIES, {
    onOpen: () =>
      refreshImageTags(
        registriesSock,
        images.filter(it => it.registry.type !== 'unchecked'),
      ),
  })

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
  })

  versionSock.on(WS_TYPE_IMAGE, (message: ImageMessage) => {
    const newImages = [...images, message]
    setImages(newImages)
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

  const addImages = (registryImages: RegistryImages[]) => {
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
    setSection('images')
  }

  const fetchImageTags = (image: VersionImage): RegistryImageTags => {
    if (image.registry.type === 'unchecked') {
      return
    }

    const key = imageTagKey(image.registry.id, image.name)
    const imgTags = tags[key]

    if (imgTags) {
      return
    }

    registriesSock.send(WS_TYPE_REGISTRY_FETCH_IMAGE_TAGS, {
      registryId: image.registry.id,
      images: [image.name],
    })
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

  const updateImageConfig = (image: VersionImage, config: Partial<ContainerConfigData>) => {
    const newImages = [...images]
    const index = newImages.findIndex(it => it.id === image.id)

    if (index < 0) {
      return
    }

    newImages[index] = {
      ...image,
      config: {
        ...newImages[index].config,
        ...config,
      },
    }

    setImages(newImages)
  }

  return [
    { productId, versionId: version.id, addSection, section, images, editor, saving, tags, viewMode, versionSock },
    {
      selectAddSection,
      discardAddSection,
      setSection,
      addImages,
      orderImages,
      selectViewMode,
      selectTagForImage,
      fetchImageTags,
      updateImageConfig,
    },
  ]
}
