import DyoBadge from '@app/elements/dyo-badge'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import { Pipeline, PipelineType } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'

const typeToIcon = (type: PipelineType) => {
  switch (type) {
    case 'gitlab':
      return '/repositories/github.svg'
    case 'github':
      return '/repositories/github.svg'
    case 'azure':
      return '/repositories/azure-devops.svg'
    default:
      return '/repositories.svg'
  }
}

const typeToIconAlt = (type: PipelineType) => {
  switch (type) {
    case 'gitlab':
      return 'type.github'
    case 'github':
      return 'type.github'
    case 'azure':
      return 'type.azure'
    default:
      return 'repoBranchingIcon'
  }
}

type PipelineHeadingProps = {
  className?: string
  pipeline: Pick<Pipeline, 'type' | 'icon' | 'name'>
  children?: React.ReactNode
}

const PipelineHeading = (props: PipelineHeadingProps) => {
  const { className, pipeline, children } = props

  const { t } = useTranslation('pipelines')

  return (
    <div className={clsx('flex flex-row', className)}>
      {!pipeline.icon ? (
        <DyoIcon src={typeToIcon(pipeline.type)} size="md" alt={t(typeToIconAlt(pipeline.type))} />
      ) : (
        <DyoBadge large icon={pipeline.icon} />
      )}

      <DyoHeading className="text-xl text-bright font-semibold ml-2 my-auto mr-auto" element="h3">
        {pipeline.name}
      </DyoHeading>

      {children}
    </div>
  )
}

export default PipelineHeading
