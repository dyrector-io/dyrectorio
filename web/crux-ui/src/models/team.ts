import { User, UserMetaTeam } from './user'

export type CreateTeam = {
  name: string
}
export type UpdateTeam = CreateTeam

export type TeamStatistics = {
  users: number
  products: number
  nodes: number
  versions: number
  deployments: number
}
export const DEFAULT_TEAM_STATISTICS: TeamStatistics = {
  users: 1,
  products: 0,
  nodes: 0,
  versions: 0,
  deployments: 0,
}

export type Team = UserMetaTeam & {
  statistics: TeamStatistics
}

export type TeamDetails = Team & {
  users: User[]
}

export type ActiveTeamDetails = UserMetaTeam & {
  users: User[]
}
