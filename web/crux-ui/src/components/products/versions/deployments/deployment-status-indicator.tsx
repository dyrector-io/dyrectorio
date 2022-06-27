import { DeploymentStatus } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

interface DeploymentStatusIndicatorProps {
  className?: string
  status: DeploymentStatus
}

const DeploymentStatusIndicator = (props: DeploymentStatusIndicatorProps) => {
  const { status } = props

  const { t } = useTranslation('common')

  const asset = statusToAssetName(status)

  return (
    <div className={clsx(props.className, 'flex')}>
      <Image src={`/${asset}.svg`} alt={t(`deploymentStatuses.${status}`)} width={16} height={16} />
    </div>
  )
}

export default DeploymentStatusIndicator

const statusToAssetName = (status: DeploymentStatus) => {
  switch (status) {
    case 'successful':
      return 'circle-green'
    case 'failed':
      return 'circle-red'
    case 'obsolate':
      return 'circle-red-orange'
    default:
      return 'circle-orange'
  }
}
