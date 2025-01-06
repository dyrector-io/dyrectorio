import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoLabel } from '@app/elements/dyo-label'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { auditToLocaleDate } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import DeploymentStatusTag from './deployment-status-tag'
import { DeploymentState } from './use-deployment-state'

type DeploymentDetailsSectionProps = {
  className?: string
  state: DeploymentState
}

const DeploymentDetailsSection = (props: DeploymentDetailsSectionProps) => {
  const { state, className } = props
  const { deployment } = state

  const { t } = useTranslation('deployments')
  const routes = useTeamRoutes()

  return (
    <DyoCard className={clsx('flex flex-col', className ?? 'p-6')}>
      <div className="flex flex-row justify-between mb-4">
        <DyoLabel>{t('prefixName', { name: deployment.prefix })}</DyoLabel>

        <DeploymentStatusTag className="my-auto" status={deployment.status} />

        <DyoLabel textColor="text-bright" suppressHydrationWarning>
          {auditToLocaleDate(deployment.audit)}
        </DyoLabel>
      </div>

      <div className="self-end mt-auto">
        <DyoButton className="px-2" outlined href={routes.containerConfig.details(deployment.config.id)}>
          <div className="flex flex-row items-center gap-2">
            <Image
              className="aspect-square"
              src="/concrete_container_config_turquoise.svg"
              alt={t('common:config')}
              width={24}
              height={24}
            />
            {t('common:config')}
          </div>
        </DyoButton>
      </div>
    </DyoCard>
  )
}

export default DeploymentDetailsSection
