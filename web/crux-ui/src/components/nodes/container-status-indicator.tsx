import { ContainerState } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

interface ContainerStatusIndicatorProps {
  className?: string
  state: ContainerState
}

const ContainerStatusIndicator = (props: ContainerStatusIndicatorProps) => {
  const { state: status } = props

  const { t } = useTranslation('common')

  return (
    <div className={clsx(props.className, 'flex')}>
      <Image src={`/${statusToAssetName(status)}.svg`} alt={t(`containerStatuses.${status}`)} width={16} height={16} />
    </div>
  )
}

export default ContainerStatusIndicator

const statusToAssetName = (status: ContainerState) => {
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
