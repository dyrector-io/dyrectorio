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
  ContainerConfig,
  DeploymentRoot,
  ImageConfigFilterType,
  imageConfigToJsonContainerConfig,
  ViewState,
} from '@app/models'
import { deploymentUrl, instanceConfigUrl, productUrl, ROUTE_PRODUCTS, versionUrl } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getContainerConfigFieldErrors, jsonErrorOf } from '@app/validations/image'
import { cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
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

  const [filters, setFilters] = useState<ImageConfigFilterType[]>([])
  const [viewState, setViewState] = useState<ViewState>('editor')
  const [fieldErrors, setFieldErrors] = useState<ValidationError[]>(() => getContainerConfigFieldErrors(state.config))
  const [jsonError, setJsonError] = useState(jsonErrorOf(fieldErrors))

  const throttle = useThrottling(INSTANCE_WS_REQUEST_DELAY)

  const editor = useEditorState(deploymentState.sock)
  const editorState = useItemEditorState(editor, deploymentState.sock, instance.id)

  const onChange = (newConfig: Partial<ContainerConfig>) => {
    throttle(() => {
      const value = { ...state.config, ...newConfig }

      actions.onPatch(instance.id, newConfig)

      const errors = getContainerConfigFieldErrors(value)
      setFieldErrors(errors)
      setJsonError(jsonErrorOf(errors))
    })
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
      url: deploymentUrl(product.id, version.id, deployment.id),
    },
    {
      name: instance.image.name,
      url: instanceConfigUrl(product.id, version.id, deployment.id, instance.id),
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
    <Layout title={t('common:image')}>
      <PageHeading pageLink={pageLink} sublinks={sublinks} />

      <DyoCard className="p-4">
        <div className="flex mb-4 justify-between items-start">
          <DyoHeading element="h4" className="text-xl text-bright">
            {instance.image.name}
            {instance.image.name !== state.config?.name ? ` (${state.config?.name})` : null}
          </DyoHeading>

          {getViewStateButtons()}
        </div>
        {viewState === 'editor' && <ImageConfigFilters onChange={setFilters} />}
      </DyoCard>

      {viewState === 'editor' && (
        <DyoCard className="flex flex-col mt-4 px-4 w-full">
          <CommonConfigSection
            disabled={!deploymentState.mutable}
            selectedFilters={filters}
            config={state.config}
            onChange={onChange}
            editorOptions={editorState}
            fieldErrors={fieldErrors}
            secrets="value"
            definedSecrets={state.definedSecrets}
            publicKey={deployment.publicKey}
          />
          <CraneConfigSection
            disabled={!deploymentState.mutable}
            selectedFilters={filters}
            config={state.config}
            onChange={onChange}
            editorOptions={editorState}
          />
          <DagentConfigSection
            disabled={!deploymentState.mutable}
            selectedFilters={filters}
            config={state.config}
            onChange={onChange}
            editorOptions={editorState}
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
            onPatch={onChange}
            onParseError={err => setJsonError(err?.message)}
            convertConfigToJson={imageConfigToJsonContainerConfig}
          />
        </DyoCard>
      )}
    </Layout>
  )
}

export default InstanceDetailsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const { productId, versionId, deploymentId, instanceId } = context.query

  const crux = cruxFromContext(context)
  const product = await crux.products.getById(productId as string)
  const version = await crux.versions.getById(versionId as string)
  const deploymentDetails = await crux.deployments.getById(deploymentId as string)
  const node = await crux.nodes.getNodeDetails(deploymentDetails.nodeId)

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
