import { Layout } from '@app/components/layout'
import EditPipelineCard from '@app/components/pipelines/edit-pipeline-card'
import PipelineCard from '@app/components/pipelines/pipeline-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoWrap from '@app/elements/dyo-wrap'
import useAnchor from '@app/hooks/use-anchor'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import useWebSocket from '@app/hooks/use-websocket'
import {
  Pipeline,
  PipelineDetails,
  PipelineStatusMessage,
  WS_TYPE_PIPELINE_STATUS,
  pipelineDetailsToPipeline,
} from '@app/models'
import { ANCHOR_NEW, ListRouteOptions, TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import clsx from 'clsx'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'

type PipelinesPageProps = {
  pipelines: Pipeline[]
}

const PipelinesPage = (props: PipelinesPageProps) => {
  const { pipelines } = props

  const { t } = useTranslation('pipelines')
  const routes = useTeamRoutes()
  const router = useRouter()
  const anchor = useAnchor()

  const filters = useFilters<Pipeline, TextFilter>({
    filters: [textFilterFor<Pipeline>(it => [it.name, it.description, it.icon, it.type])],
    initialData: pipelines,
  })

  const creating = anchor === ANCHOR_NEW
  const submit = useSubmit()

  const socket = useWebSocket(routes.pipeline.socket())
  socket.on(WS_TYPE_PIPELINE_STATUS, (message: PipelineStatusMessage) => {
    filters.setItems(items => {
      const newItems = [...items]
      const pipeline = newItems.find(it => it.id === message.pipelineId)
      pipeline.lastRun = {
        id: message.runId,
        startedBy: message.startedBy,
        finishedAt: message.finishedAt,
        startedAt: pipeline.lastRun?.startedAt ?? new Date().toUTCString(),
        status: message.status,
      }

      return newItems
    })
  })

  const onPipelineCreated = async (pipeline: PipelineDetails) => {
    const newPipeline = pipelineDetailsToPipeline(pipeline)
    filters.setItems([...filters.items, newPipeline])

    await router.replace(routes.pipeline.list())
  }

  const onRouteOptionsChange = async (routeOptions: ListRouteOptions) => {
    await router.replace(routes.pipeline.list(routeOptions))
  }

  const selfLink: BreadcrumbLink = {
    name: t('common:pipelines'),
    url: routes.pipeline.list(),
  }

  return (
    <Layout title={t('common:pipelines')}>
      <PageHeading pageLink={selfLink}>
        <ListPageMenu creating={creating} onRouteOptionsChange={onRouteOptionsChange} submit={submit} />
      </PageHeading>

      {!creating ? null : (
        <EditPipelineCard className="mb-8 px-8 py-6" submit={submit} onPipelineEdited={onPipelineCreated} />
      )}

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
          {t('noPipelines')}
        </DyoHeading>
      )}
    </Layout>
  )
}

export default PipelinesPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
  const routes = TeamRoutes.fromContext(context)

  const pipelines = await getCruxFromContext<Pipeline[]>(context, routes.pipeline.api.list())

  return {
    props: {
      pipelines,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
