import DyoBadge from '@app/elements/dyo-badge'
import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import DyoExpandableText from '@app/elements/dyo-expandable-text'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoNode } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import NodeStatusIndicator from './node-status-indicator'

interface DyoNodeCardProps extends Omit<DyoCardProps, 'children'> {
  node: DyoNode
  onNameClick?: () => void
}

const DyoNodeCard = (props: DyoNodeCardProps) => {
  const { node, onNameClick, className } = props
  const { t } = useTranslation('common')

  return (
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col')}>
      <div className={clsx(onNameClick ? 'cursor-pointer' : null, 'flex flex-row')} onClick={onNameClick}>
        {node.icon ? <DyoBadge icon={node.icon} /> : null}

        <DyoHeading className="text-xl text-bright font-semibold ml-4 my-auto mr-auto" element="h3">
          {node.name}
        </DyoHeading>

        <NodeStatusIndicator status={node.status} />
      </div>

      {node.address && (
        <DyoLabel className="mr-auto mt-6">
          {t(`address`)}: {node.address}
        </DyoLabel>
      )}
      <DyoExpandableText
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
