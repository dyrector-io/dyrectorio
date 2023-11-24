import { Layout } from '@app/components/layout'
import EditPipelineCard from '@app/components/pipelines/edit-pipeline-card'
import PipelineCard from '@app/components/pipelines/pipeline-card'
import PipelineStatusTag from '@app/components/pipelines/pipeline-status-tag'
import TriggerPipelineCard from '@app/components/pipelines/trigger-pipeline-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import { DyoCard } from '@app/elements/dyo-card'
import DyoTable, { DyoColumn } from '@app/elements/dyo-table'
import { defaultApiErrorHandler } from '@app/errors'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import useWebSocket from '@app/hooks/use-websocket'
import { PipelineDetails, PipelineRun, PipelineStatusMessage, WS_TYPE_PIPELINE_STATUS } from '@app/models'
import { ANCHOR_TRIGGER, TeamRoutes } from '@app/routes'
import { anchorLinkOf, toastWarning, utcDateToLocale, withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useEffect, useState } from 'react'

type PipelineDetailsEditState = 'run-list' | 'editing' | 'trigger'

const stateFromAnchor = (anchor: string) => (anchor === ANCHOR_TRIGGER ? 'trigger' : 'run-list')

type PipelineDetailsPageProps = {
  pipeline: PipelineDetails
}

const PipelineDetailsPage = (props: PipelineDetailsPageProps) => {
  const { pipeline: propsPipeline } = props

  const { t } = useTranslation('pipelines')
  const routes = useTeamRoutes()
  const router = useRouter()

  const [pipeline, setPipeline] = useState(propsPipeline)
  const [state, setState] = useState<PipelineDetailsEditState>('run-list')
  const submit = useSubmit()

  const anchor = anchorLinkOf(router)
  useEffect(() => {
    setState(stateFromAnchor(anchor))
  }, [anchor])

  const sock = useWebSocket(routes.pipeline.socket())
  sock.on(WS_TYPE_PIPELINE_STATUS, (message: PipelineStatusMessage) => {
    if (message.pipelineId !== pipeline.id) {
      return
    }

    setPipeline(oldPipeline => {
      let runList = oldPipeline.runs
      let run = runList.find(it => it.id === message.runId)
      if (!run) {
        run = {
          id: message.runId,
          startedAt: new Date().toUTCString(),
          finishedAt: message.finishedAt,
          status: message.status,
        }

        runList = [run, ...oldPipeline.runs]
      } else {
        run.finishedAt = message.finishedAt
        run.status = message.status
      }

      return {
        ...oldPipeline,
        runs: runList,
      }
    })
  })

  const handleApiError = defaultApiErrorHandler(t)

  const onPipelineEdited = (it: PipelineDetails) => {
    setState('run-list')
    setPipeline(it)
  }

  const onPipelineTriggered = (run: PipelineRun) => {
    const newPipeline = {
      ...pipeline,
      runs: [run, ...pipeline.runs],
    }

    setPipeline(newPipeline)
    setState('run-list')
  }

  const onDelete = async () => {
    const res = await fetch(routes.pipeline.api.details(pipeline.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      await router.replace(routes.pipeline.list())
    } else if (res.status === 412) {
      toastWarning(t('inUse'))
    } else {
      await handleApiError(res)
    }
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:pipelines'),
    url: routes.pipeline.list(),
  }

  return (
    <Layout title={t('pipelinesName', pipeline)}>
      <PageHeading
        pageLink={pageLink}
        sublinks={[
          {
            name: pipeline.name,
            url: routes.pipeline.details(pipeline.id),
          },
        ]}
      >
        <DetailsPageMenu
          onDelete={onDelete}
          editing={state === 'editing'}
          setEditing={it => setState(it ? 'editing' : 'run-list')}
          submit={submit}
          deleteModalTitle={t('common:areYouSureDeleteName', { name: pipeline.name })}
          deleteModalDescription={t('common:proceedYouLoseAllDataToName', {
            name: pipeline.name,
          })}
        />
      </PageHeading>

      {state === 'editing' ? (
        <EditPipelineCard pipeline={pipeline} onPipelineEdited={onPipelineEdited} submit={submit} />
      ) : (
        <>
          <PipelineCard pipeline={pipeline} hideTrigger={state === 'trigger'} onTrigger={() => setState('trigger')} />

          {state === 'trigger' && (
            <TriggerPipelineCard
              className="p-6 mt-4"
              pipeline={pipeline}
              onPipelineTriggered={onPipelineTriggered}
              onClose={() => setState('run-list')}
            />
          )}
        </>
      )}

      {pipeline.runs.length > 0 && (
        <DyoCard className="mt-4">
          <DyoTable data={pipeline.runs} dataKey="id">
            <DyoColumn
              header={t('common:status')}
              className="w-2/12 text-center"
              body={(it: PipelineRun) => <PipelineStatusTag status={it.status} className="w-fit mx-auto" />}
            />
            <DyoColumn
              header={t('common:createdAt')}
              className="w-2/12"
              suppressHydrationWarning
              body={(it: PipelineRun) => utcDateToLocale(it.startedAt)}
            />
            <DyoColumn
              header={t('finishedAt')}
              className="w-2/12"
              suppressHydrationWarning
              body={(it: PipelineRun) => (it.finishedAt ? utcDateToLocale(it.finishedAt) : null)}
            />
          </DyoTable>
        </DyoCard>
      )}
    </Layout>
  )
}

export default PipelineDetailsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const routes = TeamRoutes.fromContext(context)

  const pipelineId = context.query.pipelineId as string

  const pipeline = await getCruxFromContext<PipelineDetails>(context, routes.pipeline.api.details(pipelineId))

  return {
    props: {
      pipeline,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
