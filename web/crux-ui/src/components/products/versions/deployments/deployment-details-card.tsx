import NodeStatusIndicator from '@app/components/nodes/node-status-indicator'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoLabel } from '@app/elements/dyo-label'
import useWebSocket from '@app/hooks/use-websocket'
import { DeploymentRoot, NodeStatusMessage, WS_TYPE_NODE_STATUS } from '@app/models'
import { WS_NODES } from '@app/routes'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import React, { useState } from 'react'
import DeploymentStatusTag from './deployment-status-tag'

interface DeploymentDetailsCardProps {
  className?: string
  deployment: DeploymentRoot
  children?: React.ReactNode
}

const DeploymentDetailsCard = (props: DeploymentDetailsCardProps) => {
  const { deployment, className, children } = props

  const [nodeStatus, setNodeStatus] = useState(deployment.node.status)
  const sock = useWebSocket(WS_NODES)
  sock.on(WS_TYPE_NODE_STATUS, (message: NodeStatusMessage) => {
    if (message.nodeId !== deployment.nodeId) {
      return
    }

    setNodeStatus(message.status)
  })

  return (
    <DyoCard className={clsx('flex flex-col', className ?? 'p-6')}>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row">
          <NodeStatusIndicator className="mr-2" status={nodeStatus} />
          <DyoLabel>{deployment.node.name}</DyoLabel>
        </div>
        <DyoLabel>{deployment.prefix}</DyoLabel>
        <DeploymentStatusTag className="my-auto" status={deployment.status} />
        <DyoLabel textColor="text-bright">{utcDateToLocale(deployment.updatedAt)}</DyoLabel>
      </div>

      {children}
    </DyoCard>
  )
}

export default DeploymentDetailsCard
