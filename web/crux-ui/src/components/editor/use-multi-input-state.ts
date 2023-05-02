import useRepatch from '@app/hooks/use-repatch'
import {
  Editor,
  InputEditorsMap,
  InputFocusChangeMessage,
  InputFocusMessage,
  WS_TYPE_BLUR_INPUT,
  WS_TYPE_FOCUS_INPUT,
  WS_TYPE_INPUT_BLURRED,
  WS_TYPE_INPUT_FOCUSED,
} from '@app/models'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import { useEffect } from 'react'

export type EditorMergeFunction<T> = (remote: T, local: T) => T
export type EditorCompareFunction<T> = (one: T, other: T) => boolean
export const DEFAULT_EDITOR_COMPARATOR = <T>(one: T, other: T) => one === other

export type MultiInputState<T> = {
  highlightColor?: string
  value: T
}

export type MultiInputActions<T> = {
  onFocus: VoidFunction
  onBlur: VoidFunction
  onChange: (local: T) => void
}

export type MultiInputEditorOptions = {
  itemId: string
  me: Editor
  editors: Editor[]
  inputEditors: InputEditorsMap
  sock: WebSocketClientEndpoint
}

export type MultiInputStateOptions<T> = {
  id: string
  value: T
  onMergeValues: EditorMergeFunction<T>
  editorOptions: MultiInputEditorOptions
  disabled?: boolean
  onCompareValues?: EditorCompareFunction<T>
}

type InternalState<T> = {
  editorIds: string[]
  focused: boolean
  local: T
  remote: T
}

const addUser =
  (userId: string) =>
  <T>(state: InternalState<T>): InternalState<T> => {
    const { editorIds } = state
    const found = editorIds.includes(userId)

    return found
      ? state
      : {
          ...state,
          editorIds: [...editorIds, userId],
        }
  }

const removeUser =
  (userId: string) =>
  <T>(state: InternalState<T>): InternalState<T> => {
    const { editorIds } = state
    const newIds = editorIds.filter(it => it !== userId)

    return editorIds.length === newIds.length
      ? state
      : {
          ...state,
          editorIds: newIds,
        }
  }

const setEditors =
  (newIds: string[]) =>
  <T>(state: InternalState<T>): InternalState<T> => {
    const oldIds = state.editorIds

    if (!newIds) {
      return {
        ...state,
        editorIds: [],
      }
    }

    if (oldIds.length !== newIds.length) {
      return {
        ...state,
        editorIds: newIds,
      }
    }

    for (let i = 0; i < oldIds.length; i++) {
      if (oldIds[i] !== newIds[i]) {
        return {
          ...state,
          editorIds: newIds,
        }
      }
    }

    return state
  }

const focusInput =
  <T>(me: Editor) =>
  (state: InternalState<T>): InternalState<T> => {
    const newState = !me ? state : addUser(me.id)(state)

    return {
      ...newState,
      focused: true,
      local: state.remote,
    }
  }

const blurInput =
  <T>(me: Editor, newValue: T) =>
  (state: InternalState<T>): InternalState<T> => {
    const newState = !me ? state : removeUser(me.id)(state)

    return {
      ...newState,
      focused: false,
      local: null,
      remote: newValue,
    }
  }

const identityReceived =
  <T>(me: Editor) =>
  (state: InternalState<T>): InternalState<T> => {
    if (!me || !state.focused || !state.local) {
      return state
    }

    return addUser(me.id)(state)
  }

const setLocal =
  <T>(local: T, compare: EditorCompareFunction<T>) =>
  (state: InternalState<T>): InternalState<T> =>
    compare(state.local, local)
      ? state
      : {
          ...state,
          local,
        }

const setRemote =
  <T>(remote: T, compare: EditorCompareFunction<T>) =>
  (state: InternalState<T>): InternalState<T> =>
    compare(state.remote, remote)
      ? state
      : {
          ...state,
          remote,
        }

// selectors
const selectHighlightColor = (state: string[], allEditors: Editor[], me: Editor): string => {
  const otherEditors = state.filter(it => it !== me?.id)
  if (otherEditors.length < 1) {
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

const useMultiInputState = <T>(options: MultiInputStateOptions<T>): [MultiInputState<T>, MultiInputActions<T>] => {
  const { id, onMergeValues, value, disabled, onCompareValues, editorOptions } = options
  const { me, editors, inputEditors, sock } = editorOptions

  const editorIds = inputEditors[id]

  const compareValues = onCompareValues ?? DEFAULT_EDITOR_COMPARATOR

  const [state, dispatch] = useRepatch<InternalState<T>>({
    editorIds: editorIds ?? [],
    focused: false,
    local: value,
    remote: null,
  })

  // dispatch should not be in useEffect()'s dependency array, but react-hooks/exhaustive-deps
  // determines stable hook return values from a hardcoded list.
  // (eg. useReducer's second return arg is stable)
  // Someone forked the eslint plugin to fix this, but it was not merged for three years now. :)
  // https://github.com/facebook/react/issues/16873
  useEffect(() => dispatch(setEditors(editorIds)), [editorIds, dispatch])
  useEffect(() => dispatch(setRemote(value, compareValues)), [value, compareValues, dispatch])
  useEffect(() => dispatch(identityReceived(me)), [me, dispatch])

  let onFocus: VoidFunction = null
  let onBlur: VoidFunction = null
  let onChange = (_: T) => {}
  let highlightColor: string = null

  if (!disabled) {
    sock.on(WS_TYPE_INPUT_FOCUSED, (message: InputFocusChangeMessage) => {
      if (!filterInputMessage(message, id)) {
        return
      }

      dispatch(addUser(message.userId))
    })

    sock.on(WS_TYPE_INPUT_BLURRED, (message: InputFocusChangeMessage) => {
      if (!filterInputMessage(message, id)) {
        return
      }

      dispatch(removeUser(message.userId))
    })

    onFocus = () => {
      dispatch(focusInput(me))

      sock.send(WS_TYPE_FOCUS_INPUT, {
        inputId: id,
      } as InputFocusMessage)
    }

    onBlur = () => {
      sock.send(WS_TYPE_BLUR_INPUT, {
        inputId: id,
      } as InputFocusMessage)

      const newValue = onMergeValues(state.remote, state.local)
      dispatch(blurInput(me, newValue))
    }

    onChange = (local: T) => dispatch(setLocal(local, compareValues))

    highlightColor = selectHighlightColor(state.editorIds, editors, me)
  }

  return [
    {
      highlightColor,
      value: state.focused ? state.local : state.remote,
    },
    {
      onFocus,
      onBlur,
      onChange,
    },
  ]
}

export default useMultiInputState
