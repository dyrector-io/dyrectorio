import DyoButton from '@app/elements/dyo-button'
import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import DyoExpandableText from '@app/elements/dyo-expandable-text'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Pipeline, PipelineDetails, PipelineRun, PipelineRunStatus, repositoryNameOf } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PipelineHeading from './pipeline-heading'
import PipelineStatusIndicator from './pipeline-status-indicator'
import PipelineTypeTag from './pipeline-type-tag'

type PipelineCardProps = Omit<DyoCardProps, 'children'> & {
  pipeline: Pipeline | PipelineDetails
  titleHref?: string
  hideTrigger?: boolean
  onTrigger?: VoidFunction
}

const statusOf = (
  pipeline: (Pipeline | PipelineDetails) & {
    lastRun?: PipelineRun
    runs?: PipelineRun[]
  },
): PipelineRunStatus => {
  if (pipeline.lastRun) {
    return pipeline.lastRun.status
  }

  if (pipeline.runs && pipeline.runs.length > 0) {
    return pipeline.runs[0].status
  }

  return 'unknown'
}

const PipelineCard = (props: PipelineCardProps) => {
  const { className, pipeline, titleHref, hideTrigger, onTrigger: propsOnTrigger } = props

  const { t } = useTranslation('pipelines')
  const routes = useTeamRoutes()
  const router = useRouter()

  const onTrigger = async (): Promise<void> => {
    await router.push(
      routes.pipeline.details(pipeline.id, {
        trigger: true,
      }),
    )
  }

  const title = (
    <PipelineHeading pipeline={pipeline}>
      <PipelineStatusIndicator status={statusOf(pipeline)} />
    </PipelineHeading>
  )

  return (
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col')}>
      {titleHref ? <Link href={titleHref}>{title}</Link> : title}

      <div className="flex flex-row my-4">
        <span className="text-ellipsis overflow-hidden whitespace-nowrap text-light-eased">
          {repositoryNameOf(pipeline)}
        </span>

        <PipelineTypeTag className="ml-auto" type={pipeline.type} />
      </div>

      <DyoExpandableText
        text={pipeline.description}
        lineClamp={2}
        className="text-md text-light mt-2 max-h-44"
        buttonClassName="ml-auto"
        modalTitle={pipeline.name}
      />

      {!hideTrigger && (
        <DyoButton className="px-6 ml-auto" onClick={propsOnTrigger ?? onTrigger}>
          {t('trigger')}
        </DyoButton>
      )}
    </DyoCard>
  )
}

export default PipelineCard
