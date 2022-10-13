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

export const WS_TYPE_EDITOR_IDENTITY = 'editor-identity'
export const WS_TYPE_EDITOR_JOINED = 'editor-joined'
export type EditorJoinedMessage = Editor

export const WS_TYPE_EDITOR_LEFT = 'editor-left'
export type EditorLeftMessage = {
  userId: string
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
export const WS_TYPE_INPUT_BLURED = 'input-blured'
export type InputFocusChangeMessage = InputFocusMessage & {
  userId: string
  itemId: string
}

export const WS_TYPE_ALL_ITEM_EDITORS = 'all-item-editors'
export type EditorsMessage = {
  editors: Editor[]
}

export const selectEditorById = (editors: Editor[], id: string) => editors.find(it => it.id === id)

export const initialsOf = (name: string): string => {
  if (!name || name.length < 1) {
    return '?'
  }

  name = name.trim()

  const split = name.split(' ')
  if (split.length > 1) {
    const [first, last] = split
    return `${first[0]}${last[0]}`.toUpperCase()
  }

  if (name.length < 2) {
    return name.toUpperCase()
  }

  return name.substring(0, 2)
}
