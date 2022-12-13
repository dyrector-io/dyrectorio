import DyoIcon from '@app/elements/dyo-icon'
import { ContainerState } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

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

interface ContainerStatusIndicatorProps {
  className?: string
  state: ContainerState
}

const ContainerStatusIndicator = (props: ContainerStatusIndicatorProps) => {
  const { state, className } = props

  const { t } = useTranslation('common')

  return (
    <DyoIcon
      className={className}
      src={state ? `/${statusToAssetName(state)}.svg` : `/circle-bright.svg`}
      alt={state ? t(`containerStatuses.${state}`) : t('errors:notFound')}
    />
  )
}

export default ContainerStatusIndicator
