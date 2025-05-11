import DyoIndicator from '@app/elements/dyo-indicator'
import { SecretStatus } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

const colorOfStatus = (status: SecretStatus) => {
  switch (status) {
    case 'saved':
      return 'bg-dyo-orange'
    case 'encrypted':
      return 'bg-dyo-turquoise'
    case 'defined':
      return 'bg-dyo-green'
    default:
      return 'bg-dyo-gray'
  }
}

const altOfStatus = (status: SecretStatus) => {
  if (!status) {
    status = 'unknown'
  }

  return `secretStatus.${status}`
}

type SecretStatusIndicatorProps = {
  className?: string
  status: SecretStatus
}

const SecretStatusIndicator = (props: SecretStatusIndicatorProps) => {
  const { className, status } = props

  const { t } = useTranslation('common')

  return <DyoIndicator className={className} color={colorOfStatus(status)} title={t(altOfStatus(status))} />
}

export default SecretStatusIndicator
