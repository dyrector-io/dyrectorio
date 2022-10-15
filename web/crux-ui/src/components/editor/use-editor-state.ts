import {
  Editor,
  EditorJoinedMessage,
  EditorLeftMessage,
  EditorsMessage,
  InputEditorsMap,
  InputFocusChangeMessage,
  WS_TYPE_ALL_ITEM_EDITORS,
  WS_TYPE_EDITOR_IDENTITY,
  WS_TYPE_EDITOR_JOINED,
  WS_TYPE_EDITOR_LEFT,
  WS_TYPE_INPUT_BLURED,
  WS_TYPE_INPUT_FOCUSED,
} from '@app/models'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import { useState } from 'react'

export type EditorStateOptions = {
  me: Editor
  editors: Editor[]
  inputEditors: InputEditorsMap
  sock: WebSocketClientEndpoint
}

export type EditorState = {
  me: Editor
  editors: Editor[]
}

export const selectInputEditorsForItem = (state: EditorState, itemId: string): InputEditorsMap => {
  const { editors } = state

  const result: InputEditorsMap = {}

  editors.forEach(it => {
    if (it.focusedItemId === itemId && it.focusedInputId) {
      let editorIds = result[it.focusedInputId]
      if (!editorIds) {
        editorIds = []
        result[it.focusedInputId] = editorIds
      }

      editorIds.push(it.id)
    }
  })

  return result
}

const useEditorState = (sock: WebSocketClientEndpoint): EditorState => {
  const [me, setMe] = useState<Editor>(null)
  const [editors, setEditors] = useState<Editor[]>([])

  sock.on(WS_TYPE_EDITOR_IDENTITY, (message: EditorJoinedMessage) => setMe(message))
  sock.on(WS_TYPE_ALL_ITEM_EDITORS, (message: EditorsMessage) => setEditors(message.editors))

  sock.on(WS_TYPE_EDITOR_JOINED, (message: EditorJoinedMessage) => {
    if (editors.find(it => it.id === message.id)) {
      return
    }

    setEditors([...editors, message])
  })

  sock.on(WS_TYPE_EDITOR_LEFT, (message: EditorLeftMessage) => {
    if (!editors.find(it => it.id === message.userId)) {
      return
    }

    setEditors([...editors].filter(it => it.id !== message.userId))
  })

  sock.on(WS_TYPE_INPUT_FOCUSED, (message: InputFocusChangeMessage) => {
    const index = editors.findIndex(it => it.id === message.userId)
    if (index < 0) {
      return
    }

    const newEditors = [...editors]
    const editor = newEditors[index]
    newEditors[index] = {
      ...editor,
      focusedItemId: message.itemId,
      focusedInputId: message.inputId,
    }

    setEditors(newEditors)
  })

  sock.on(WS_TYPE_INPUT_BLURED, (message: InputFocusChangeMessage) => {
    const index = editors.findIndex(it => it.id === message.userId)
    if (index < 0) {
      return
    }

    const newEditors = [...editors]
    const editor = newEditors[index]
    newEditors[index] = {
      ...editor,
      focusedItemId: null,
      focusedInputId: null,
    }

    setEditors(newEditors)
  })

  return {
    me,
    editors,
  }
}

export default useEditorState
