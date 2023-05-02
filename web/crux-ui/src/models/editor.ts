export type Editor = {
  id: string
  name: string
  color: string
  focusedItemId?: string
  focusedInputId?: string
}

export type InputEditorsMap = { [key: string]: string[] } // inputId to editorIds

export type InputEditors = {
  inputId: string
  editorIds: string[]
}

export const WS_TYPE_EDITOR_INIT = 'editor-init'
export type EditorInitMessage = {
  meId: string
  editors: Editor[]
}

export const WS_TYPE_EDITOR_JOINED = 'editor-joined'
export type EditorJoinedMessage = Editor

export const WS_TYPE_EDITOR_LEFT = 'editor-left'
export type EditorLeftMessage = {
  id: string
  focusedItemId?: string
  focusedInputId?: string
}

export const WS_TYPE_FOCUS_INPUT = 'focus-input'
export const WS_TYPE_BLUR_INPUT = 'blur-input'
export type InputFocusMessage = {
  itemId: string
  inputId: string
}

export const WS_TYPE_INPUT_FOCUSED = 'input-focused'
export const WS_TYPE_INPUT_BLURRED = 'input-blured'
export type InputFocusChangeMessage = InputFocusMessage & {
  userId: string
  itemId: string
}

export const editIdOf = (itemId: string, inputId: string) => `${itemId}-${inputId}`

export const selectEditorById = (editors: Editor[], id: string) => editors.find(it => it.id === id)

export const initialsOf = (name: string): string => {
  if (!name || name.length < 1) {
    return '?'
  }
  const names = name.trim().split(' ')

  if (names.length === 1) {
    return name.substring(0, 2).toUpperCase()
  }

  const firstName = names[0][0]
  const lastName = names[names.length - 1][0]
  return `${firstName}${lastName}`.toUpperCase()
}
