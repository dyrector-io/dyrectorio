import EditorBadge from '@app/components/editor/editor-badge'
import useEditorState from '@app/components/editor/use-editor-state'
import useItemEditorState from '@app/components/editor/use-item-editor-state'
import { Layout } from '@app/components/layout'
import useInstanceState from '@app/components/products/versions/deployments/instances/use-instance-state'
import useDeploymentState from '@app/components/products/versions/deployments/use-deployment-state'
import CommonConfigSection from '@app/components/products/versions/images/config/common-config-section'
import CraneConfigSection from '@app/components/products/versions/images/config/crane-config-section'
import DagentConfigSection from '@app/components/products/versions/images/config/dagent-config-section'
import EditImageJson from '@app/components/products/versions/images/edit-image-json'
import ImageConfigFilters from '@app/components/products/versions/images/image-config-filters'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { INSTANCE_WS_REQUEST_DELAY } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoMessage from '@app/elements/dyo-message'
import { defaultApiErrorHandler } from '@app/errors'
import { useThrottling } from '@app/hooks/use-throttleing'
import {
  BaseImageConfigFilterType,
  DeploymentDetails,
  DeploymentRoot,
  ImageConfigProperty,
  instanceConfigToJsonInstanceConfig,
  InstanceContainerConfigData,
  InstanceJsonContainerConfig,
  mergeConfigs,
  mergeJsonConfigToInstanceContainerConfig,
  NodeDetails,
  ProductDetails,
  VersionDetails,
  ViewState,
} from '@app/models'
import {
  deploymentApiUrl,
  deploymentUrl,
  instanceConfigUrl,
  nodeApiUrl,
  productApiUrl,
  productUrl,
  ROUTE_PRODUCTS,
  versionApiUrl,
  versionUrl,
} from '@app/routes'
import { getCruxFromContext, withContextAuthorization } from '@app/utils'
import { jsonErrorOf } from '@app/validations/image'
import { getMergedContainerConfigFieldErrors } from '@app/validations/instance'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { ValidationError } from 'yup'

interface InstanceDetailsPageProps {
  deployment: DeploymentRoot
  instanceId: string
}

