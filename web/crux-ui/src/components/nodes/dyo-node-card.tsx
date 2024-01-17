import DyoBadge from '@app/elements/dyo-badge'
import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import DyoExpandableText from '@app/elements/dyo-expandable-text'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoLink from '@app/elements/dyo-link'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { DyoNode } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import NodeStatusIndicator from './node-status-indicator'

interface DyoNodeCardProps extends Omit<DyoCardProps, 'children'> {
  node: DyoNode
  disableTitleHref?: boolean
  hideConnectionInfo?: boolean
}

const DyoNodeCard = (props: DyoNodeCardProps) => {
  const { node, disableTitleHref, className, hideConnectionInfo } = props

  const { t } = useTranslation('common')
  const routes = useTeamRoutes()
  const titleHref = routes.node.details(node.id)

  return (
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col')}>
      <DyoLink
        className={clsx('flex flex-row', disableTitleHref ? 'pointer-events-none' : null)}
        href={titleHref}
        qaLabel="node-card-title"
      >
        {node.icon ? <DyoBadge large icon={node.icon} /> : null}

        <DyoHeading
          className={clsx('text-xl text-bright font-semibold my-auto mr-auto', node.icon ? 'ml-4' : null)}
          element="h3"
        >
          {node.name}
        </DyoHeading>

        {!hideConnectionInfo ? <NodeStatusIndicator className="place-items-center" status={node.status} /> : null}
      </DyoLink>

      {!hideConnectionInfo && node.address && (
        <DyoLabel className="mr-auto mt-6">
          {t(`address`)}: {node.address}
        </DyoLabel>
      )}

      <DyoExpandableText
        name="description"
        text={node.description}
        lineClamp={node.address ? 4 : 6}
        className="text-md text-light mt-2 max-h-44"
        buttonClassName="w-fit"
        modalTitle={node.name}
      />
    </DyoCard>
  )
}

export default DyoNodeCard
