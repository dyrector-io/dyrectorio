import DyoBadge from '@app/elements/dyo-badge'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import TimeLabel from '@app/elements/time-label'
import { DyoNode } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import NodeStatusIndicator from './node-status-indicator'
import useNodeUptime from './use-node-uptime'

interface NodeConnectionCardProps {
  className?: string
  node: DyoNode
  showName?: boolean
}

const NodeConnectionCard = (props: NodeConnectionCardProps) => {
  const { t } = useTranslation('nodes')

  const { node, className, showName } = props

  const runningSince = useNodeUptime(node)

  return (
    <DyoCard className={clsx(className ?? 'p-6')}>
      {!showName ? null : (
        <div className="flex flex-row items-center gap-1 mb-2">
          {node.icon ? (
            <DyoBadge icon={node.icon} />
          ) : (
            <span className="text-bright text-xl">{`${t('common:node')}:`}</span>
          )}

          <DyoHeading
            className={clsx('text-xl text-bright font-semibold truncate my-auto mr-auto', node.icon ? 'ml-4' : null)}
            element="h3"
          >
            {node.name}
          </DyoHeading>
        </div>
      )}

      <div className="grid grid-cols-2 justify-between items-center">
        <DyoLabel>{t('address')}</DyoLabel>
        <span className="text-light-eased">{node.address}</span>

        <DyoLabel className="self-start"> {t('version')}</DyoLabel>
        <span className="text-light-eased">{node.version}</span>

        <DyoLabel>{t('status')}</DyoLabel>
        <div className="flex flex-row">
          <NodeStatusIndicator className="my-auto mr-2" status={node.status} />

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
