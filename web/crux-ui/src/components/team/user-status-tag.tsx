import DyoTag from '@app/elements/dyo-tag'
import { UserStatus } from '@app/models'
import React from 'react'

interface UserStatusTagProps {
  className?: string
  status: UserStatus
}

const UserStatusTag = (props: UserStatusTagProps) => {
  const { status } = props

  const statusToBgColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-warning-orange'
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
      case 'verified':
        return 'text-dyo-green'
      default:
        return ''
    }
  }

  return (
    <DyoTag color={statusToBgColor()} textColor={statusToTextColor()} className={props.className}>
      {status.toUpperCase()}
    </DyoTag>
  )
}

export default UserStatusTag
