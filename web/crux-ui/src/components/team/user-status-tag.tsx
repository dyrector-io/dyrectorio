import DyoTag from '@app/elements/dyo-tag'
import { UserStatus } from '@app/models'

interface UserStatusTagProps {
  className?: string
  status: UserStatus
}

const UserStatusTag = (props: UserStatusTagProps) => {
  const { status, className } = props

  const statusToBgColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-warning-orange'
      case 'expired':
        return 'bg-dyo-sky'
      case 'declined':
        return 'bg-error-red'
      case 'verified':
        return 'bg-dyo-green'
      default:
        return ''
    }
  }

  const statusToTextColor = () => {
    switch (status) {
      case 'pending':
        return 'text-warning-orange'
      case 'expired':
        return 'text-dyo-sky'
      case 'declined':
        return 'text-error-red'
      case 'verified':
        return 'text-dyo-green'
      default:
        return ''
    }
  }

  return (
    <DyoTag color={statusToBgColor()} textColor={statusToTextColor()} className={className}>
      {status.toUpperCase()}
    </DyoTag>
  )
}

export default UserStatusTag
