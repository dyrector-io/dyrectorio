import { EditorOptions } from '@app/components/editor/use-editor-state'
import { DyoConfirmationModalConfig } from '@app/elements/dyo-modal'
import useConfirmation from '@app/hooks/use-confirmation'
import useWebSocket from '@app/hooks/use-websocket'
import {
  AllImageEditorsMessage,
  ContainerConfig,
  DeleteImageMessage,
  EditorLeftMessage,
  InputEditorsMap,
  InputEditorsMessage,
  InputFocusMessage,
  PatchImageMessage,
  VersionImage,
  WS_TYPE_ALL_IMAGE_EDITORS,
  WS_TYPE_BLUR_INPUT,
  WS_TYPE_DELETE_IMAGE,
  WS_TYPE_EDITOR_LEFT,
  WS_TYPE_FOCUS_INPUT,
  WS_TYPE_INPUT_BLURED,
  WS_TYPE_INPUT_EDITORS,
  WS_TYPE_INPUT_FOCUSED,
  WS_TYPE_PATCH_IMAGE,
} from '@app/models'
import { WsMessage } from '@app/websockets/common'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import { useState } from 'react'
import { ImagesActions, ImagesState } from './use-images-state'

export type ImageEditorSection = 'tag' | 'config' | 'json'

export type ImageEditorState = {
  image: VersionImage
  section: ImageEditorSection
  tags: string[]
  editor: EditorOptions
  parseError: string
  deleteModal: DyoConfirmationModalConfig
  imageEditorSock: WebSocketClientEndpoint
}

export type ImageEditorActions = {
  selectSection: (section: ImageEditorSection) => void
  selectTag: (tag: string) => void
  patchImage: (config: Partial<ContainerConfig>) => void
  deleteImage: VoidFunction
  setParseError: (error: Error) => void
}

export type ImageEditorOptions = {
  image: VersionImage
  imagesState: ImagesState
  imagesActions: ImagesActions
  versionSock: WebSocketClientEndpoint
}

const transformReceive = (message: WsMessage<any>, imageId: string) => {
  const { type, payload } = message

  if (type === WS_TYPE_INPUT_FOCUSED || type === WS_TYPE_INPUT_BLURED || WS_TYPE_INPUT_EDITORS) {
    return payload.imageId === imageId ? message : null
  }

  if (type === WS_TYPE_ALL_IMAGE_EDITORS) {
    const msg = message as WsMessage<AllImageEditorsMessage>
    const imgEditors = msg.payload.imageEditors.find(it => it.imageId === imageId)

    message.type = WS_TYPE_INPUT_EDITORS
    if (!imgEditors) {
      return null
    }

    return {
      type: WS_TYPE_INPUT_EDITORS,
      payload: imgEditors,
    } as WsMessage<InputEditorsMessage>
  }

  return message
}

const transformInputFocusMessage = (message: WsMessage<any>, imageId: string) => {
  const { type } = message

  if (type === WS_TYPE_FOCUS_INPUT || type === WS_TYPE_BLUR_INPUT) {
    message.payload.imageId = imageId
    return message as WsMessage<InputFocusMessage>
  }

  return message
}

const useImageEditorState = (options: ImageEditorOptions): [ImageEditorState, ImageEditorActions] => {
  const { image, imagesState, imagesActions, versionSock } = options

  const [section, setSection] = useState<ImageEditorSection>('config')
  const [tags, setTags] = useState<string[]>(image.tag ? [image.tag] : [])
  const [editors, setEditors] = useState<InputEditorsMap>({})
  const [deleteModal, confirmDelete] = useConfirmation()
  const [parseError, setParseError] = useState<string>(null)

  const sock = useWebSocket(versionSock.url, {
    transformReceive: it => transformReceive(it, image.id),
    transformSend: it => transformInputFocusMessage(it, image.id),
  })

  sock.on(WS_TYPE_INPUT_EDITORS, (message: InputEditorsMessage) => {
    const entries = message.inputs.map(it => [it.inputId, it.editorIds])
    setEditors(Object.fromEntries(entries))
  })

  sock.on(WS_TYPE_EDITOR_LEFT, (message: EditorLeftMessage) => {
    const newEditors = Object.entries(editors).reduce((result, entry) => {
      const [inputId, editorIds] = entry
      result[inputId] = editorIds.filter(it => it !== message.userId)

      return result
    }, {})

    setEditors(newEditors)
  })

  const editorOptions: EditorOptions = {
    me: imagesState.me,
    editors: imagesState.editors,
    inputEditors: editors,
    sock,
  }

  const selectSection = (it: ImageEditorSection) => {
    if (it === 'tag') {
      const imgTags = imagesActions.getOrFetchImageTags(image)

      if (imgTags) {
        setTags(imgTags.tags)
      }
    }

    setSection(it)
  }

  const selectTag = (tag: string) => imagesActions.selectTagForImage(image, tag)

  const patchImage = (config: Partial<ContainerConfig>) => {
    setParseError(null)

    sock.send(WS_TYPE_PATCH_IMAGE, {
      id: image.id,
      config,
    } as PatchImageMessage)
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
      editor: editorOptions,
      deleteModal,
      parseError,
      imageEditorSock: sock,
    },
    {
      selectSection,
      selectTag,
      patchImage,
      deleteImage,
      setParseError: (err: Error) => setParseError(err.message),
    },
  ]
}

export default useImageEditorState
