import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DeploymentToken } from '@app/models'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'

type DeploymentTokenCardProps = {
  className?: string
  token: DeploymentToken
  onCreate: VoidFunction
  onRevoke: VoidFunction
}

const DeploymentTokenCard = (props: DeploymentTokenCardProps) => {
  const { className, token, onCreate, onRevoke } = props

  const { t } = useTranslation('deployments')

  return (
    <DyoCard className={clsx('flex flex-col gap-2', className)}>
      <DyoHeading className="text-xl text-bright font-semibold truncate my-auto mr-auto" element="h3">
        {t('deploymentToken')}
      </DyoHeading>

      {!token ? (
        <>
          <p className="text-bright-muted">{t('createDeployTokenFor')}</p>

          <DyoButton className="px-6 ml-auto mt-2" outlined onClick={onCreate}>
            {t('common:create')}
          </DyoButton>
        </>
      ) : (
        <div className="grid grid-cols-2 text-bright gap-1">
          <span>{t('common:name')}</span>

          <span>{token.name}</span>

          <span>{t('common:created')}</span>

          <span suppressHydrationWarning>{utcDateToLocale(token.createdAt)}</span>

          <span>{t('tokens:expiresAt')}</span>

          <span suppressHydrationWarning>{token.expiresAt ? utcDateToLocale(token.expiresAt) : t('common:never')}</span>

          <DyoButton className="col-span-2 px-6 ml-auto mt-2" secondary onClick={onRevoke}>
            {t('tokens:revoke')}
          </DyoButton>
        </div>
      )}
    </DyoCard>
  )
}

export default DeploymentTokenCard
