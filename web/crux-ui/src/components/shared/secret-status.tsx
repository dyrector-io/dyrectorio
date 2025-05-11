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

type SecretStatusProps = {
  className?: string
  defined?: boolean
}

const SecretStatus = (props: SecretStatusProps) => {
  const { className, defined } = props

  const { t } = useTranslation('common')

  return <DyoIndicator className={className} color={colorOfStatus(defined)} title={t(altOfStatus(defined))} />
}

export default SecretStatus
