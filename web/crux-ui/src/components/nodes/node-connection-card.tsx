import { SECOND_IN_MILLIS } from '@app/const'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import RemainingTimeLabel from '@app/elements/remaining-time-label'
import useTicker from '@app/hooks/use-ticker'
import { DyoNode } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import NodeStatusIndicator from './node-status-indicator'

interface NodeConnectionCardProps {
  className?: string
  node: DyoNode
  showName?: boolean
}

const NodeConnectionCard = (props: NodeConnectionCardProps) => {
  const { t } = useTranslation('nodes')

  const { node, className, showName } = props
  useTicker(SECOND_IN_MILLIS)

  const runningSince =
    node.status !== 'running'
      ? null
      : () => {
          const now = new Date().getTime()
          const secondsSinceConnected = node.connectedAt
            ? (now - new Date(node.connectedAt).getTime()) / SECOND_IN_MILLIS
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
        <span className="text-light-eased">{node.address}</span>

        <DyoLabel> {t('version')}</DyoLabel>
        <span className="text-light-eased">{node.version}</span>

        <DyoLabel>{t('status')}</DyoLabel>
        <div className="flex flex-row">
          <NodeStatusIndicator className="my-auto mr-4" status={node.status} />

          <span className="text-light-eased">{t(`common:nodeStatuses.${node.status}`)}</span>
        </div>

        <DyoLabel>{t('uptime')}</DyoLabel>
        {runningSince ? <RemainingTimeLabel textColor="text-dyo-turquoise" seconds={runningSince()} /> : null}
      </div>
    </DyoCard>
  )
}

export default NodeConnectionCard
