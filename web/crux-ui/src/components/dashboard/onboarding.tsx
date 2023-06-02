import { DyoCard } from '@app/elements/dyo-card'
import DyoIcon from '@app/elements/dyo-icon'
import { Onboarding as OnboardingDto, OnboardingItem } from '@app/models'
import {
  deploymentDeployUrl,
  deploymentLogUrl,
  deploymentUrl,
  imageConfigUrl,
  nodeUrl,
  projectUrl,
  ROUTE_NODES,
  ROUTE_PROJECTS,
  ROUTE_TEAMS_CREATE,
  teamUrl,
  versionUrl,
} from '@app/routes'
import useTranslation from 'next-translate/useTranslation'
import OnboardingEntry from './onboarding-entry'

const onboardItemToHref = (
  onboarding: OnboardingDto,
  key: keyof OnboardingDto,
  item: OnboardingItem,
): string | null => {
  if (key === 'createTeam') {
    if (!onboarding.signUp.done) {
      return null
    }

    return item.done ? teamUrl(onboarding.createTeam.resourceId) : ROUTE_TEAMS_CREATE
  }

  if (key === 'createNode') {
    if (!onboarding.createTeam.done) {
      return null
    }

    return item.done ? nodeUrl(item.resourceId) : ROUTE_NODES
  }

  if (key === 'createProject') {
    if (!onboarding.createNode.done) {
      return null
    }

    return item.done ? projectUrl(item.resourceId) : ROUTE_PROJECTS
  }

  if (key === 'createVersion') {
    const projectId = onboarding.createProject.resourceId
    if (!projectId) {
      return null
    }

    return item.done ? versionUrl(projectId, item.resourceId) : projectUrl(projectId)
  }

  if (key === 'addImages') {
    const projectId = onboarding.createProject.resourceId
    const versionId = onboarding.createVersion.resourceId
    if (!versionId) {
      return null
    }

    return item.done
      ? imageConfigUrl(projectId, versionId, item.resourceId)
      : versionUrl(projectId, versionId, { section: 'images' })
  }

  if (key === 'addDeployment') {
    if (!onboarding.addImages.done) {
      return null
    }

    const projectId = onboarding.createProject.resourceId
    const versionId = onboarding.createVersion.resourceId

    return item.done ? deploymentUrl(item.resourceId) : versionUrl(projectId, versionId, { section: 'deployments' })
  }

  if (key === 'deploy') {
    const deploymentId = onboarding.addDeployment.resourceId
    if (!deploymentId) {
      return null
    }

    return item.done ? deploymentLogUrl(deploymentId) : deploymentDeployUrl(deploymentId)
  }

  return null
}

type OnboardingProps = {
  onboarding?: OnboardingDto
  onClose?: VoidFunction
}

const Onboarding = (props: OnboardingProps) => {
  const { t } = useTranslation('dashboard')

  const { onboarding, onClose } = props

  const lastOnboardIndex = Object.keys(onboarding).length - 1
  const nextOnboardIndex = Object.values(onboarding).findIndex(it => !it.done)

  return (
    <DyoCard className="flex flex-row p-6">
      <div className="flex flex-col">
        {Object.entries(onboarding).map(([key, value], index) => {
          const first = index === 0
          const last = index === lastOnboardIndex

          return (
            <OnboardingEntry
              key={key}
              onboardKey={key}
              done={value.done}
              step={index + 1}
              nextStep={index === nextOnboardIndex}
              line={first ? 'bottom' : last ? 'top' : 'vertical'}
              href={onboardItemToHref(onboarding, key as keyof OnboardingDto, value)}
            />
          )
        })}
      </div>

      <DyoIcon src="/close.svg" alt={t('common:close')} onClick={onClose} />
    </DyoCard>
  )
}

export default Onboarding
