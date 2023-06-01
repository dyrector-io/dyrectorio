import { DyoCard } from '@app/elements/dyo-card'
import { DyoLabel } from '@app/elements/dyo-label'
import TimeLabel from '@app/elements/time-label'
import { NodeDetails, NodeInstall, NodeType } from '@app/models'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import DyoNodeSetup from './dyo-node-setup'
import NodeStatusIndicator from './node-status-indicator'
import useNodeUptime from './use-node-uptime'

export interface NodeInformationCardProps {
  node: NodeDetails
  className?: string
  onNodeEdited: (node: NodeDetails, shouldClose?: boolean) => void
}

const NodeInformationCard = (props: NodeInformationCardProps) => {
  const { className, node, onNodeEdited } = props

  const { t } = useTranslation('nodes')

  const runningSince = useNodeUptime(node)

  const lastConnectedAt = node.status === 'connected' ? node.connectedAt : node.lastConnectionAt

  const onNodeInstallChanged = (install: NodeInstall) => {
    const newNode = {
      ...node,
      install,
    }

    onNodeEdited(newNode)
  }

  const onNodeTypeChanged = (type: NodeType): void => {
    const newNode = {
      ...node,
      type,
    }

    onNodeEdited(newNode)
  }

  return (
    <DyoCard className={clsx(className, 'p-6 flex w-full')}>
      <div className="w-1/2 grid gap-x-2 gap-y-6 grid-cols-[min-content_auto] grid-rows-[repeat(6,_min-content)]">
        <DyoLabel>{t('address')}:</DyoLabel>
        <span className="text-light-eased">{node.address}</span>

        <DyoLabel>{t('status')}:</DyoLabel>
        <span className="text-light-eased">
          <div className="flex flex-row">
            <NodeStatusIndicator className="my-auto mr-2" status={node.status} />

            <span className="text-light-eased">{t(`common:nodeStatuses.${node.status}`)}</span>
          </div>
        </span>

        <DyoLabel>{t('type')}:</DyoLabel>
        <span className="text-light-eased">{t(`technologies.${node.type}`)}</span>

        <DyoLabel>{t('version')}:</DyoLabel>
        <span className="text-light-eased">{node.version}</span>

        <DyoLabel>{t('uptime')}:</DyoLabel>
        {runningSince ? (
          <TimeLabel textColor="text-dyo-turquoise" seconds={runningSince} />
        ) : (
          <span className="text-light-eased">-</span>
        )}

        <DyoLabel className="whitespace-nowrap">{t('lastConnected')}:</DyoLabel>
        <span className="text-light-eased">
          {lastConnectedAt ? utcDateToLocale(lastConnectedAt) : t('common:never')}
        </span>
      </div>
      <div className="w-1/2">
        {node.status !== 'connected' && (
          <DyoNodeSetup node={node} onNodeInstallChanged={onNodeInstallChanged} onNodeTypeChanged={onNodeTypeChanged} />
        )}
      </div>
    </DyoCard>
  )
}

export default NodeInformationCard
