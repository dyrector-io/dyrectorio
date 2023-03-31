import DyoIcon from '@app/elements/dyo-icon'
import { NodeStatus } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

const statusToAssetName = (status: NodeStatus) => {
  switch (status) {
    case 'unreachable':
      return 'circle-red'
    case 'connected':
      return 'circle-green'
    default:
      return 'circle-orange'
  }
}

interface NodeStatusStatusIndicatorProps {
  className?: string
  status: NodeStatus
}

const NodeStatusIndicator = (props: NodeStatusStatusIndicatorProps) => {
  const { status, className } = props

  const { t } = useTranslation('common')

  return <DyoIcon className={className} src={`/${statusToAssetName(status)}.svg`} alt={t(`nodeStatuses.${status}`)} />
}

export default NodeStatusIndicator
