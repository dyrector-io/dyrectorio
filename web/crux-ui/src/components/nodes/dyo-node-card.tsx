import DyoBadge from '@app/elements/dyo-badge'
import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoNode } from '@app/models'
import clsx from 'clsx'
import React from 'react'
import NodeStatusIndicator from './node-status-indicator'

interface DyoNodeCardProps extends Omit<DyoCardProps, 'children'> {
  node: DyoNode
  onNameClick?: () => void
}

const DyoNodeCard = (props: DyoNodeCardProps) => {
  const { node, onNameClick } = props

  return (
    <>
      <DyoCard className={clsx(props.className ?? 'p-6', 'flex flex-col')}>
        <div className={clsx(onNameClick ? 'cursor-pointer' : null, 'flex flex-row flex-grow')} onClick={onNameClick}>
          {node.icon ? <DyoBadge icon={node.icon} /> : null}

          <DyoHeading className="text-xl text-bright font-semibold ml-4 my-auto mr-auto" element="h3">
            {node.name}
          </DyoHeading>

          <NodeStatusIndicator status={node.status} />
        </div>

        <DyoLabel className="mr-auto my-6">{node.address}</DyoLabel>

        <p className="text-light overflow-hidden">{node.description}</p>
      </DyoCard>
    </>
  )
}

export default DyoNodeCard
