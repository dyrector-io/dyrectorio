import DyoTag from '@app/elements/dyo-tag'
import { ServiceStatus } from '@app/models'
import React from 'react'

interface ServiceStatusTagProps {
  className?: string
  status: ServiceStatus
}

const ServiceStatusTag = (props: ServiceStatusTagProps) => {
  const { status } = props

  const statusToBgColor = () => {
    switch (status) {
      case 'operational':
        return 'bg-dyo-green'
      case 'disrupted':
        return 'bg-warning-orange'
      case 'unavailable':
        return 'bg-error-red'
      default:
        return 'bg-error-red'
    }
  }

  const statusToTextColor = () => {
    switch (status) {
      case 'operational':
        return 'text-dyo-green'
      case 'disrupted':
        return 'text-warning-orange'
      case 'unavailable':
        return 'text-error-red'
      default:
        return 'text-error-red'
    }
  }

  return (
    <DyoTag color={statusToBgColor()} textColor={statusToTextColor()} className={props.className}>
      {status.toUpperCase()}
    </DyoTag>
  )
}

export default ServiceStatusTag
