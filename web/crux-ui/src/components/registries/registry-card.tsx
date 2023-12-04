import DyoBadge from '@app/elements/dyo-badge'
import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import DyoExpandableText from '@app/elements/dyo-expandable-text'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoLink from '@app/elements/dyo-link'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Registry } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import RegistryTypeTag from './registry-type-tag'

interface RegistryCardProps extends Omit<DyoCardProps, 'children'> {
  registry: Registry
  disableTitleHref?: boolean
}

const RegistryCard = (props: RegistryCardProps) => {
  const { registry, disableTitleHref, className } = props

  const { t } = useTranslation('registries')
  const routes = useTeamRoutes()
  const titleHref = routes.registry.details(registry.id)

  return (
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col')}>
      <DyoLink
        className={clsx('flex flex-row', disableTitleHref ? 'pointer-events-none' : null)}
        href={titleHref}
        qaLabel="registry-card-title"
      >
        {!registry.icon ? (
          <DyoIcon src="/default_registry.svg" size="md" alt={t('altDefaultRegistryPicture')} />
        ) : (
          <DyoBadge large icon={registry.icon} />
        )}

        <DyoHeading className="text-xl text-bright font-semibold ml-2 my-auto mr-auto" element="h3">
          {registry.name}
        </DyoHeading>
      </DyoLink>

      <div className="my-4 text-ellipsis overflow-hidden whitespace-nowrap text-light-eased">
        <DyoLabel className="mr-auto">{registry.url}</DyoLabel>
      </div>

      <DyoExpandableText
        name="description"
        text={registry.description}
        lineClamp={2}
        className="text-md text-light mt-2 max-h-44"
        buttonClassName="ml-auto"
        modalTitle={registry.name}
      />

      <RegistryTypeTag className="ml-auto mr-4" type={registry.type} />
    </DyoCard>
  )
}

export default RegistryCard
