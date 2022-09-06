import { Layout } from '@app/components/layout'
import DeploymentDetailsSection from '@app/components/products/versions/deployments/deployment-details-section'
import EditDeploymentCard from '@app/components/products/versions/deployments/edit-deployment-card'
import EditDeploymentInstances from '@app/components/products/versions/deployments/edit-deployment-instances'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import DyoButton from '@app/elements/dyo-button'
import LoadingIndicator from '@app/elements/loading-indicator'
import useWebSocket from '@app/hooks/use-websocket'
import {
  DeploymentEnvUpdatedMessage,
  deploymentIsMutable,
  DeploymentRoot,
  WS_TYPE_DEPLOYMENT_ENV_UPDATED,
  WS_TYPE_INSTANCE_UPDATED,
  WS_TYPE_PATCH_DEPLOYMENT_ENV,
  WS_TYPE_PATCH_INSTANCE,
} from '@app/models'
import { mergeConfigs } from '@app/models-config'
import {
  deploymentApiUrl,
  deploymentDeployUrl,
  deploymentUrl,
  deploymentWsUrl,
  productUrl,
  ROUTE_PRODUCTS,
  versionUrl,
} from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { containerConfigSchema, getValidationError } from '@app/validation'
import { Crux, cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { ValidationError } from 'yup'

interface DeploymentDetailsPageProps {
  deployment: DeploymentRoot
}

const DeploymentDetailsPage = (props: DeploymentDetailsPageProps) => {
  const { deployment: propsDeployment } = props

  const { t } = useTranslation('deployments')

  const router = useRouter()

  const { product, version } = propsDeployment

  const [deployment, setDeployment] = useState(propsDeployment)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const submitRef = useRef<() => Promise<any>>()

  const sock = useWebSocket(deploymentWsUrl(deployment.product.id, deployment.version.id, deployment.id), {
    onSend: message => {
      if ([WS_TYPE_PATCH_INSTANCE, WS_TYPE_PATCH_DEPLOYMENT_ENV].includes(message.type)) {
        setSaving(true)
      }
    },
    onReceive: message => {
      if ([WS_TYPE_INSTANCE_UPDATED, WS_TYPE_DEPLOYMENT_ENV_UPDATED].includes(message.type)) {
        setSaving(false)
      }
    },
    onError: e => {
      // eslint-disable-next-line
      console.error('ws', 'edit-deployment', e)
      toast(t('errors:connectionLost'))
    },
  })

  sock.on(WS_TYPE_DEPLOYMENT_ENV_UPDATED, (message: DeploymentEnvUpdatedMessage) => {
    setDeployment({
      ...deployment,
      environment: message,
    })
  })

  const mutable = deploymentIsMutable(deployment.status)

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
      name: deployment.name,
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

  const onOpenLog = () => router.push(deploymentDeployUrl(product.id, version.id, deployment.id))

  const onDeploy = () => {
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

    onOpenLog()
  }

  const onDeploymentEdited = dep => {
    setDeployment(dep)
    setEditing(false)
  }

  return (
    <Layout
      title={t('deploysName', {
        product: product.name,
        version: version.name,
        name: deployment.node.name,
      })}
    >
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        {saving ? <LoadingIndicator className="flex ml-4 my-auto" /> : null}

        {!mutable ? null : (
          <DetailsPageMenu
            onDelete={onDelete}
            editing={editing}
            setEditing={setEditing}
            submitRef={submitRef}
            deleteModalTitle={t('common:confirmDelete', {
              name: deployment.name,
            })}
            deleteModalDescription={t('common:deleteDescription', {
              name: deployment.name,
            })}
          />
        )}

        {!mutable ? (
          <DyoButton className="px-10 ml-auto" onClick={onOpenLog}>
            {t('log')}
          </DyoButton>
        ) : !editing ? (
          <DyoButton className="px-6 ml-4" onClick={onDeploy}>
            {t('common:deploy')}
          </DyoButton>
        ) : null}
      </PageHeading>

      {editing ? (
        <EditDeploymentCard deployment={deployment} submitRef={submitRef} onDeploymentEdited={onDeploymentEdited} />
      ) : (
        <>
          <DeploymentDetailsSection deployment={deployment} deploySock={sock} />

          <EditDeploymentInstances deployment={deployment} />
        </>
      )}
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
