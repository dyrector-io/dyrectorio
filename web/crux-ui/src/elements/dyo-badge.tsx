import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

interface DyoBadgeProps {
  icon: string
}

const DyoBadge = (props: DyoBadgeProps) => {
  const { icon } = props

  const { t } = useTranslation('badge')

  return <Image src={`/badges/${icon}.svg`} alt={t(`${icon}`)} width={24} height={24} />
}

export default DyoBadge
