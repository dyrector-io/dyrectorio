import { ContainerStatus } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

interface ContainerStatusIndicatorProps {
  className?: string
  status: ContainerStatus
}

const ContainerStatusIndicator = (props: ContainerStatusIndicatorProps) => {
  const { status } = props

  const { t } = useTranslation('common')

  return (
    <div className={clsx(props.className, 'flex')}>
      <Image src={`/${statusToAssetName(status)}.svg`} alt={t(`containerStatuses.${status}`)} width={16} height={16} />
    </div>
  )
}

export default ContainerStatusIndicator

const statusToAssetName = (status: ContainerStatus) => {
  switch (status) {
    case 'exited':
    case 'running':
      return 'circle-green'
    case 'dead':
    case 'restarting':
      return 'circle-red'
    case 'removing':
      return 'circle-red-orange'
    default:
      return 'circle-orange'
  }
}
