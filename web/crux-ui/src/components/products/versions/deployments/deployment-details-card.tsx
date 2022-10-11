import NodeStatusIndicator from '@app/components/nodes/node-status-indicator'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoLabel } from '@app/elements/dyo-label'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import React from 'react'
import DeploymentStatusTag from './deployment-status-tag'
import { DeploymentState } from './use-deployment-state'

interface DeploymentDetailsCardProps {
  className?: string
  state: DeploymentState
  children?: React.ReactNode
}

const DeploymentDetailsCard = (props: DeploymentDetailsCardProps) => {
  const { state, className, children } = props
  const { deployment, node } = state

  return (
    <DyoCard className={clsx('flex flex-col', className ?? 'p-6')}>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row">
          <NodeStatusIndicator className="mr-2" status={node.status} />
          <DyoLabel>{node.name}</DyoLabel>
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
