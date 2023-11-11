import { Layout } from '@app/components/layout'
import EditPipelineCard from '@app/components/pipelines/edit-pipeline-card'
import PipelineCard from '@app/components/pipelines/pipeline-card'
import TriggerPipelineCard from '@app/components/pipelines/trigger-pipeline-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import { defaultApiErrorHandler } from '@app/errors'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { PipelineDetails } from '@app/models'
import { ANCHOR_TRIGGER, TeamRoutes } from '@app/routes'
import { anchorLinkOf, toastWarning, withContextAuthorization } from '@app/utils'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useState } from 'react'

type PipelineDetailsEditState = 'run-list' | 'editing' | 'trigger'

type PipelineDetailsPageProps = {
  pipeline: PipelineDetails
}

const PipelineDetailsPage = (props: PipelineDetailsPageProps) => {
  const { pipeline: propsPipeline } = props

  const { t } = useTranslation('pipelines')
  const routes = useTeamRoutes()
  const router = useRouter()

  const anchor = anchorLinkOf(router)

  const [pipeline, setPipeline] = useState(propsPipeline)
  const [state, setState] = useState<PipelineDetailsEditState>(anchor === ANCHOR_TRIGGER ? 'trigger' : 'run-list')
  const submit = useSubmit()

  const handleApiError = defaultApiErrorHandler(t)

  const onPipelineEdited = (it: PipelineDetails) => {
    setState('run-list')
    setPipeline(it)
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
      ) : state === 'trigger' ? (
        <TriggerPipelineCard pipeline={pipeline} />
      ) : (
        <PipelineCard pipeline={pipeline} />
      )}
    </Layout>
  )
}

export default PipelineDetailsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const routes = TeamRoutes.fromContext(context)

  const pipelineId = context.query.pipelineId as string

  //   const pipeline = await getCruxFromContext<PipelineDetails>(context, routes.pipeline.api.details(pipelineId))

  const pipeline: PipelineDetails = {
    id: 'test-id',
    audit: {
      createdAt: new Date().toISOString(),
      createdBy: 'me',
      updatedAt: new Date().toISOString(),
    },
    description: "It's the final pipeliiiiine.",
    name: 'dyo prod deploy',
    repository: {
      organization: 'dyrector-io',
      project: 'dyrectorio',
    },
    trigger: {
      name: 'pipeline name',
      inputs: [
        {
          id: 'id-1',
          key: 'test',
          value: 'val',
        },
      ],
    },
    type: 'azure',
    icon: 'sloth',
    inputs: [
      {
        id: 'input-id',
        key: 'test',
        value: '',
      },
    ],
    status: 'ready',
    lastRun: {
      status: 'successful',
      finishedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
    },
  }

  return {
    props: {
      pipeline,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
