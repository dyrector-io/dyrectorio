import { Layout } from '@app/components/layout'
import DeploymentContainerStatusList, {
  ContainerProgress,
} from '@app/components/projects/versions/deployments/deployment-container-status-list'
import DeploymentDetailsCard from '@app/components/projects/versions/deployments/deployment-details-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import EventsTerminal from '@app/components/shared/events-terminal'
import PageHeading from '@app/components/shared/page-heading'
import DyoButton from '@app/elements/dyo-button'
import useTeamRoutes from '@app/hooks/use-team-routes'
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
import { terminalDateFormat, withContextAuthorization } from '@app/utils'
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
  const routes = useTeamRoutes()
  const router = useRouter()

  const [events, setEvents] = useState<DeploymentEvent[]>([])
  const [status, setStatus] = useState<DeploymentStatus>(propsDeployment.status)
  const [progress, setProgress] = useState<Record<string, ContainerProgress>>({})

  const deployment = {
    ...propsDeployment,
    status,
  }
  const { project, version } = deployment

  const sortEvents = (one: DeploymentEventMessage, other: DeploymentEventMessage) =>
    new Date(one.createdAt).getTime() - new Date(other.createdAt).getTime()

  const sock = useWebSocket(routes.deployment.detailsSocket(deployment.id), {
    onOpen: () => {
      sock.send(WS_TYPE_FETCH_DEPLOYMENT_EVENTS, {})
    },
  })

  sock.on(WS_TYPE_DEPLOYMENT_EVENT_LIST, (message: DeploymentEventMessage[]) => {
    setEvents(it => [...message, ...it].sort(sortEvents))

    const deploymentStatuses = message.filter(it => it.type === 'deployment-status')
    if (deploymentStatuses.length > 0) {
      setStatus(deploymentStatuses[deploymentStatuses.length - 1].deploymentStatus)
    }

    const containerProgresses = message.filter(it => it.type === 'container-progress')
    if (containerProgresses.length > 0) {
      setProgress(it =>
        containerProgresses.reduce((prev, event) => {
          prev[event.containerProgress.instanceId] = {
            status: event.containerProgress.status,
            progress: event.containerProgress.progress,
          }

          return prev
        }, it),
      )
    }
  })
  sock.on(WS_TYPE_DEPLOYMENT_EVENT, (message: DeploymentEventMessage) => {
    setEvents(it => [...it, message])

    if (message.type === 'deployment-status') {
      setStatus(message.deploymentStatus)
    }

    if (message.type === 'container-progress') {
      setProgress(it => ({
        ...it,
        [message.containerProgress.instanceId]: {
          status: message.containerProgress.status,
          progress: message.containerProgress.progress,
        },
      }))
    }
  })

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
    {
      name: t('common:deploy'),
      url: routes.deployment.deploy(deployment.id),
    },
  ]

  const onBack = () => router.replace(routes.deployment.details(deployment.id))

  const formatEvent = (event: DeploymentEvent) => {
    if (event.type !== 'log') {
      return []
    }

    const date = new Date(event.createdAt)
    const { log, level } = event.log
    const className = level === 'warn' ? 'text-dyo-orange' : level === 'error' ? 'text-error-red' : null
    return (
      log.map(it => ({
        content: `${terminalDateFormat(date)}\xa0\xa0\xa0\xa0${it}`,
        className,
      })) ?? []
    )
  }

  return (
    <Layout
      title={t('deploysNameDeploy', {
        project: project.name,
        version: version.name,
        name: deployment.node.name,
      })}
    >
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        <DyoButton className="px-6 ml-auto" href={routes.node.inspect(deployment.node.id, deployment.prefix)}>
          {t('common:inspect')}
        </DyoButton>

        <DyoButton className="px-6 ml-4" onClick={onBack}>
          {t('common:back')}
        </DyoButton>
      </PageHeading>

      <DeploymentDetailsCard className="flex flex-grow p-6" deployment={deployment}>
        <DeploymentContainerStatusList className="mb-4" deployment={propsDeployment} progress={progress} />
        <EventsTerminal events={events} formatEvent={formatEvent} />
      </DeploymentDetailsCard>
    </Layout>
  )
}

export default DeployPage

const getPageServerSideProps = async (context: NextPageContext) => ({
  props: {
    deployment: await getDeploymentRoot(context),
  },
})

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
