import useEditorState, { EditorState } from '@app/components/editor/use-editor-state'
import { ViewMode } from '@app/components/shared/view-mode-toggle'
import { defaultApiErrorHandler } from '@app/errors'
import usePersistedViewMode from '@app/hooks/use-persisted-view-mode'
import useTeamRoutes from '@app/hooks/use-team-routes'
import useWebSocket from '@app/hooks/use-websocket'
import {
  AddImagesMessage,
  ContainerConfigData,
  DeleteImageMessage,
  DeploymentDetails,
  GetImageMessage,
  ImageMessage,
  ImagesAddedMessage,
  ImagesWereReorderedMessage,
  ImageTagMessage,
  OrderImagesMessage,
  PatchVersionImage,
  RegistryImages,
  RegistryImageTag,
  RegistryImageTagsMessage,
  VersionDetails,
  VersionImage,
  VersionSectionsState,
  WebSocketSaveState,
  WS_TYPE_ADD_IMAGES,
  WS_TYPE_GET_IMAGE,
  WS_TYPE_IMAGE,
  WS_TYPE_IMAGE_DELETED,
  WS_TYPE_IMAGE_TAG_UPDATED,
  WS_TYPE_IMAGES_ADDED,
  WS_TYPE_IMAGES_WERE_REORDERED,
  WS_TYPE_ORDER_IMAGES,
  WS_TYPE_PATCH_CONFIG,
  WS_TYPE_PATCH_RECEIVED,
  WS_TYPE_REGISTRY_FETCH_IMAGE_TAGS,
  WS_TYPE_REGISTRY_IMAGE_TAGS,
  WS_TYPE_SET_IMAGE_TAG,
} from '@app/models'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useState } from 'react'
import useCopyDeploymentState from '../../deployments/use-copy-deployment-state'

// state
export type ImageTagsMap = Record<string, Record<string, RegistryImageTag[]>> // registryId to imageName to RegistryImageTag list

export type VersionAddSection = 'image' | 'deployment' | 'copy-deployment' | 'none'

const VERSION_SECTIONS_STATE_VALUES = ['images', 'deployments', 'reorder'] as const
export type VersionSection = (typeof VERSION_SECTIONS_STATE_VALUES)[number]

const ADD_SECTION_TO_SECTION: Record<VersionAddSection, VersionSection> = {
  image: 'images',
  deployment: 'deployments',
  'copy-deployment': 'deployments',
  none: 'images',
}

export type VerionState = {
  projectId: string
  saveState: WebSocketSaveState
  addSection: VersionAddSection
  section: VersionSection
  tags: ImageTagsMap
  editor: EditorState
  viewMode: ViewMode
  versionSock: WebSocketClientEndpoint
  version: VersionDetails
  copyDeploymentTarget: DeploymentDetails
}

// actions
export type VersionActions = {
  selectAddSection: (addSection: VersionAddSection) => void
  discardAddSection: VoidFunction
  setSection: (section: VersionSection) => void
  addImages: (images: RegistryImages[]) => void
  orderImages: (imgs: VersionImage[]) => void
  selectViewMode: (mode: ViewMode) => void
  fetchImageTags: (image: VersionImage) => void
  selectTagForImage: (image: VersionImage, tag: string) => void
  updateImageConfig: (image: VersionImage, config: Partial<ContainerConfigData>) => void
  copyDeployment: (deploymentId: string) => Promise<any>
  onDeploymentDeleted: (deploymentId: string) => void
}

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

export type VersionStateOptions = {
  projectId: string
  version: VersionDetails
  initialSection: VersionSectionsState
  setSaveState?: (saveState: WebSocketSaveState) => void
}

export const selectTagsOfImage = (state: VerionState, image: VersionImage): RegistryImageTag[] | null => {
  const images = state.tags[image.registry.id]
  if (!images) {
    return null
  }

  const tags = images[image.name]
  return tags ?? null
}

