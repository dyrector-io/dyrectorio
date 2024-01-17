import { DyoLabel } from '@app/elements/dyo-label'
import { DeploymentDetails } from '@app/models'
import { auditToLocaleDate } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import DeploymentStatusTag from './deployment-status-tag'

interface DeploymentDetailsCardProps {
  className?: string
  deployment: DeploymentDetails
  children?: React.ReactNode
}

const DeploymentDetailsCard = (props: DeploymentDetailsCardProps) => {
  const { deployment, className, children } = props

  const { t } = useTranslation('deployments')

  return (
    <div className={clsx('flex flex-col', 'card rounded-lg bg-medium shadow-lg')}>
      <div className="flex flex-row rounded-t-lg bg-medium-eased px-4 py-3">
        <DyoLabel className="mr-2">
          <span className="mr-1 text-bold">{t('prefix')}</span>
          {deployment.prefix}
        </DyoLabel>

        <div className="flex-1">
          <DeploymentStatusTag status={deployment.status} />
        </div>

        <DyoLabel textColor="text-bright mr-2" suppressHydrationWarning>
          {auditToLocaleDate(deployment.audit)}
        </DyoLabel>
      </div>
      <div className={clsx('flex flex-col', className)}>{children}</div>
    </div>
  )
}

export default DeploymentDetailsCard
