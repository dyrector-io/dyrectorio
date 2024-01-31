import { Layout } from '@app/components/layout'
import EditEventWatcherCard from '@app/components/pipelines/edit-event-watcher-card'
import EditPipelineCard from '@app/components/pipelines/edit-pipeline-card'
import PipelineCard from '@app/components/pipelines/pipeline-card'
import PipelineEventWatcherList from '@app/components/pipelines/pipeline-event-watcher-list'
import PipelineRunList from '@app/components/pipelines/pipeline-run-list'
import TriggerPipelineCard from '@app/components/pipelines/trigger-pipeline-card'
import usePipelineDetailsState, {
  editEventWatcher,
  pipelineEdited,
  pipelineTriggered,
  removeEventWatcher,
  selectPipelineSectionState,
  selectedEditedEventWatcher,
  setViewState,
  updateRunState,
  upsertEventWatcher,
} from '@app/components/pipelines/use-pipeline-state'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import DyoButton from '@app/elements/dyo-button'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import useWebSocket from '@app/hooks/use-websocket'
import {
  PipelineDetails,
  PipelineEventWatcher,
  PipelineRun,
  PipelineStatusMessage,
  WS_TYPE_PIPELINE_STATUS,
} from '@app/models'
import { ANCHOR_TRIGGER, TeamRoutes } from '@app/routes'
import { anchorLinkOf, toastWarning, withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { QA_DIALOG_LABEL_DELETE_PIPELINE_EVENT_WATCHER } from 'quality-assurance'
import { useEffect } from 'react'

const stateFromAnchor = (anchor: string) => (anchor === ANCHOR_TRIGGER ? 'trigger' : 'run-list')

type PipelineDetailsPageProps = {
  pipeline: PipelineDetails
}

const PipelineDetailsPage = (props: PipelineDetailsPageProps) => {
  const { pipeline: propsPipeline } = props

  const { t } = useTranslation('pipelines')
  const routes = useTeamRoutes()
  const router = useRouter()

  const submit = useSubmit()

  const [modalConfig, confirm] = useConfirmation()
  const [state, dispatch] = usePipelineDetailsState({
    viewState: 'run-list',
    pipeline: propsPipeline,
    runs: [],
    editedEventWatcher: null,
  })

  const anchor = anchorLinkOf(router)
  useEffect(() => {
    dispatch(setViewState(stateFromAnchor(anchor)))
  }, [anchor, dispatch])

  const sock = useWebSocket(routes.pipeline.socket())
  sock.on(WS_TYPE_PIPELINE_STATUS, (message: PipelineStatusMessage) => dispatch(updateRunState(message)))

  const { pipeline, viewState } = state
  const sectionState = selectPipelineSectionState(state)

  const handleApiError = defaultApiErrorHandler(t)

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

  const onPipelineEdited = (it: PipelineDetails) => dispatch(pipelineEdited(it))

  const onPipelineTriggered = (it: PipelineRun) => dispatch(pipelineTriggered(it))

  const onEventWatcherEdited = (it: PipelineEventWatcher) => dispatch(upsertEventWatcher(it))

  const onEditEventWatcher = (it: PipelineEventWatcher) => dispatch(editEventWatcher(it))

  const onDeleteEventWatcher = async (eventWatcher: PipelineEventWatcher) => {
    const confirmed = await confirm({
      qaLabel: QA_DIALOG_LABEL_DELETE_PIPELINE_EVENT_WATCHER,
      title: t('common:areYouSure'),
      description: t('areYouSureDeleteEventWatcher', eventWatcher),
      confirmText: t('common:delete'),
      confirmColor: 'bg-error-red',
    })

    if (!confirmed) {
      return
    }

    const res = await fetch(routes.pipeline.api.eventWatcherDetails(pipeline.id, eventWatcher.id), {
      method: 'DELETE',
    })

    if (!res.ok) {
      await handleApiError(res)
    }

    dispatch(removeEventWatcher(eventWatcher))
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
          editing={viewState === 'editing'}
          setEditing={it => dispatch(setViewState(it ? 'editing' : 'run-list'))}
          submit={submit}
          deleteModalTitle={t('common:areYouSureDeleteName', { name: pipeline.name })}
          deleteModalDescription={t('common:proceedYouLoseAllDataToName', {
            name: pipeline.name,
          })}
        />
      </PageHeading>

      {viewState === 'editing' ? (
        <EditPipelineCard pipeline={pipeline} onPipelineEdited={onPipelineEdited} submit={submit} />
      ) : (
        <>
          <PipelineCard pipeline={pipeline} hideTrigger onTrigger={() => dispatch(setViewState('trigger'))} />

          {viewState === 'trigger' ? (
            <TriggerPipelineCard
              className="p-6 mt-4"
              pipeline={pipeline}
              onPipelineTriggered={onPipelineTriggered}
              onClose={() => dispatch(setViewState('run-list'))}
            />
          ) : viewState === 'edit-event-watcher' ? (
            <EditEventWatcherCard
              className="p-6 mt-4"
              pipeline={state.pipeline}
              eventWatcher={selectedEditedEventWatcher(state)}
              onEventWatcherEdited={onEventWatcherEdited}
              onDiscard={() => dispatch(setViewState('event-watchers'))}
            />
          ) : null}

          <div className="flex flex-row gap-3 mt-4">
            <DyoButton
              text
              thin
              underlined={sectionState === 'run-list'}
              textColor="text-bright"
              className="mx-6"
              onClick={() => dispatch(setViewState('run-list'))}
            >
              {t('runs')}
            </DyoButton>

            <DyoButton
              text
              thin
              underlined={sectionState === 'event-watchers'}
              textColor="text-bright"
              className="ml-6"
              onClick={() => dispatch(setViewState('event-watchers'))}
            >
              {t('eventWatchers')}
            </DyoButton>

            <span className="mx-auto" />

            {viewState !== 'trigger' && (
              <DyoButton className="px-6" onClick={() => dispatch(setViewState('trigger'))}>
                {t('trigger')}
              </DyoButton>
            )}

            {viewState !== 'edit-event-watcher' && (
              <DyoButton className="px-6" onClick={() => dispatch(editEventWatcher(null))}>
                {t('addEventWatcher')}
              </DyoButton>
            )}
          </div>

          {sectionState === 'run-list' ? (
            <PipelineRunList state={state} dispatch={dispatch} />
          ) : sectionState === 'event-watchers' ? (
            <PipelineEventWatcherList
              eventWatchers={pipeline.eventWatchers}
              onEditEventWatcher={onEditEventWatcher}
              onDeleteEventWatcher={onDeleteEventWatcher}
            />
          ) : null}
        </>
      )}

      <DyoConfirmationModal config={modalConfig} />
    </Layout>
  )
}

export default PipelineDetailsPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
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
