import EditorBadge from '@app/components/editor/editor-badge'
import { Layout } from '@app/components/layout'
import NodeConnectionCard from '@app/components/nodes/node-connection-card'
import DeploymentDetailsSection from '@app/components/products/versions/deployments/deployment-details-section'
import EditDeploymentCard from '@app/components/products/versions/deployments/edit-deployment-card'
import EditDeploymentInstances from '@app/components/products/versions/deployments/edit-deployment-instances'
import useDeploymentState from '@app/components/products/versions/deployments/use-deployment-state'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import DyoButton from '@app/elements/dyo-button'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import LoadingIndicator from '@app/elements/loading-indicator'
import { defaultApiErrorHandler } from '@app/errors'
import { DeploymentRoot, mergeConfigs } from '@app/models'
import {
  deploymentApiUrl,
  deploymentDeployUrl,
  deploymentUrl,
  productUrl,
  ROUTE_PRODUCTS,
  versionUrl,
} from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { containerConfigSchema, getValidationError } from '@app/validations'
import { Crux, cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { ValidationError } from 'yup'

interface DeploymentDetailsPageProps {
  deployment: DeploymentRoot
}

const DeploymentDetailsPage = (props: DeploymentDetailsPageProps) => {
  const { deployment: propsDeployment } = props

  const { t } = useTranslation('deployments')

  const router = useRouter()
  const submitRef = useRef<() => Promise<any>>()

  const onApiError = defaultApiErrorHandler(t)
  const onWsError = (error: Error) => {
    // eslint-disable-next-line
    console.error('ws', 'edit-deployment', error)
    toast(t('errors:connectionLost'))
  }

  const [state, actions] = useDeploymentState({
    deployment: propsDeployment,
    onApiError,
    onWsError,
  })

  const { product, version, deployment, node } = state

  const pageLink: BreadcrumbLink = {
    name: t('common:deployments'),
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
  ]

  const onDelete = async () => {
    const res = await fetch(deploymentApiUrl(product.id, version.id, deployment.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      router.replace(ROUTE_PRODUCTS)
    } else {
      toast(t('errors:oops'))
    }
  }

  const navigateToLog = () => router.push(deploymentDeployUrl(product.id, version.id, deployment.id))

  const onDeploy = () => {
    if (node.status !== 'running') {
      toast.error(t('common:nodeUnreachable'))
      return
    }

    let error: ValidationError

    let i = 0

    while (!error && i < deployment.instances.length) {
      const instance = deployment.instances[i]
      const mergedConfig = mergeConfigs(instance.image.config, instance.overriddenConfig)
      error = getValidationError(containerConfigSchema, mergedConfig)
      i++
    }

    if (error) {
      console.error(error)
      toast.error(t('errors:invalid'))
      return
    }

    navigateToLog()
  }

  const onCopyDeployment = async () => {
    const url = await actions.onCopyDeployment()
    if (!url) {
      return
    }

    router.push(url)
  }

  useEffect(() => {
    if (state.mutable && node.status !== 'running') {
      toast.error(t('common:nodeUnreachable'))
    }
  }, [node.status, state.mutable, t])

  return (
    <Layout
      title={t('deploysName', {
        product: product.name,
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
        {state.saving ? <LoadingIndicator className="flex ml-4 my-auto" /> : null}

        {!state.mutable ? null : (
          <DetailsPageMenu
            onDelete={onDelete}
            editing={state.editing}
            setEditing={actions.setEditing}
            submitRef={submitRef}
            deleteModalTitle={t('common:confirmDelete', {
              name: t('common:deployment'),
            })}
            deleteModalDescription={t('common:deleteDescription', {
              name: t('common:deployment'),
            })}
          />
        )}

        {!state.copyable ? null : (
          <DyoButton className="px-6 ml-4" onClick={onCopyDeployment}>
            {t('common:copy')}
          </DyoButton>
        )}

        {!state.mutable ? (
          <DyoButton className="px-10 ml-auto" onClick={navigateToLog}>
            {t('log')}
          </DyoButton>
        ) : !state.editing ? (
          <DyoButton className="px-6 ml-4" onClick={onDeploy} disabled={node.status !== 'running'}>
            {t('common:deploy')}
          </DyoButton>
        ) : null}
      </PageHeading>

      {state.editing ? (
        <EditDeploymentCard
          productId={state.product.id}
          deployment={state.deployment}
          submitRef={submitRef}
          onDeploymentEdited={actions.onDeploymentEdited}
        />
      ) : (
        <>
          <div className="flex flex-row">
            <NodeConnectionCard className="w-1/3 p-6" node={state.node} showName />

            <DeploymentDetailsSection state={state} className="w-2/3 p-6 ml-2" />
          </div>

          <EditDeploymentInstances state={state} actions={actions} />
        </>
      )}

      <DyoConfirmationModal config={state.confirmationModal} className="w-1/4" confirmColor="bg-error-red" />
    </Layout>
  )
}

export default DeploymentDetailsPage

export const getDeploymentRoot = async (context: NextPageContext, crux: Crux) => {
  const { productId, versionId, deploymentId } = context.query

  const product = crux.products.getById(productId as string)
  const version = crux.versions.getById(versionId as string)
  const deployment = await crux.deployments.getById(deploymentId as string)
  const node = crux.nodes.getNodeDetails(deployment.nodeId)

  return {
    ...deployment,
    product: await product,
    version: await version,
    node: await node,
  } as DeploymentRoot
}

const getPageServerSideProps = async (context: NextPageContext) => ({
  props: {
    deployment: await getDeploymentRoot(context, cruxFromContext(context)),
  },
})

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
