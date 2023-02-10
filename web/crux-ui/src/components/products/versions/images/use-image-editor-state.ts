import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { DyoConfirmationModalConfig } from '@app/elements/dyo-modal'
import useConfirmation from '@app/hooks/use-confirmation'
import { useThrottling } from '@app/hooks/use-throttleing'
import {
  ContainerConfigData,
  DeleteImageMessage,
  PatchImageMessage,
  VersionImage,
  WS_TYPE_DELETE_IMAGE,
  WS_TYPE_PATCH_IMAGE,
} from '@app/models'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import { useRef, useState } from 'react'
import { ImagesActions, ImagesState, selectTagsOfImage } from './use-images-state'

export type ImageEditorSection = 'tag' | 'config' | 'json'

export type ImageEditorState = {
  image: VersionImage
  section: ImageEditorSection
  tags: string[]
  parseError: string
  deleteModal: DyoConfirmationModalConfig
  imageEditorSock: WebSocketClientEndpoint
}

export type ImageEditorActions = {
  selectSection: (section: ImageEditorSection) => void
  selectTag: (tag: string) => void
  onPatch: (config: Partial<ContainerConfigData>) => void
  deleteImage: VoidFunction
  setParseError: (error: Error) => void
}

export type ImageEditorStateOptions = {
  image: VersionImage
  imagesState: ImagesState
  imagesActions: ImagesActions
  sock: WebSocketClientEndpoint
}

const useImageEditorState = (options: ImageEditorStateOptions): [ImageEditorState, ImageEditorActions] => {
  const { image, imagesState, imagesActions, sock } = options

  const [section, setSection] = useState<ImageEditorSection>('config')
  const [deleteModal, confirmDelete] = useConfirmation()
  const [parseError, setParseError] = useState<string>(null)

  const patch = useRef<Partial<ContainerConfigData>>({})
  const throttle = useThrottling(IMAGE_WS_REQUEST_DELAY)

  const tags = selectTagsOfImage(imagesState, image)

  const selectSection = (it: ImageEditorSection) => {
    if (it === 'tag') {
      imagesActions.fetchImageTags(image)
    }

    setSection(it)
  }

  const selectTag = (tag: string) => imagesActions.selectTagForImage(image, tag)

  const onPatch = (config: Partial<ContainerConfigData>) => {
    setParseError(null)
    imagesActions.updateImageConfig(image, config)

    const newPatch = {
      ...patch.current,
      ...config,
    }
    patch.current = newPatch

    throttle(() => {
      sock.send(WS_TYPE_PATCH_IMAGE, {
        id: image.id,
        config: patch.current,
      } as PatchImageMessage)

      patch.current = {}
    })
  }

  const deleteImage = () =>
    confirmDelete(() =>
      sock.send(WS_TYPE_DELETE_IMAGE, {
        imageId: image.id,
      } as DeleteImageMessage),
    )

  return [
    {
      image,
      section,
      tags,
      deleteModal,
      parseError,
      imageEditorSock: sock,
    },
    {
      selectSection,
      selectTag,
      onPatch,
      deleteImage,
      setParseError: (err: Error) => setParseError(err.message),
    },
  ]
}

export default useImageEditorState
