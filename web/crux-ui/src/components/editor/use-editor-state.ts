import useRepatch from '@app/hooks/use-repatch'
import {
  Editor,
  InputEditorsMap,
  InputFocusChangeMessage,
  InputFocusMessage,
  WS_TYPE_BLUR_INPUT,
  WS_TYPE_FOCUS_INPUT,
  WS_TYPE_INPUT_BLURED,
  WS_TYPE_INPUT_FOCUSED,
} from '@app/models'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import { useEffect } from 'react'

export type EditorState = {
  highlightColor?: string
  focused: boolean
  value: string
}

export type EditorActions = {
  onFocus: VoidFunction
  onBlur: VoidFunction
}

export type EditorOptions = {
  me: Editor
  editors: Editor[]
  inputEditors: InputEditorsMap
  sock: WebSocketClientEndpoint
}

const addUser = (userId: string) => (state: string[]) => {
  const found = state.includes(userId)
  return !found ? [...state, userId] : state
}

const removeUser = (userId: string) => (state: string[]) => state.filter(it => it !== userId)

const setEditors =
  (editorIds: string[]) =>
  (state: string[]): string[] => {
    if (!editorIds) {
      return []
    }

    if (state.length !== editorIds.length) {
      return editorIds
    }

    for (let i = 0; i < state.length; i++) {
      if (state[i] !== editorIds[i]) {
        return editorIds
      }
    }

    return state
  }

// selectors
const selectHighlightColor = (state: string[], allEditors: Editor[], me: Editor): string => {
  const otherEditors = state.filter(it => it !== me.id)
  if (otherEditors.length < 0) {
    return null
  }

  const editorId = otherEditors[0]
  const editor = allEditors.find(it => it.id === editorId)
  return editor?.color
}

const filterInputMessage = (message: InputFocusChangeMessage, inputId: string): boolean => {
  if (message.inputId !== inputId) {
    return false
  }

  return true
}

const useEditorState = (id: string, options: EditorOptions, disabled?: boolean): [EditorState, EditorActions] => {
  const { inputEditors, editors, sock, me } = options

  const [editorIds, dispatch] = useRepatch<string[]>([])

  // dispatch should not be in useEffect()'s dependency array, but react-hooks/exhaustive-deps
  // determines stable hook return values from a hardcoded list.
  // (eg. useReducer's second return arg is stable)
  // Someone forked the eslint plugin to fix this, but it was not merged for three years now. :)
  // https://github.com/facebook/react/issues/16873
  useEffect(() => dispatch(setEditors(inputEditors[id])), [inputEditors, id, dispatch])

  let onFocus: VoidFunction = null
  let onBlur: VoidFunction = null
  let focused = false
  let highlightColor: string = null

  if (!disabled) {
    sock.on(WS_TYPE_INPUT_FOCUSED, (message: InputFocusChangeMessage) => {
      if (!filterInputMessage(message, id)) {
        return
      }

      const contains = editorIds.filter(it => it === message.userId).length > 0
      if (contains) {
        return
      }

      dispatch(addUser(message.userId))
    })

    sock.on(WS_TYPE_INPUT_BLURED, (message: InputFocusChangeMessage) => {
      if (!filterInputMessage(message, id)) {
        return
      }

      dispatch(removeUser(message.userId))
    })

    onFocus = () => {
      dispatch(addUser(me.id))

      sock.send(WS_TYPE_FOCUS_INPUT, {
        inputId: id,
      } as InputFocusMessage)
    }

    onBlur = () => {
      dispatch(removeUser(me.id))

      sock.send(WS_TYPE_BLUR_INPUT, {
        inputId: id,
      } as InputFocusMessage)
    }

    focused = !disabled && editorIds.length > 0
    highlightColor = selectHighlightColor(editorIds, editors, me)
  }

  return [
    {
      highlightColor,
      focused,
    },
    {
      onFocus,
      onBlur,
    },
  ]
}

export default useEditorState
