import { DeploymentStatusEnum } from '.prisma/client'
import { Injectable } from '@nestjs/common'
import { OnboardingDto, OnboardingItemDto } from './dashboard.dto'

@Injectable()
export default class DashboardMapper {
  teamToOnboard(team: DashboardTeam): OnboardingDto {
    const onboard: OnboardingDto = {
      signUp: {
        done: true,
      },
      createTeam: {
        done: true,
        resourceId: team.id,
      },
      createNode: this.resourceToOnboardItem(team.deployment ? team.deployment.node : team.nodes.find(Boolean)),
      createProject: this.resourceToOnboardItem(team.project),
      createVersion: this.resourceToOnboardItem(team.version),
      addImages: this.resourceToOnboardItem(team.image),
      addDeployment: this.resourceToOnboardItem(team.deployment),
      deploy: {
        done: (team.deployment && team.deployment.status !== 'preparing') ?? false,
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
  node: ResourceWithId
}

export type DashboardTeam = ResourceWithId & {
  nodes: ResourceWithId[]
  project: ResourceWithId
  version: ResourceWithId
  image: ResourceWithId
  deployment: DashboardDeployment
}
