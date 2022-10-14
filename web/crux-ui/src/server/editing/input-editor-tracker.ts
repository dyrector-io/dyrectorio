import { InputEditors } from '@app/models'

class InputEditorTracker {
  private editors: Map<string, Set<string>> = new Map() // inputId to connectionTokens

  getEditors(): InputEditors[] {
    return Array.from(this.editors.entries()).map(entry => {
      const [inputId, editorIds] = entry

      return {
        inputId,
        editorIds: Array.from(editorIds),
      }
    })
  }

  hasEditors(): boolean {
    return this.editors.size > 0
  }

  onFocus(inputId: string, token: string): void {
    let users = this.editors.get(inputId)
    if (!users) {
      users = new Set()
      this.editors.set(inputId, users)
    }

    users.add(token)
  }

  /**
   * @returns inputId
   */
  onBlur(inputId: string, token: string): string {
    const users = this.editors.get(inputId)
    if (!users) {
      return null
    }

    return this.removeUserFromInput(inputId, users, token)
  }

  /**
   * @returns inputIds
   */
  onWebSocketDisconnected(token: string): string[] {
    const affectedInputIds = Array.from(this.editors.entries())
      .map(entry => {
        const [inputId, users] = entry
        return this.removeUserFromInput(inputId, users, token)
      })
      .filter(it => !!it)

    return affectedInputIds
  }

  private removeUserFromInput(inputId: string, users: Set<string>, token: string): string {
    const deleted = users.delete(token)

    if (users.size < 1) {
      this.editors.delete(inputId)
    }

    return deleted ? inputId : null
  }
}

export default InputEditorTracker
