import { SECOND_IN_MILLIS } from '@app/const'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import RemainingTimeLabel from '@app/elements/remaining-time-label'
import useTicker from '@app/hooks/use-ticker'
import useWebSocket from '@app/hooks/use-websocket'
import { DyoNode, NodeConnection, WS_TYPE_NODE_STATUS } from '@app/models'
import { WS_NODES } from '@app/routes'
import { WsMessage } from '@app/websockets/common'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import NodeStatusIndicator from './node-status-indicator'

interface NodeConnectionCardProps {
  className?: string
  node: DyoNode
  showName?: boolean
}

const filterWsNodeId = (nodeId: string) => (message: WsMessage<any>) => {
  const { payload } = message

  if (payload?.nodeId !== nodeId) {
    return null
  }

  return message
}

const NodeConnectionCard = (props: NodeConnectionCardProps) => {
  const { t } = useTranslation('nodes')

  const { node, className, showName } = props

  const [connection, setConnection] = useState<NodeConnection>(node)
  useTicker(SECOND_IN_MILLIS)

  const sock = useWebSocket(WS_NODES, {
    transformReceive: filterWsNodeId(node.id),
  })

  sock.on(WS_TYPE_NODE_STATUS, setConnection)

  const runningSince =
    connection.status !== 'running'
      ? null
      : () => {
          const now = new Date().getTime()
          const secondsSinceConnected = connection.connectedAt
            ? (now - new Date(connection.connectedAt).getTime()) / SECOND_IN_MILLIS
            : null
          return secondsSinceConnected
        }

  return (
    <DyoCard className={clsx(className ?? 'p-6')}>
      {!showName ? null : (
        <DyoHeading
          className={clsx('text-xl text-bright font-semibold my-auto mr-auto', node.icon ? 'ml-4' : null)}
          element="h3"
        >
          {node.name}
        </DyoHeading>
      )}

      <div className="grid grid-cols-2 justify-between items-center">
        <DyoLabel>{t('address')}</DyoLabel>
        <span className="text-light-eased">{connection.address}</span>

        <DyoLabel> {t('version')}</DyoLabel>
        <span className="text-light-eased">{connection.version}</span>

        <DyoLabel>{t('status')}</DyoLabel>
        <div className="flex flex-row">
          <NodeStatusIndicator className="my-auto mr-4" status={connection.status} />

          <span className="text-light-eased">{t(`common:nodeStatuses.${connection.status}`)}</span>
        </div>

        <DyoLabel>{t('uptime')}</DyoLabel>
        {runningSince ? <RemainingTimeLabel textColor="text-dyo-turquoise" seconds={runningSince()} /> : null}
      </div>
    </DyoCard>
  )
}

export default NodeConnectionCard
