import DyoBadge from '@app/elements/dyo-badge'
import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import DyoExpandableText from '@app/elements/dyo-expandable-text'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoLink from '@app/elements/dyo-link'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Storage } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'

interface StorageCardProps extends Omit<DyoCardProps, 'children'> {
  storage: Storage
  disableTitleHref?: boolean
}

const StorageCard = (props: StorageCardProps) => {
  const { storage, disableTitleHref, className } = props

  const { t } = useTranslation('storages')
  const routes = useTeamRoutes()
  const titleHref = routes.storage.details(storage.id)

  return (
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col')}>
      <DyoLink
        className={clsx('flex flex-row', disableTitleHref ? 'pointer-events-none' : null)}
        href={titleHref}
        qaLabel="storage-card-title"
      >
        {!storage.icon ? (
          <DyoIcon src="/storage.svg" size="md" alt={t('altDefaultStoragePicture')} />
        ) : (
          <DyoBadge large icon={storage.icon} />
        )}

        <DyoHeading className="text-xl text-bright font-semibold ml-2 my-auto mr-auto" element="h3">
          {storage.name}
        </DyoHeading>
      </DyoLink>

      <div className="my-4 text-ellipsis overflow-hidden whitespace-nowrap text-light-eased">
        <DyoLabel className="mr-auto">{storage.url}</DyoLabel>
      </div>

      <DyoExpandableText
        name="description"
        text={storage.description}
        lineClamp={2}
        className="text-md text-light mt-2 max-h-44"
        buttonClassName="ml-auto"
        modalTitle={storage.name}
      />
    </DyoCard>
  )
}

export default StorageCard
