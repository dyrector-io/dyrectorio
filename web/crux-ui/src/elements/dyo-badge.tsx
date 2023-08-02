import useTranslation from 'next-translate/useTranslation'
import DyoIcon from './dyo-icon'

interface DyoBadgeProps {
  icon: string
  large?: boolean
}

const DyoBadge = (props: DyoBadgeProps) => {
  const { t } = useTranslation('badges')

  const { icon, large } = props

  return <DyoIcon src={`/badges/${icon}.svg`} alt={t(`${icon}`)} size={large ? 'lg' : 'md'} />
}

export default DyoBadge
