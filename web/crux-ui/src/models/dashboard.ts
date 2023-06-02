export type OnboardingItem = {
  done: boolean
  resourceId?: string
}

export type Onboarding = {
  signUp: OnboardingItem
  createTeam: OnboardingItem
  createNode: OnboardingItem
  createProject: OnboardingItem
  createVersion: OnboardingItem
  addImages: OnboardingItem
  addDeployment: OnboardingItem
  deploy: OnboardingItem
}

export type Dashboard = {
  users: number
  auditLogEntries: number
  projects: number
  versions: number
  deployments: number
  failedDeployments: number
  onboarding: Onboarding
}

export type DashboardActiveNodes = {
  id: string
  name: string
  address: string
  version: string
}

export type DashboardDeployment = {
  id: string
  project: string
  version: string
  node: string
  changelog: string
  deployedAt: string
  projectId: string
  versionId: string
}
