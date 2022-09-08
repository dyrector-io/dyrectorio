import { DeploymentStatus } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

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

interface DeploymentStatusIndicatorProps {
  className?: string
  status: DeploymentStatus
}

const DeploymentStatusIndicator = (props: DeploymentStatusIndicatorProps) => {
  const { status, className } = props

  const { t } = useTranslation('common')

  const asset = statusToAssetName(status)

  return (
    <div className={clsx(className, 'flex')}>
      <Image src={`/${asset}.svg`} alt={t(`deploymentStatuses.${status}`)} width={16} height={16} />
    </div>
  )
}

export default DeploymentStatusIndicator
