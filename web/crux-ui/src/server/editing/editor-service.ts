import {
  Editor,
  EditorLeftMessage,
  EditorsMessage,
  InputFocusChangeMessage,
  InputFocusMessage,
  nameOfIdentity,
} from '@app/models'
import { Identity } from '@ory/kratos-client'
import ColorProvider from './color-provider'

class EditorService {
  private editors: Map<string, Editor> = new Map() // token to editor

  private colors = new ColorProvider()

  getEditors(): EditorsMessage {
    return {
      editors: Array.from(this.editors.values()),
    }
  }

  onFocus(token: string, message: InputFocusMessage): InputFocusChangeMessage {
    const editor = this.editors.get(token)
    editor.focusedItemId = message.itemId
    editor.focusedInputId = message.inputId
    this.editors.set(token, editor)

    return {
      ...message,
      userId: token,
    }
  }

  onBlur(token: string, message: InputFocusMessage): InputFocusChangeMessage {
    const editor = this.editors.get(token)
    editor.focusedItemId = null
    editor.focusedInputId = null
    this.editors.set(token, editor)

    return {
      ...message,
      userId: token,
    }
  }

  onDeleteItem(itemId: string): void {
    const editors = Array.from(this.editors.entries()).map(entry => {
      // eslint-disable-next-line prefer-const
      let [token, user] = entry
      if (user.focusedItemId === itemId) {
        user = {
          ...user,
          focusedInputId: null,
          focusedItemId: null,
        }
      }

      return [token, user]
    })

    this.editors = new Map(Object.fromEntries(editors))
  }

  onWebSocketConnected(token: string, user: Identity): Editor {
    const editor = this.editorFromIdentity(token, user)
    this.editors.set(token, editor)

    return editor
  }

  onWebSocketDisconnected(token: string): EditorLeftMessage {
    this.colors.free(token)

    const editor = this.editors.get(token)
    if (!editor) {
      return null
    }

    this.editors.delete(token)

    return {
      userId: token,
      focusedItemId: editor.focusedItemId,
      focusedInputId: editor.focusedInputId,
    }
  }

  private editorFromIdentity(token: string, user: Identity): Editor {
    return {
      id: token,
      name: nameOfIdentity(user),
      color: this.colors.generateOrGet(token),
    }
  }
}

export default EditorService
