import EditorBadge from '@app/components/editor/editor-badge'
import { Layout } from '@app/components/layout'
import NodeConnectionCard from '@app/components/nodes/node-connection-card'
import CopyDeploymentCard from '@app/components/projects/versions/deployments/copy-deployment-card'
import CreateDeploymentTokenCard from '@app/components/projects/versions/deployments/create-deployment-token-card'
import DeploymentDetailsSection from '@app/components/projects/versions/deployments/deployment-details-section'
import DeploymentTokenCard from '@app/components/projects/versions/deployments/deployment-token-card'
import EditDeploymentCard from '@app/components/projects/versions/deployments/edit-deployment-card'
import EditDeploymentInstances from '@app/components/projects/versions/deployments/edit-deployment-instances'
import useDeploymentState from '@app/components/projects/versions/deployments/use-deployment-state'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import DyoButton from '@app/elements/dyo-button'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import WebSocketSaveIndicator from '@app/elements/web-socket-save-indicator'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import { useDeploy } from '@app/hooks/use-deploy'
import useTeamRoutes from '@app/hooks/use-team-routes'
import useWebsocketTranslate from '@app/hooks/use-websocket-translation'
import {
  DeploymentDetails,
  DeploymentRoot,
  Instance,
  mergeConfigs,
  NodeDetails,
  ProjectDetails,
  VersionDetails,
} from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getValidationError, startDeploymentSchema } from '@app/validations'
import { getCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useRef } from 'react'
import toast from 'react-hot-toast'

interface DeploymentDetailsPageProps {
  deployment: DeploymentRoot
}

