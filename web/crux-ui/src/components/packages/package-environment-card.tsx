import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoLink from '@app/elements/dyo-link'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { PackageEnvironment } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import NodeStatusIndicator from '../nodes/node-status-indicator'

type PackageEnvironmentCardProps = {
  className?: string
  packageId: string
  environment: PackageEnvironment
  onClick?: VoidFunction
}

const PackageEnvironmentCard = (props: PackageEnvironmentCardProps) => {
  const { className, packageId, environment, onClick } = props
  const { node } = environment

  const { t } = useTranslation('packages')
  const routes = useTeamRoutes()
  const titleHref = routes.package.api.environmentDetails(packageId, environment.id)

  const title = (
    <DyoHeading element="h5" className="text-xl text-bright" onClick={onClick}>
      {environment.name}
    </DyoHeading>
  )

  return (
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col flex-grow w-full')}>
      <div className="flex flex-col">
        <DyoLink href={titleHref} qaLabel="package-environment-card-title">
          {title}
        </DyoLink>
      </div>

      <div className="flex flex-row gap-2">
        <NodeStatusIndicator status={node.status} />

        <DyoLabel>{node.name}</DyoLabel>

        <DyoLabel>{environment.prefix}</DyoLabel>
      </div>
    </DyoCard>
  )
}

export default PackageEnvironmentCard
