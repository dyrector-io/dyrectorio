import { DeploymentStatusEnum } from '.prisma/client'
import { Injectable } from '@nestjs/common'
import { OnboardingDto, OnboardingItemDto } from './dashboard.dto'

@Injectable()
export default class DashboardMapper {
  teamToOnboard(team: DashboardTeam): OnboardingDto {
    const project: DashboardProject = team.projects.find(Boolean)
    let version: DashboardVersion = null
    let image: ResourceWithId = null
    let deployment: DashboardDeployment = null

    if (project) {
      version = project.versions.find(Boolean)
      if (version) {
        image = version.images.find(Boolean)
        deployment = version.deployments.find(Boolean)
      }
    }

    const onboard: OnboardingDto = {
      signUp: {
        done: true,
      },
      createTeam: {
        done: true,
        resourceId: team.id,
      },
      createNode: this.resourceToOnboardItem(team.nodes.find(Boolean)),
      createProject: this.resourceToOnboardItem(project),
      createVersion: this.resourceToOnboardItem(version),
      addImages: this.resourceToOnboardItem(image),
      addDeployment: this.resourceToOnboardItem(deployment),
      deploy: {
        done: (deployment && deployment.status !== 'preparing') ?? false,
      },
    }

    return onboard
  }

  private resourceToOnboardItem(resource: ResourceWithId | null): OnboardingItemDto {
    if (!resource) {
      return {
        done: false,
      }
    }

    return {
      done: true,
      resourceId: resource.id,
    }
  }
}

type ResourceWithId = {
  id: string
}

type DashboardDeployment = ResourceWithId & {
  status: DeploymentStatusEnum
}

type DashboardVersion = ResourceWithId & {
  images: ResourceWithId[]
  deployments: DashboardDeployment[]
}

type DashboardProject = ResourceWithId & {
  versions: DashboardVersion[]
}

export type DashboardTeam = ResourceWithId & {
  nodes: ResourceWithId[]
  projects: DashboardProject[]
}