export const useVersionState = (options: VersionStateOptions): [VerionState, VersionActions] => {
  const { projectId, version: optionsVersion, setSaveState: optionsSetSaveState, initialSection } = options

  const { t } = useTranslation('versions')
  const handleApiError = defaultApiErrorHandler(t)

  const routes = useTeamRoutes()

  const [saveState, setSaveState] = useState<WebSocketSaveState>(null)
  const [section, setSection] = useState(initialSection)
  const [addSection, setAddSection] = useState<VersionAddSection>('none')
  const [version, setVersion] = useState(optionsVersion)
  const [tags, setTags] = useState<ImageTagsMap>({})
  const [viewMode, setViewMode] = usePersistedViewMode({ initialViewMode: 'list', pageName: 'versions' })
  const [copyDeploymentTarget, setCopyDeploymentTarget] = useCopyDeploymentState({
    handleApiError,
  })

  useEffect(() => {
    if (optionsSetSaveState) {
      optionsSetSaveState(saveState)
    }
  }, [saveState, optionsSetSaveState])

  const versionSock = useWebSocket(routes.project.versions(projectId).detailsSocket(version.id), {
    onOpen: viewMode !== 'tile' ? null : () => setSaveState('connected'),
    onClose: viewMode !== 'tile' ? null : () => setSaveState('disconnected'),
    onSend: message => {
      if (message.type === WS_TYPE_SET_IMAGE_TAG || message.type === WS_TYPE_PATCH_CONFIG) {
        setSaveState('saving')
      }
    },
    onReceive: message => {
      if (WS_TYPE_PATCH_RECEIVED === message.type) {
        setSaveState('saved')
      }
    },
  })

  const editor = useEditorState(versionSock)

  const registriesSock = useWebSocket(routes.registry.socket())

  registriesSock.on(WS_TYPE_REGISTRY_IMAGE_TAGS, (message: RegistryImageTagsMessage) => {
    if (message.images.length < 1) {
      return
    }

    const newTagMap = { ...tags }
    let images = newTagMap[message.registryId]
    if (!images) {
      images = {}
      newTagMap[message.registryId] = images
    }

    message.images.forEach(img => {
      images[img.name] = img.tags
    })

    setTags(newTagMap)
  })

  versionSock.on(WS_TYPE_IMAGES_WERE_REORDERED, (message: ImagesWereReorderedMessage) => {
    const ids = [...message]

    const newImages = ids.map((id, index) => {
      const image = version.images.find(it => it.id === id)
      return {
        ...image,
        order: index,
      }
    })

    setVersion({ ...version, images: newImages })
  })

  versionSock.on(WS_TYPE_IMAGES_ADDED, (message: ImagesAddedMessage) => {
    const newImages = [...version.images, ...message.images]
    setVersion({ ...version, images: newImages })
  })

  versionSock.on(WS_TYPE_IMAGE, (message: ImageMessage) => {
    const newImages = [...version.images, message]
    setVersion({ ...version, images: newImages })
  })

  versionSock.on(WS_TYPE_IMAGE_TAG_UPDATED, (message: ImageTagMessage) => {
    const index = version.images.findIndex(it => it.id === message.imageId)
    if (index < 0) {
      versionSock.send(WS_TYPE_GET_IMAGE, {
        id: message.imageId,
      } as GetImageMessage)
      return
    }

    const oldImage = version.images[index]

    const image = mergeImagePatch(oldImage, {
      tag: message.tag,
    })

    const newImages = [...version.images]
    newImages[index] = image

    setVersion({ ...version, images: newImages })
  })

  versionSock.on(WS_TYPE_IMAGE_DELETED, (message: DeleteImageMessage) =>
    setVersion({ ...version, images: version.images.filter(it => it.id !== message.imageId) }),
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

    setVersion({ ...version, images: newImages })
    setAddSection('none')
    setSection('images')
  }

  const fetchImageTags = (image: VersionImage) => {
    if (image.registry.type === 'unchecked') {
      return
    }

    const images = tags[image.registry.id]
    if (images && images[image.name]) {
      return
    }

    registriesSock.send(WS_TYPE_REGISTRY_FETCH_IMAGE_TAGS, {
      registryId: image.registry.id,
      images: [image.name],
    })
  }

  const selectViewMode = (mode: ViewMode) => {
    if (mode !== 'tile') {
      setSaveState(null)
    }

    setViewMode(mode)
  }

  const selectTagForImage = (image: VersionImage, tag: string) => {
    const newImages = [...version.images]
    const index = newImages.findIndex(it => it.id === image.id)

    if (index < 0) {
      return
    }

    newImages[index] = {
      ...image,
      tag,
    }

    setVersion({ ...version, images: newImages })

    versionSock.send(WS_TYPE_SET_IMAGE_TAG, {
      imageId: image.id,
      tag,
    } as ImageTagMessage)
  }

  const updateImageConfig = (image: VersionImage, config: Partial<ContainerConfigData>) => {
    setSaveState('saving')

    const newImages = [...version.images]
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

    setVersion({ ...version, images: newImages })
  }

  const copyDeployment = async (deploymentId: string) => {
    await setCopyDeploymentTarget(deploymentId)
    setAddSection('copy-deployment')
  }

  const onDeploymentDeleted = (deploymentId: string) =>
    setVersion({
      ...version,
      deployments: version.deployments.filter(it => it.id !== deploymentId),
    })

  return [
    {
      projectId,
      addSection,
      section,
      version,
      editor,
      saveState,
      tags,
      viewMode,
      versionSock,
      copyDeploymentTarget,
    },
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
      copyDeployment,
      onDeploymentDeleted,
    },
  ]
}