const InstanceDetailsPage = (props: InstanceDetailsPageProps) => {
  const { t } = useTranslation('images')
  const { deployment, instanceId } = props
  const { product, version } = deployment

  const onApiError = defaultApiErrorHandler(t)
  const onWsError = (error: Error) => {
    // eslint-disable-next-line
    console.error('ws', 'edit-deployment', error)
    toast(t('errors:connectionLost'))
  }

  const [deploymentState] = useDeploymentState({
    deployment,
    onApiError,
    onWsError,
  })

  const instance = deploymentState.instances.find(it => it.id === instanceId)

  const [state, actions] = useInstanceState({
    instance,
    deploymentState,
  })

  const patch = useRef<Partial<InstanceContainerConfigData>>({})
  const [filters, setFilters] = useState<ImageConfigProperty[]>([])
  const [viewState, setViewState] = useState<ViewState>('editor')
  const [fieldErrors, setFieldErrors] = useState<ValidationError[]>(() =>
    getMergedContainerConfigFieldErrors(mergeConfigs(instance.image.config, state.config)),
  )
  const [jsonError, setJsonError] = useState(jsonErrorOf(fieldErrors))
  const [topBarContent, setTopBarContent] = useState<React.ReactNode>(null)

  const throttle = useThrottling(INSTANCE_WS_REQUEST_DELAY)

  const editor = useEditorState(deploymentState.sock)
  const editorState = useItemEditorState(editor, deploymentState.sock, instance.id)

  const baseFilter: BaseImageConfigFilterType | BaseImageConfigFilterType[] =
    deployment.node.type === 'docker'
      ? ['common', 'dagent']
      : deployment.node.type === 'k8s'
      ? ['common', 'crane']
      : 'all'

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

  const onChange = (newConfig: Partial<InstanceContainerConfigData>) => {
    actions.updateConfig(newConfig)

    const newPatch = {
      ...patch.current,
      ...newConfig,
    }
    patch.current = newPatch

    const applied: InstanceContainerConfigData = {
      ...state.config,
      ...newPatch,
    }

    const merged = mergeConfigs(instance.image.config, applied)
    const errors = getMergedContainerConfigFieldErrors(merged)
    setFieldErrors(errors)
    setJsonError(jsonErrorOf(errors))

    throttle(() => {
      actions.onPatch(instance.id, patch.current)
      patch.current = {}
    })
  }

  const onResetSection = (section: ImageConfigProperty) => {
    const newConfig = actions.resetSection(section)

    const merged = mergeConfigs(instance.image.config, newConfig)
    const errors = getMergedContainerConfigFieldErrors(merged)
    setFieldErrors(errors)
    setJsonError(jsonErrorOf(errors))
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:container'),
    url: ROUTE_PRODUCTS,
  }

  const sublinks: BreadcrumbLink[] = [
    {
      name: product.name,
      url: productUrl(product.id),
    },
    {
      name: version.name,
      url: versionUrl(product.id, version.id),
    },
    {
      name: t('common:deployment'),
      url: deploymentUrl(deployment.id),
    },
    {
      name: instance.image.name,
      url: instanceConfigUrl(deployment.id, instance.id),
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

  return (
    <Layout title={t('instancesName', state.config ?? instance.image)} topBarContent={topBarContent}>
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        <DyoButton href={deploymentUrl(deployment.id)}>{t('common:back')}</DyoButton>
      </PageHeading>

      <DyoCard className="p-4">
        <div className="flex mb-4 justify-between items-start">
          <DyoHeading element="h4" className="text-xl text-bright">
            {instance.image.name}
            {instance.image.name !== state.config?.name ? ` (${state.config?.name})` : null}
          </DyoHeading>

          {getViewStateButtons()}
        </div>
        {viewState === 'editor' && <ImageConfigFilters onChange={setFilters} initialBaseFilter={baseFilter} />}
      </DyoCard>

      {viewState === 'editor' && (
        <DyoCard className="flex flex-col mt-4 px-4 w-full">
          <CommonConfigSection
            disabled={!deploymentState.mutable}
            selectedFilters={filters}
            config={state.config}
            onChange={onChange}
            onResetSection={onResetSection}
            editorOptions={editorState}
            fieldErrors={fieldErrors}
            configType="instance"
            imageConfig={instance.image.config}
            definedSecrets={state.definedSecrets}
            publicKey={deployment.publicKey}
          />

          <CraneConfigSection
            disabled={!deploymentState.mutable}
            selectedFilters={filters}
            config={state.config}
            onChange={onChange}
            onResetSection={onResetSection}
            editorOptions={editorState}
            configType="instance"
            imageConfig={instance.image.config}
          />

          <DagentConfigSection
            disabled={!deploymentState.mutable}
            selectedFilters={filters}
            config={state.config}
            onChange={onChange}
            onResetSection={onResetSection}
            editorOptions={editorState}
            configType="instance"
            imageConfig={instance.image.config}
          />
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
  const productId = context.query.productId as string
  const versionId = context.query.versionId as string
  const deploymentId = context.query.deploymentId as string
  const instanceId = context.query.instanceId as string

  const product = await getCruxFromContext<ProductDetails>(context, productApiUrl(productId))
  const deploymentDetails = await getCruxFromContext<DeploymentDetails>(context, deploymentApiUrl(deploymentId))
  const node = await getCruxFromContext<NodeDetails>(context, nodeApiUrl(deploymentDetails.node.id))
  const version = await getCruxFromContext<VersionDetails>(context, versionApiUrl(productId, versionId))

  const deployment: DeploymentRoot = {
    ...deploymentDetails,
    product,
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
