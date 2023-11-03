import DyoBadge from '@app/elements/dyo-badge'
import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import DyoExpandableText from '@app/elements/dyo-expandable-text'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoLink from '@app/elements/dyo-link'
import { Registry } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import RegistryTypeTag from './registry-type-tag'

interface RegistryCardProps extends Omit<DyoCardProps, 'children'> {
  registry: Registry
  titleHref: string
}

const RegistryCard = (props: RegistryCardProps) => {
  const { t } = useTranslation('registries')

  const { registry, titleHref, className } = props

  const title = (
    <div className="flex flex-row">
      {!registry.icon ? (
        <DyoIcon src="/default_registry.svg" size="md" alt={t('altDefaultRegistryPicture')} />
      ) : (
        <DyoBadge large icon={registry.icon} />
      )}

      <DyoHeading className="text-xl text-bright font-semibold ml-2 my-auto mr-auto" element="h3">
        {registry.name}
      </DyoHeading>
    </div>
  )

  return (
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col')}>
      {titleHref ? (
        <DyoLink href={titleHref} qaLabel="registry-card-title">
          {title}
        </DyoLink>
      ) : (
        title
      )}

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
