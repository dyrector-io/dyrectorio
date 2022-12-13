import DyoIcon from '@app/elements/dyo-icon'
import useTranslation from 'next-translate/useTranslation'

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
  const { t } = useTranslation('common')
  const { className, present } = props

  return <DyoIcon className={className} alt={t(altOfStatus(present))} src={assetOfStatus(present)} />
}

export default SecretStatus
