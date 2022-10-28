import { DyoCard } from '@app/elements/dyo-card'
import { DyoLabel } from '@app/elements/dyo-label'
import { DeploymentDetails } from '@app/models'
import { utcDateToLocale } from '@app/utils'
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
    <DyoCard className={clsx('flex flex-col', className ?? 'p-6')}>
      <div className="flex flex-row justify-between">
        <DyoLabel>{t('prefixName', { name: deployment.prefix })}</DyoLabel>

        <DeploymentStatusTag className="my-auto" status={deployment.status} />

        <DyoLabel textColor="text-bright">{utcDateToLocale(deployment.updatedAt)}</DyoLabel>
      </div>

      {children}
    </DyoCard>
  )
}

export default DeploymentDetailsCard
