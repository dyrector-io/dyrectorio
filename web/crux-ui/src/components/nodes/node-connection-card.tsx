import { SECOND_IN_MILLIS } from '@app/const'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import TimeLabel from '@app/elements/time-label'
import useInterval from '@app/hooks/use-interval'
import { DyoNode } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import NodeStatusIndicator from './node-status-indicator'

interface NodeConnectionCardProps {
  className?: string
  node: DyoNode
  showName?: boolean
}

const NodeConnectionCard = (props: NodeConnectionCardProps) => {
  const { t } = useTranslation('nodes')

  const { node, className, showName } = props

  const [runningSince, setRunningSince] = useState<number>(null)

  const updateRunningSince = () => {
    if (node.status !== 'connected' || !node.connectedAt) {
      setRunningSince(null)
      return
    }

    const now = Date.now()
    const seconds = (now - new Date(node.connectedAt).getTime()) / 1000
    setRunningSince(Math.ceil(seconds))
  }

  useInterval(updateRunningSince, SECOND_IN_MILLIS)

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
        <span className="text-light-eased">{node.address}</span>

        <DyoLabel> {t('version')}</DyoLabel>
        <span className="text-light-eased">{node.version}</span>

        <DyoLabel>{t('status')}</DyoLabel>
        <div className="flex flex-row">
          <NodeStatusIndicator className="my-auto mr-4" status={node.status} />

          <span className="text-light-eased">{t(`common:nodeStatuses.${node.status}`)}</span>
        </div>

        <DyoLabel>{t('uptime')}</DyoLabel>
        {runningSince ? <TimeLabel textColor="text-dyo-turquoise" seconds={runningSince} /> : null}

        {node.updating && (
          <>
            <DyoLabel>{t('update')}</DyoLabel>
            <span className="text-light-eased">{t('in-progress')}</span>
          </>
        )}
      </div>
    </DyoCard>
  )
}

export default NodeConnectionCard
