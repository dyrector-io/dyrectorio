import DyoButton from '@app/elements/dyo-button'
import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import DyoExpandableText from '@app/elements/dyo-expandable-text'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Pipeline, repositoryNameOf } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PipelineHeading from './pipeline-heading'
import PipelineTypeTag from './pipeline-type-tag'

type PipelineCardProps = Omit<DyoCardProps, 'children'> & {
  pipeline: Pipeline
  titleHref?: string
}

const PipelineCard = (props: PipelineCardProps) => {
  const { pipeline, titleHref, className } = props

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

  const title = <PipelineHeading pipeline={pipeline} />

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

      <DyoButton className="px-6 ml-auto" onClick={onTrigger}>
        {t('trigger')}
      </DyoButton>
    </DyoCard>
  )
}

export default PipelineCard
