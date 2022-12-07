import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

const assetOfStatus = (present?: boolean) => {
  switch (present) {
    case false:
      return '/circle-red.svg'
    case true:
      return '/circle-green.svg'
    default:
      return '/circle-gray.svg'
  }
}

const altOfStatus = (present?: boolean) => {
  switch (present) {
    case false:
      return 'secretStatuses.missing'
    case true:
      return 'secretStatuses.present'
    default:
      return 'secretStatuses.unknown'
  }
}

interface SecretStatusProps {
  className?: string
  present?: boolean
}

const SecretStatus = (props: SecretStatusProps) => {
  const { t } = useTranslation()
  const { className, present } = props

  return (
    <Image className={className} alt={t(altOfStatus(present))} src={assetOfStatus(present)} width={16} height={16} />
  )
}

export default SecretStatus
