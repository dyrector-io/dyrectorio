import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

interface DyoBadgeProps {
  icon: string
  large?: boolean
}

const DyoBadge = (props: DyoBadgeProps) => {
  const { icon, large } = props

  const size = large ? 32 : 24

  const { t } = useTranslation('badges')

  return <Image src={`/badges/${icon}.svg`} alt={t(`${icon}`)} width={size} height={size} />
}

export default DyoBadge
