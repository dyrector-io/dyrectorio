import { Injectable, Scope } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { nameOfIdentity } from 'src/domain/identity'
import EditorColorProvider from './editor.color.provider'
import { EditorLeftMessage, EditorMessage, InputFocusChangeMessage, InputFocusMessage } from './editor.message'

@Injectable({
  scope: Scope.TRANSIENT,
})
export default class EditorService {
  private editors: Map<string, EditorMessage> = new Map()

  constructor(private readonly colors: EditorColorProvider) {}

  get editorCount(): number {
    return this.editors.size
  }

  getEditors(): EditorMessage[] {
    return Array.from(this.editors.values())
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
    const editors: [string, EditorMessage][] = Array.from(this.editors.entries()).map(entry => {
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

    this.editors = new Map(editors)
  }

  onClientJoin(token: string, user: Identity): EditorMessage {
    const editor = this.editorFromIdentity(token, user)
    this.editors.set(token, editor)

    return editor
  }

  onClientLeft(token: string): EditorLeftMessage {
    this.colors.free(token)

    const editor = this.editors.get(token)
    if (!editor) {
      return null
    }

    this.editors.delete(token)

    return {
      id: token,
      focusedItemId: editor.focusedItemId,
      focusedInputId: editor.focusedInputId,
    }
  }

  private editorFromIdentity(token: string, user: Identity): EditorMessage {
    return {
      id: token,
      name: nameOfIdentity(user),
      color: this.colors.generateOrGet(token),
    }
  }
}
