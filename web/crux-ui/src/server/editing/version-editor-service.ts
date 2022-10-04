import {
  AffectedImage,
  AllImageEditorsMessage,
  Editor,
  ImageEditorLeftMessage,
  ImageEditorsMessage,
  ImageFocusMessage,
  ImageInputFocusChangeMessage,
  nameOfIdentity,
} from '@app/models'
import { Identity } from '@ory/kratos-client'
import ColorProvider from './color-provider'
import EditorTracker from './editor-tracker'

class VersionEditorService {
  private editors: Map<string, Editor> = new Map() // token to editor

  private trackers: Map<string, EditorTracker> = new Map() // imageId to editors

  private colors = new ColorProvider()

  getAllEditors(): AllImageEditorsMessage {
    return {
      editors: Array.from(this.editors.values()),
      imageEditors: Array.from(this.trackers.keys()).map(it => this.getEditorsByImageId(it)),
    }
  }

  getEditorsByImageId(imageId: string): ImageEditorsMessage {
    const tracker = this.trackers.get(imageId)

    return !tracker
      ? null
      : {
          imageId,
          inputs: tracker.getEditors(),
        }
  }

  onFocus(token: string, message: ImageFocusMessage): ImageInputFocusChangeMessage {
    const { imageId } = message

    let tracker = this.trackers.get(imageId)
    if (!tracker) {
      tracker = new EditorTracker()
      this.trackers.set(imageId, tracker)
    }

    tracker.onFocus(message.inputId, token)

    return {
      ...message,
      userId: token,
    }
  }

  onBlur(token: string, message: ImageFocusMessage): ImageInputFocusChangeMessage {
    const { imageId } = message
    const tracker = this.trackers.get(imageId)

    if (!tracker) {
      return null
    }

    const bluredInputId = tracker.onBlur(message.inputId, token)
    if (!tracker.hasEditors()) {
      this.trackers.delete(imageId)
    }

    return bluredInputId
      ? {
          ...message,
          userId: token,
        }
      : null
  }

  onDeleteImage(imageId: string): void {
    this.trackers.delete(imageId)
  }

  onWebSocketConnected(token: string, user: Identity): Editor {
    const editor = this.editorFromIdentity(token, user)
    this.editors.set(token, editor)

    return editor
  }

  onWebSocketDisconnected(token: string): ImageEditorLeftMessage {
    const removableTrackers: string[] = []

    const affectedImages: AffectedImage[] = Array.from(this.trackers.entries()).map(entry => {
      const [imageId, tracker] = entry
      const inputIds = tracker.onWebSocketDisconnected(token)

      if (!tracker.hasEditors()) {
        removableTrackers.push(imageId)
      }

      return {
        imageId,
        affectedInputs: inputIds,
      }
    })

    removableTrackers.forEach(it => this.trackers.delete(it))

    this.editors.delete(token)
    this.colors.free(token)

    return {
      userId: token,
      affectedImages,
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

export default VersionEditorService
