import EditorBadge from '@app/components/editor/editor-badge'
import useEditorState from '@app/components/editor/use-editor-state'
import useItemEditorState from '@app/components/editor/use-item-editor-state'
import { Layout } from '@app/components/layout'
import useInstanceState from '@app/components/projects/versions/deployments/instances/use-instance-state'
import useDeploymentState from '@app/components/projects/versions/deployments/use-deployment-state'
import CommonConfigSection from '@app/components/projects/versions/images/config/common-config-section'
import configToFilters from '@app/components/projects/versions/images/config/config-to-filters'
import CraneConfigSection from '@app/components/projects/versions/images/config/crane-config-section'
import DagentConfigSection from '@app/components/projects/versions/images/config/dagent-config-section'
import EditImageJson from '@app/components/projects/versions/images/edit-image-json'
import ImageConfigFilters, {
  dockerFilterSet,
  k8sFilterSet,
} from '@app/components/projects/versions/images/image-config-filters'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoMessage from '@app/elements/dyo-message'
import WebSocketSaveIndicator from '@app/elements/web-socket-save-indicator'
import { defaultApiErrorHandler } from '@app/errors'
import useTeamRoutes from '@app/hooks/use-team-routes'
import {
  DeploymentDetails,
  DeploymentRoot,
  ImageConfigProperty,
  InstanceContainerConfigData,
  InstanceJsonContainerConfig,
  NodeDetails,
  ProjectDetails,
  VersionDetails,
  ViewState,
  instanceConfigToJsonInstanceConfig,
  mergeConfigs,
  mergeJsonConfigToInstanceContainerConfig,
} from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { ContainerConfigValidationErrors, getMergedContainerConfigFieldErrors, jsonErrorOf } from '@app/validations'
import { getCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface InstanceDetailsPageProps {
  deployment: DeploymentRoot
  instanceId: string
}

const InstanceDetailsPage = (props: InstanceDetailsPageProps) => {
  const { deployment, instanceId } = props
  const { project, version } = deployment

  const { t } = useTranslation('images')
  const routes = useTeamRoutes()

  const onWsError = (error: Error) => {
    // eslint-disable-next-line
    console.error('ws', 'edit-deployment', error)
    toast(t('errors:connectionLost'))
  }

  const onApiError = defaultApiErrorHandler(t)

  const [deploymentState, deploymentActions] = useDeploymentState({
    deployment,
    onWsError,
    onApiError,
  })

  const instance = deploymentState.instances.find(it => it.id === instanceId)

  const [state, actions] = useInstanceState({
    instance,
    deploymentState,
    deploymentActions,
  })

  const [fieldErrors, setFieldErrors] = useState<ContainerConfigValidationErrors>(() =>
    getMergedContainerConfigFieldErrors(
      mergeConfigs(instance.image.config, state.config),
      instance.image.validation,
      t,
    ),
  )
  const [filters, setFilters] = useState<ImageConfigProperty[]>(configToFilters([], state.config, fieldErrors))
  const [viewState, setViewState] = useState<ViewState>('editor')
  const [jsonError, setJsonError] = useState(jsonErrorOf(fieldErrors))
  const [topBarContent, setTopBarContent] = useState<React.ReactNode>(null)

  const editor = useEditorState(deploymentState.sock)
  const editorState = useItemEditorState(editor, deploymentState.sock, instance.id)

  useEffect(() => {
    const reactNode = (
      <>
        {editorState.editors.map((it, index) => (
          <EditorBadge key={index} className="mr-2" editor={it} />
        ))}
      </>
    )

    setTopBarContent(reactNode)
  }, [editorState.editors])

  useEffect(() => {
    setFilters(current => configToFilters(current, state.config))
  }, [state.config])

  const setErrorsForConfig = useCallback(
    (imageConfig, instanceConfig) => {
      const merged = mergeConfigs(imageConfig, instanceConfig)
      const errors = getMergedContainerConfigFieldErrors(merged, instance.image.validation, t)
      setFieldErrors(errors)
      setJsonError(jsonErrorOf(errors))
    },
    [t],
  )

  useEffect(() => {
    setErrorsForConfig(instance.image.config, instance.config)
  }, [instance.image.config, instance.config, setErrorsForConfig])

  const onChange = (newConfig: Partial<InstanceContainerConfigData>) => actions.onPatch(instance.id, newConfig)

  const pageLink: BreadcrumbLink = {
    name: t('common:container'),
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
    {
      name: instance.image.name,
      url: routes.deployment.instanceDetails(deployment.id, instance.id),
    },
  ]

  const getViewStateButtons = () => (
    <div className="flex">
      <DyoButton
        text
        thin
        textColor="text-bright"
        underlined={viewState === 'editor'}
        onClick={() => setViewState('editor')}
        heightClassName="pb-2"
        className="mx-8"
      >
        {t('editor')}
      </DyoButton>

      <DyoButton
        text
        thin
        textColor="text-bright"
        underlined={viewState === 'json'}
        onClick={() => setViewState('json')}
        className="mx-8"
        heightClassName="pb-2"
      >
        {t('json')}
      </DyoButton>
    </div>
  )

  const kubeNode = deployment.node.type === 'k8s'

  return (
    <Layout title={t('instancesName', state.config ?? instance.image)} topBarContent={topBarContent}>
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        <WebSocketSaveIndicator className="mx-3" state={deploymentState.saveState} />

        <DyoButton href={routes.deployment.details(deployment.id)}>{t('common:back')}</DyoButton>
      </PageHeading>

      <DyoCard className="p-4">
        <div className="flex mb-4 justify-between items-start">
          <DyoHeading element="h4" className="text-xl text-bright">
            {instance.image.name}
            {instance.image.name !== state.config?.name ? ` (${state.config?.name})` : null}
          </DyoHeading>

          {getViewStateButtons()}
        </div>

        {viewState === 'editor' && (
          <ImageConfigFilters
            onChange={setFilters}
            filters={filters}
            filterSet={kubeNode ? k8sFilterSet : dockerFilterSet}
          />
        )}
      </DyoCard>

      {viewState === 'editor' && (
        <DyoCard className="flex flex-col mt-4 px-4 w-full">
          <CommonConfigSection
            disabled={!deploymentState.mutable}
            selectedFilters={filters}
            config={state.config}
            resetableConfig={state.resetableConfig}
            onChange={onChange}
            onResetSection={actions.resetSection}
            editorOptions={editorState}
            fieldErrors={fieldErrors}
            configType="instance"
            imageConfig={instance.image.config}
            definedSecrets={state.definedSecrets}
            publicKey={deployment.publicKey}
          />

          {kubeNode ? (
            <CraneConfigSection
              disabled={!deploymentState.mutable}
              selectedFilters={filters}
              config={state.config}
              resetableConfig={state.resetableConfig}
              onChange={onChange}
              onResetSection={actions.resetSection}
              editorOptions={editorState}
              fieldErrors={fieldErrors}
              configType="instance"
              imageConfig={instance.image.config}
            />
          ) : (
            <DagentConfigSection
              disabled={!deploymentState.mutable}
              selectedFilters={filters}
              config={state.config}
              resetableConfig={state.resetableConfig}
              onChange={onChange}
              onResetSection={actions.resetSection}
              editorOptions={editorState}
              fieldErrors={fieldErrors}
              configType="instance"
              imageConfig={instance.image.config}
            />
          )}
        </DyoCard>
      )}

      {viewState === 'json' && (
        <DyoCard className="flex flex-col mt-4 p-4 w-full">
          {jsonError ? (
            <DyoMessage message={jsonError} className="text-xs italic w-full mb-2" messageType="error" />
          ) : null}

          <EditImageJson
            config={state.config}
            editorOptions={editorState}
            onPatch={(it: InstanceJsonContainerConfig) =>
              onChange(mergeJsonConfigToInstanceContainerConfig(state.config, it))
            }
            onParseError={err => setJsonError(err?.message)}
            convertConfigToJson={instanceConfigToJsonInstanceConfig}
          />
        </DyoCard>
      )}
    </Layout>
  )
}

export default InstanceDetailsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const routes = TeamRoutes.fromContext(context)

  const deploymentId = context.query.deploymentId as string
  const instanceId = context.query.instanceId as string

  const deploymentDetails = await getCruxFromContext<DeploymentDetails>(
    context,
    routes.deployment.api.details(deploymentId),
  )
  const project = await getCruxFromContext<ProjectDetails>(
    context,
    routes.project.api.details(deploymentDetails.project.id),
  )
  const node = await getCruxFromContext<NodeDetails>(context, routes.node.api.details(deploymentDetails.node.id))

  const version = await getCruxFromContext<VersionDetails>(
    context,
    routes.project.versions(deploymentDetails.project.id).api.details(deploymentDetails.version.id),
  )

  const deployment: DeploymentRoot = {
    ...deploymentDetails,
    project,
    version,
    node,
  }

  return {
    props: {
      deployment,
      instanceId,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
