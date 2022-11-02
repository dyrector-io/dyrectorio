import useWebSocket from '@app/hooks/use-websocket'
import { DyoNode, DyoNodeDetails, NodeConnection, nodeConnectionOf, WS_TYPE_NODE_STATUS } from '@app/models'
import { WS_NODES } from '@app/routes'
import { WsMessage } from '@app/websockets/common'
import { useState } from 'react'

const filterWsNodeId = (nodeId: string) => (message: WsMessage<any>) => {
  const { payload } = message

  if (payload?.nodeId !== nodeId) {
    return null
  }

  return message
}

const useNodeState = <T extends DyoNode | DyoNodeDetails>(initialState: T): [T, (node: T) => void] => {
  const [node, setNode] = useState<T>(initialState)
  const [connection, setConnection] = useState<NodeConnection>(nodeConnectionOf(node))

  const sock = useWebSocket(WS_NODES, {
    transformReceive: filterWsNodeId(node.id),
  })

  sock.on(WS_TYPE_NODE_STATUS, setConnection)

  return [{ ...node, ...connection }, setNode]
}

export default useNodeState
