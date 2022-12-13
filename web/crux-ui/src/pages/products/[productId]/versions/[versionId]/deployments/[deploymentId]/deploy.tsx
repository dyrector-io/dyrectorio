import { Layout } from '@app/components/layout'
import DeploymentContainerStatusList from '@app/components/products/versions/deployments/deployment-container-status-list'
import DeploymentDetailsCard from '@app/components/products/versions/deployments/deployment-details-card'
import DeploymentEventsTerminal from '@app/components/products/versions/deployments/deployment-events-terminal'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import DyoButton from '@app/elements/dyo-button'
import useWebSocket from '@app/hooks/use-websocket'
import {
  DeploymentEvent,
  DeploymentEventMessage,
  DeploymentRoot,
  DeploymentStatus,
  WS_TYPE_DEPLOYMENT_EVENT,
  WS_TYPE_DEPLOYMENT_EVENT_LIST,
  WS_TYPE_FETCH_DEPLOYMENT_EVENTS,
} from '@app/models'
import {
  deploymentDeployUrl,
  deploymentUrl,
  deploymentWsUrl,
  nodeInspectUrl,
  productUrl,
  ROUTE_PRODUCTS,
  versionUrl,
} from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useState } from 'react'
import { getDeploymentRoot } from '../[deploymentId]'

interface DeployPageProps {
  deployment: DeploymentRoot
}

const DeployPage = (props: DeployPageProps) => {
  const { deployment: propsDeployment } = props

  const { t } = useTranslation('deployments')

  const router = useRouter()

  const [events, setEvents] = useState<DeploymentEvent[]>([])
  const [status, setStatus] = useState<DeploymentStatus>(propsDeployment.status)

  const deployment = {
    ...propsDeployment,
    status,
  }
  const { product, version } = deployment

  const sock = useWebSocket(deploymentWsUrl(product.id, deployment.versionId, deployment.id), {
    onOpen: () => {
      sock.send(WS_TYPE_FETCH_DEPLOYMENT_EVENTS, {})
    },
  })

  sock.on(WS_TYPE_DEPLOYMENT_EVENT_LIST, (message: DeploymentEventMessage[]) => {
    let newEvents = [...message, ...events]
    newEvents = newEvents.sort((one, other) => new Date(other.createdAt).getTime() - new Date(one.createdAt).getTime())
    setEvents(newEvents)

    const deploymentStatuses = newEvents.filter(it => it.type === 'deploymentStatus')
    if (deploymentStatuses.length > 0) {
      setStatus(deploymentStatuses[deploymentStatuses.length - 1].value as DeploymentStatus)
    }
  })
  sock.on(WS_TYPE_DEPLOYMENT_EVENT, (message: DeploymentEventMessage) => {
    const newEvents = [...events, message]
    setEvents(newEvents)

    if (message.type === 'deploymentStatus') {
      setStatus(message.value as DeploymentStatus)
    }
  })

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
    {
      name: t('common:deploy'),
      url: deploymentDeployUrl(product.id, version.id, deployment.id),
    },
  ]

  const onBack = () => router.back()

  return (
    <Layout
      title={t('deploysNameDeploy', {
        product: product.name,
        version: version.name,
        name: deployment.node.name,
      })}
    >
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        <DyoButton className="px-6 ml-auto" href={nodeInspectUrl(deployment.nodeId, deployment.prefix)}>
          {t('common:inspect')}
        </DyoButton>

        <DyoButton className="px-6 ml-4" onClick={onBack}>
          {t('common:back')}
        </DyoButton>
      </PageHeading>

      <DeploymentDetailsCard className="flex flex-grow p-6" deployment={deployment}>
        <DeploymentContainerStatusList deployment={propsDeployment} />
        <DeploymentEventsTerminal events={events} />
      </DeploymentDetailsCard>
    </Layout>
  )
}

export default DeployPage

const getPageServerSideProps = async (context: NextPageContext) => ({
  props: {
    deployment: await getDeploymentRoot(context, cruxFromContext(context)),
  },
})

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
