import { Layout } from '@app/components/layout'
import EditPipelineCard from '@app/components/pipelines/edit-pipeline-card'
import PipelineCard from '@app/components/pipelines/pipeline-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoWrap from '@app/elements/dyo-wrap'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Pipeline } from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

type PipelinesPageProps = {
  pipelines: Pipeline[]
}

const PipelinesPage = (props: PipelinesPageProps) => {
  const { pipelines } = props

  const { t } = useTranslation('pipelines')
  const routes = useTeamRoutes()

  const filters = useFilters<Pipeline, TextFilter>({
    filters: [textFilterFor<Pipeline>(it => [it.name, it.description, it.icon, it.type])],
    initialData: pipelines,
  })

  const [creating, setCreating] = useState(false)
  const submit = useSubmit()

  const onCreated = (storage: Pipeline) => {
    setCreating(false)
    filters.setItems([...filters.items, storage])
  }

  const selfLink: BreadcrumbLink = {
    name: t('common:pipelines'),
    url: routes.pipeline.list(),
  }

  return (
    <Layout title={t('common:pipelines')}>
      <PageHeading pageLink={selfLink}>
        <ListPageMenu creating={creating} setCreating={setCreating} submit={submit} />
      </PageHeading>

      {!creating ? null : <EditPipelineCard className="mb-8 px-8 py-6" submit={submit} onPipelineEdited={onCreated} />}

      {filters.items.length ? (
        <>
          <Filters setTextFilter={it => filters.setFilter({ text: it })} />

          <DyoWrap itemClassName="lg:w-1/2 gap-4 mt-2">
            {filters.filtered.map((it, index) => (
              <PipelineCard
                className={clsx('max-h-72 w-full p-8')}
                key={`pipeline-${index}`}
                pipeline={it}
                titleHref={routes.pipeline.details(it.id)}
              />
            ))}
          </DyoWrap>
        </>
      ) : (
        <DyoHeading element="h3" className="text-md text-center text-light-eased pt-32">
          {t('noItems')}
        </DyoHeading>
      )}
    </Layout>
  )
}

export default PipelinesPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const routes = TeamRoutes.fromContext(context)

  //   const pipelines = await getCruxFromContext<PipelinesPage[]>(context, routes.pipeline.api.list())

  const pipelines: Pipeline[] = [
    {
      id: 'test-id',
      name: 'dyo prod deploy',
      description: 'dyrector.io deployment pipeline',
      icon: 'buffalo',
      type: 'azure',
      repository: {
        organization: 'dyrectorio',
        project: 'dyrectorio-pipelines',
      },
      trigger: {
        name: 'deploy',
        inputs: [],
      },
    },
  ]

  return {
    props: {
      pipelines,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