const DeploymentDetailsPage = (props: DeploymentDetailsPageProps) => {
  const { deployment: propsDeployment } = props

  const { t } = useTranslation('deployments')
  const { t: tError } = useTranslation('container')
  const routes = useTeamRoutes()

  const router = useRouter()
  const submitRef = useRef<() => Promise<any>>()

  const handleApiError = defaultApiErrorHandler(t)

  const [confirmModalConfig, confirm] = useConfirmation()
  const deploy = useDeploy({ router, teamRoutes: routes, t, confirm })

  const onWsError = (error: Error) => {
    // eslint-disable-next-line
    console.error('ws', 'edit-deployment', error)
    toast(t('errors:connectionLost'))
  }

  const [state, actions] = useDeploymentState({
    deployment: propsDeployment,
    onWsError,
    onApiError: handleApiError,
  })

  const { project, version, deployment, node } = state

  const onDeploymentCopied = async (newDeploymentId: string) => {
    await router.push(routes.deployment.details(newDeploymentId))
    router.reload()
  }

  const onDeploy = async () => {
    if (node.status !== 'connected') {
      toast.error(t('errors.preconditionFailed'))
      return
    }

    if (state.deployInstances.length < 1) {
      toast.error(t('noInstancesSelected'))
      return
    }

    const selectedInstances = deployment.instances.filter(it => state.deployInstances.includes(it.id))

    const target: DeploymentDetails = {
      ...deployment,
      instances: selectedInstances.map(it => ({
        ...it,
        config: mergeConfigs(it.image.config, it.config),
      })),
    }

    const error = getValidationError(startDeploymentSchema, target)
    if (error) {
      console.error(error.message, error)
      toast.error(t('errors:validationFailed', error))
      return
    }

    await deploy(deployment.id, state.deployInstances)
  }

  useWebsocketTranslate(t)

  const pageLink: BreadcrumbLink = {
    name: t('common:deployments'),
    url: routes.project.list(),
  }

  const sublinks: BreadcrumbLink[] = [
    {
      name: project.name,
      url: routes.project.details(project.id),
    },
    {
      name: version.name,
      url: routes.project.versions(project.id).details(version.id),
    },
    {
      name: t('common:deployment'),
      url: routes.deployment.details(deployment.id),
    },
  ]

  const onDelete = async () => {
    const res = await fetch(routes.deployment.api.details(deployment.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      router.replace(routes.project.details(project.id, { section: 'deployments' }))
    } else {
      toast(t('errors:oops'))
    }
  }

  const editing = state.editState === 'edit'

  const onDiscard = () => actions.setEditState('details')

  return (
    <Layout
      title={t('deploysName', {
        project: project.name,
        version: version.name,
        name: node.name,
      })}
      topBarContent={
        <>
          {state.editor.editors.map((it, index) => (
            <EditorBadge key={index} className="mr-2" editor={it} />
          ))}
        </>
      }
    >
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        <WebSocketSaveIndicator className="mx-3" state={state.saveState} />

        {!state.deletable ? null : (
          <DetailsPageMenu
            onDelete={onDelete}
            editing={editing}
            setEditing={it => actions.setEditState(it ? 'edit' : 'details')}
            disableEditing={!state.mutable}
            submitRef={submitRef}
            deleteModalTitle={t('common:areYouSureDeleteName', {
              name: t('common:deployment'),
            })}
            deleteModalDescription={
              node.status === 'connected' && state.deployment.status === 'successful'
                ? t('proceedYouDeletePrefix', {
                    node: state.deployment.node.name,
                    prefix: state.deployment.prefix,
                  })
                : t('common:proceedYouLoseAllDataToName', {
                    name: state.deployment.prefix,
                  })
            }
          />
        )}

        {state.editState !== 'details' ? null : (
          <>
            {state.copiable ? (
              <DyoButton className="px-6 ml-4" onClick={() => actions.setEditState('copy')}>
                {t('common:copy')}
              </DyoButton>
            ) : null}

            {state.showDeploymentLog ? (
              <DyoButton className="px-6 ml-4" href={routes.deployment.deploy(deployment.id)}>
                {t('log')}
              </DyoButton>
            ) : null}

            {state.deployable ? (
              <DyoButton className="px-6 ml-4" onClick={onDeploy} disabled={node.status !== 'connected'}>
                {t('common:deploy')}
              </DyoButton>
            ) : null}
          </>
        )}
      </PageHeading>

      {editing ? (
        <EditDeploymentCard
          deployment={state.deployment}
          submitRef={submitRef}
          onDeploymentEdited={actions.onDeploymentEdited}
        />
      ) : state.editState === 'copy' ? (
        <CopyDeploymentCard
          deployment={state.deployment}
          submitRef={submitRef}
          onDeplyomentCopied={onDeploymentCopied}
          onDiscard={onDiscard}
        />
      ) : state.editState === 'create-token' ? (
        <CreateDeploymentTokenCard
          deployment={state.deployment}
          submitRef={submitRef}
          onTokenCreated={actions.onDeploymentTokenCreated}
          onDiscard={onDiscard}
        />
      ) : (
        <>
          <div className="flex flex-row">
            <div className="flex flex-col gap-2 w-1/3">
              <NodeConnectionCard node={state.node} showName />

              {deployment.version.type === 'rolling' && (
                <DeploymentTokenCard
                  className="h-full p-6"
                  token={state.deployment.token}
                  onCreate={() => actions.setEditState('create-token')}
                  onRevoke={actions.onRevokeDeploymentToken}
                />
              )}
            </div>

            <DeploymentDetailsSection state={state} actions={actions} className="w-2/3 p-6 ml-2" />
          </div>

          <EditDeploymentInstances state={state} actions={actions} />
        </>
      )}

      <DyoConfirmationModal config={state.confirmationModal} className="w-1/4" />
      <DyoConfirmationModal config={confirmModalConfig} className="w-1/4" />
    </Layout>
  )
}

export default DeploymentDetailsPage

export const getDeploymentRoot = async (context: NextPageContext) => {
  const routes = TeamRoutes.fromContext(context)

  const deploymentId = context.query.deploymentId as string

  const deployment = await getCruxFromContext<DeploymentDetails>(context, routes.deployment.api.details(deploymentId))
  const project = await getCruxFromContext<ProjectDetails>(context, routes.project.api.details(deployment.project.id))
  const node = await getCruxFromContext<NodeDetails>(context, routes.node.api.details(deployment.node.id))
  const version = await getCruxFromContext<VersionDetails>(
    context,
    routes.project.versions(deployment.project.id).api.details(deployment.version.id),
  )

  return {
    ...deployment,
    project,
    version,
    node: await node,
  } as DeploymentRoot
}

const getPageServerSideProps = async (context: NextPageContext) => ({
  props: {
    deployment: await getDeploymentRoot(context),
  },
})

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
