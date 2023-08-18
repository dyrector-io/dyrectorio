import DyoIndicator from '@app/elements/dyo-indicator'
import useTranslation from 'next-translate/useTranslation'

const colorOfStatus = (present?: boolean) => {
  switch (present) {
    case false:
      return 'bg-dyo-red'
    case true:
      return 'bg-dyo-green'
    default:
      return 'bg-dyo-gray'
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
  const { className, present } = props

  const { t } = useTranslation('common')

  return <DyoIndicator className={className} color={colorOfStatus(present)} title={t(altOfStatus(present))} />
}

export default SecretStatus
