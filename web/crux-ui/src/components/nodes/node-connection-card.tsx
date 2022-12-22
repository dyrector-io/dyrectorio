import { HOUR_IN_SECONDS, SECOND_IN_MILLIS } from '@app/const'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import TimeLabel from '@app/elements/time-label'
import { DyoNode } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useRef, useState } from 'react'
import NodeStatusIndicator from './node-status-indicator'

interface NodeConnectionCardProps {
  className?: string
  node: DyoNode
  showName?: boolean
}

const NodeConnectionCard = (props: NodeConnectionCardProps) => {
  const { t } = useTranslation('nodes')

  const { node, className, showName } = props

  const [runningSince, setRunningSince] = useState(null)

  const timer = useRef(null)
  const interval = useRef(SECOND_IN_MILLIS)

  const updateRunningSince = () => {
    if (node.status !== 'running') {
      setRunningSince(null)
    } else {
      const now = new Date().getTime()
      const secondsSinceConnected = node.connectedAt
        ? (now - new Date(node.connectedAt).getTime()) / SECOND_IN_MILLIS
        : null

      if (secondsSinceConnected > HOUR_IN_SECONDS && interval.current === SECOND_IN_MILLIS) {
        clearInterval(timer.current)
        timer.current = setInterval(updateRunningSince, (interval.current = SECOND_IN_MILLIS * 60))
      }

      setRunningSince(secondsSinceConnected)
    }
  }

  useEffect(() => {
    timer.current = setInterval(updateRunningSince, interval.current)
    updateRunningSince()
    return () => clearInterval(timer.current)
  }, [])

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
      </div>
    </DyoCard>
  )
}

export default NodeConnectionCard
