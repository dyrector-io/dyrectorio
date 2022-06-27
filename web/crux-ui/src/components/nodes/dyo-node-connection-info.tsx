import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import RemainingTimeLabel from '@app/elements/remaining-time-label'
import { DyoNode } from '@app/models'
import useTranslation from 'next-translate/useTranslation'
import NodeStatusIndicator from './node-status-indicator'

interface DyoNodeConnectionInfoProps {
  node: DyoNode
}

const DyoNodeConnectionInfo = (props: DyoNodeConnectionInfoProps) => {
  const { t } = useTranslation('nodes')

  const { node } = props

  const now = new Date().getTime()
  const runningSince =
    node.status === 'running' && node.connectedAt ? (now - new Date(node.connectedAt).getTime()) / 1000 : null // in seconds

  return (
    <div className="flex flex-col flex-grow">
      <DyoHeading element="h5" className="text-lg text-bright mt-auto">
        {t('connection')}
      </DyoHeading>

      <div className="grid grid-cols-2 max-w-sm">
        <DyoLabel>{t('address')}</DyoLabel>

        <span className="text-light-eased">{node.address}</span>

        <DyoLabel>{t('status')}</DyoLabel>

        <div className="flex flex-row">
          <span className="text-light-eased">{t(`common:nodeStatuses.${node.status}`)}</span>

          <NodeStatusIndicator className="ml-4" status={node.status} />
        </div>

        <DyoLabel>{t('uptime')}</DyoLabel>

        {runningSince ? <RemainingTimeLabel textColor="text-dyo-turquoise" seconds={runningSince} /> : null}
      </div>
    </div>
  )
}

export default DyoNodeConnectionInfo
