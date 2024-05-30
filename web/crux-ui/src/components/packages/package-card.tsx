import DyoBadge from '@app/elements/dyo-badge'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoLink from '@app/elements/dyo-link'
import DyoTag from '@app/elements/dyo-tag'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Package } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'

type PackageCardProps = {
  className?: string
  pack: Package
}

const PackageCard = (props: PackageCardProps) => {
  const { className, pack } = props

  const { t } = useTranslation('packages')
  const routes = useTeamRoutes()
  const titleHref = routes.package.details(pack.id)

  return (
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col gap-2')}>
      <DyoLink className="flex flex-row gap-2" href={titleHref} qaLabel="package-card-title">
        {pack.icon && <DyoBadge large icon={pack.icon} />}

        <DyoHeading className="text-xl text-bright font-semibold my-auto mr-auto" element="h3">
          {pack.name}
        </DyoHeading>
      </DyoLink>

      <p className="text-md text-light mt-4 line-clamp-2 break-words">{pack.description}</p>

      {pack.environments.length > 0 && (
        <>
          <span className="text-bright mt-4 mb-2">{t('environments')}</span>

          <div className="flex flex-wrap gap-2">
            {pack.environments.map(it => (
              <DyoTag>{it}</DyoTag>
            ))}
          </div>
        </>
      )}
    </DyoCard>
  )
}

export default PackageCard
