import { NodeStatus } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

const statusToAssetName = (status: NodeStatus) => {
  switch (status) {
    case 'unreachable':
      return 'circle-red'
    case 'running':
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

  return (
    <div className={clsx(className, 'flex')}>
      <Image src={`/${statusToAssetName(status)}.svg`} alt={t(`nodeStatuses.${status}`)} width={16} height={16} />
    </div>
  )
}

export default NodeStatusIndicator
