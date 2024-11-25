import { DyoCard } from '@app/elements/dyo-card'
import DyoIcon from '@app/elements/dyo-icon'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Onboarding as OnboardingDto, OnboardingItem } from '@app/models'
import { ROUTE_TEAMS_CREATE, TeamRoutes, teamUrl } from '@app/routes'
import useTranslation from 'next-translate/useTranslation'
import { useMemo } from 'react'
import OnboardingEntry from './onboarding-entry'

type OnbardingLinkFactory = (onboarding: OnboardingDto, item: OnboardingItem) => string | null
const onboardingLinkFactories = (routes: TeamRoutes): Record<keyof OnboardingDto, OnbardingLinkFactory> => ({
  signUp: () => null,
  createTeam: (onboarding, item) => {
    if (!onboarding.signUp.done) {
      return null
    }

    return item.done ? teamUrl(onboarding.createTeam.resourceId) : ROUTE_TEAMS_CREATE
  },
  createNode: (onboarding, item) => {
    if (!onboarding.createTeam.done) {
      return null
    }

    return item.done ? routes.node.details(item.resourceId) : routes.node.list()
  },
  createProject: (onboarding, item) => {
    if (!onboarding.createNode.done) {
      return null
    }

    return item.done ? routes.project.details(item.resourceId) : routes.project.list()
  },
  createVersion: (onboarding, item) => {
    const projectId = onboarding.createProject.resourceId
    if (!projectId) {
      return null
    }

    return item.done ? routes.project.versions(projectId).details(item.resourceId) : routes.project.details(projectId)
  },
  addImages: (onboarding, item) => {
    const projectId = onboarding.createProject.resourceId
    const versionId = onboarding.createVersion.resourceId
    if (!versionId) {
      return null
    }

    return item.done
      ? routes.containerConfig.details(item.resourceId)
      : routes.project.versions(projectId).details(versionId, { section: 'images' })
  },
  addDeployment: (onboarding, item) => {
    if (!onboarding.addImages.done) {
      return null
    }

    const projectId = onboarding.createProject.resourceId
    const versionId = onboarding.createVersion.resourceId

    return item.done
      ? routes.deployment.details(item.resourceId)
      : routes.project.versions(projectId).details(versionId, { section: 'deployments' })
  },
  deploy: (onboarding, item) => {
    const deploymentId = onboarding.addDeployment.resourceId
    if (!deploymentId) {
      return null
    }

    return item.done ? routes.deployment.deploy(deploymentId) : routes.deployment.details(deploymentId)
  },
})

type OnboardingProps = {
  onboarding?: OnboardingDto
  onClose?: VoidFunction
}

const Onboarding = (props: OnboardingProps) => {
  const { onboarding, onClose } = props

  const { t } = useTranslation('dashboard')
  const routes = useTeamRoutes()

  const linkFactories = useMemo(() => onboardingLinkFactories(routes), [routes])

  const lastOnboardIndex = Object.keys(onboarding).length - 1
  const nextOnboardIndex = Object.values(onboarding).findIndex(it => !it.done)

  return (
    <DyoCard className="flex flex-row p-6">
      <div className="flex flex-col">
        {Object.entries(onboarding).map(([key, value], index) => {
          const first = index === 0
          const last = index === lastOnboardIndex

          const linkFactory = linkFactories[key]

          return (
            <OnboardingEntry
              key={key}
              onboardKey={key}
              done={value.done}
              step={index + 1}
              nextStep={index === nextOnboardIndex}
              line={first ? 'bottom' : last ? 'top' : 'vertical'}
              href={linkFactory(onboarding, value)}
            />
          )
        })}
      </div>

      <DyoIcon src="/close.svg" alt={t('common:close')} onClick={onClose} />
    </DyoCard>
  )
}

export default Onboarding
