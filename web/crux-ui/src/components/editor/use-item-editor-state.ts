import useWebSocket from '@app/hooks/use-websocket'
import { InputFocusMessage, WS_TYPE_BLUR_INPUT, WS_TYPE_FOCUS_INPUT } from '@app/models'
import { WsMessage } from '@app/websockets/common'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import { EditorState, selectInputEditorsForItem } from './use-editor-state'
import { MultiInputEditorOptions } from './use-multi-input-state'

export type ItemEditorState = EditorState & MultiInputEditorOptions

const transformInputFocusMessage = (message: WsMessage<any>, itemId: string) => {
  const { type } = message

  if (type === WS_TYPE_FOCUS_INPUT || type === WS_TYPE_BLUR_INPUT) {
    const msg = message as WsMessage<InputFocusMessage>
    msg.data.itemId = itemId
    return msg
  }

  return message
}

const useItemEditorState = (
  editor: EditorState,
  parentSock: WebSocketClientEndpoint,
  itemId: string,
): ItemEditorState => {
  const sock = useWebSocket(parentSock.path, {
    transformSend: it => transformInputFocusMessage(it, itemId),
  })

  const inputEditors = selectInputEditorsForItem(editor, itemId)

  return {
    ...editor,
    itemId,
    inputEditors,
    sock,
  }
}

export default useItemEditorState
