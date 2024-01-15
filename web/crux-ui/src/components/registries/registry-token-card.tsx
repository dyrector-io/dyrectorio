import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { RegistryToken } from '@app/models'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'

type RegistryTokenCardProps = {
  className?: string
  token: RegistryToken
  onCreate: VoidFunction
  onRevoke: VoidFunction
}

const RegistryTokenCard = (props: RegistryTokenCardProps) => {
  const { className, token, onCreate, onRevoke } = props

  const { t } = useTranslation('registries')

  return (
    <DyoCard className={clsx('flex flex-col gap-2 p-6', className)}>
      <DyoHeading className="text-xl text-bright font-semibold truncate mr-auto" element="h3">
        {t('registryHook')}
      </DyoHeading>

      {!token ? (
        <>
          <p className="text-bright-muted">{t('toRecivieNotifications')}</p>

          <DyoButton className="px-6 ml-auto mt-2" outlined onClick={onCreate}>
            {t('common:create')}
          </DyoButton>
        </>
      ) : (
        <div className="grid grid-cols-2 text-bright gap-1">
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

export default RegistryTokenCard
