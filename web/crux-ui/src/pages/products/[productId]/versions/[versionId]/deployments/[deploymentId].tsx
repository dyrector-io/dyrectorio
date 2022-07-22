import { Layout } from '@app/components/layout'
import DeploymentDetailsSection from '@app/components/products/versions/deployments/deployment-details-section'
import EditDeploymentCard from '@app/components/products/versions/deployments/edit-deployment-card'
import EditDeploymentInstances from '@app/components/products/versions/deployments/edit-deployment-instances'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import { DyoButton } from '@app/elements/dyo-button'
import LoadingIndicator from '@app/elements/loading-indicator'
import { defaultWsErrorHandler } from '@app/errors'
import { useWebSocket } from '@app/hooks/use-websocket'
import {
  DeploymentEnvUpdatedMessage,
  deploymentIsMutable,
  DeploymentRoot,
  WS_TYPE_DEPLOYMENT_ENV_UPDATED,
  WS_TYPE_DYO_ERROR,
  WS_TYPE_INSTANCE_UPDATED,
  WS_TYPE_PATCH_DEPLOYMENT_ENV,
  WS_TYPE_PATCH_INSTANCE,
} from '@app/models'
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
import { deploymentSchema, getValidationError } from '@app/validation'
import { Crux, cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast'

interface DeploymentDetailsPageProps {
  deployment: DeploymentRoot
}

const DeploymentDetailsPage = (props: DeploymentDetailsPageProps) => {
  const { t } = useTranslation('deployments')

  const router = useRouter()

  const product = props.deployment.product
  const version = props.deployment.version

  const [deployment, setDeployment] = useState(props.deployment)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const submitRef = useRef<() => Promise<any>>()

  const handleWsError = defaultWsErrorHandler(t)

  const sock = useWebSocket(deploymentWsUrl(deployment.product.id, deployment.version.id, deployment.id), {
    onSend: message => {
      if ([WS_TYPE_PATCH_INSTANCE, WS_TYPE_PATCH_DEPLOYMENT_ENV].includes(message.type)) {
        setSaving(true)
      }
    },
    onReceive: message => {
      if ([WS_TYPE_INSTANCE_UPDATED, WS_TYPE_DEPLOYMENT_ENV_UPDATED].includes(message.type)) {
        setSaving(false)
      } else if (message.type === WS_TYPE_DYO_ERROR) {
        handleWsError(message.payload)
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
    name: t('common:deployment'),
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
    const error = getValidationError(deploymentSchema, deployment)
    if (error) {
      toast.error(t('errors:invalid'))
      return
    }

    onOpenLog()
  }

  return (
    <Layout>
      <PageHeading pageLink={pageLink} subLinks={sublinks}>
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
            deleteModalDescription={t('deleteDescription', {
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
        <EditDeploymentCard
          deployment={deployment}
          submitRef={submitRef}
          onDeploymentEdited={it => setDeployment(it)}
        />
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

const getPageServerSideProps = async (context: NextPageContext) => {
  return {
    props: {
      deployment: await getDeploymentRoot(context, cruxFromContext(context)),
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)

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
