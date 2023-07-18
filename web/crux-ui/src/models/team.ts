import { User, UserMetaTeam } from './user'

export type CreateTeam = {
  name: string
  slug: string
}
export type UpdateTeam = CreateTeam

export type TeamStatistics = {
  users: number
  projects: number
  nodes: number
  versions: number
  deployments: number
}
export const DEFAULT_TEAM_STATISTICS: TeamStatistics = {
  users: 1,
  projects: 0,
  nodes: 0,
  versions: 0,
  deployments: 0,
}

export type Team = Omit<UserMetaTeam, 'role'> & {
  statistics: TeamStatistics
}

export type TeamDetails = Team & {
  users: User[]
}

// https://gist.github.com/codeguy/6684588?permalink_comment_id=3426313#gistcomment-3426313
export const slugify = (name: string, separator: string) =>
  name
    .toString()
    .normalize('NFD') // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, '') // remove all chars not letters, numbers and spaces (to be replaced)
    .replace(/\s+/g, separator)

export const teamSlugFromName = (name: string) => {
  const slug = slugify(name, '-')

  if (slug.includes('-')) {
    // first character of
    const result = slug.split('-').reduce((prev, it) => prev + (it.length > 0 ? it[0] : ''), '')
    if (result.length >= 3) {
      return result
    }
  }

  if (slug.length >= 3) {
    return slug.substring(0, 3)
  }

  return slug
}
