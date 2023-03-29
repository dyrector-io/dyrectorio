export const USER_ROLE_VALUES = ['owner', 'admin', 'user'] as const
export type UserRole = typeof USER_ROLE_VALUES[number]

export type UserStatus = 'pending' | 'verified' | 'expired' | 'declined'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastLogin?: string
}

export type InviteUser = {
  email: string
  firstName: string
  lastName?: string
}

export type UserMeta = {
  user: User
  activeTeamId?: string
  teams: UserMetaTeam[]
  invitations: UserMetaTeam[]
}

export type UserMetaTeam = {
  id: string
  name: string
}

export type ActivateTeam = {
  teamId: string
}

export type UpdateUserRole = {
  role: UserRole
}

export const roleToText = (role: UserRole) => {
  switch (role) {
    case 'owner':
      return 'common:role.owner'
    case 'admin':
      return 'common:role.admin'
    default:
      return 'common:role.user'
  }
}

export const activeTeamOf = (meta: UserMeta): UserMetaTeam => {
  const team = meta.teams.find(it => it.id === meta.activeTeamId)
  return team
}

export const userIsAdmin = (user: User): boolean => user.role === 'owner' || user.role === 'admin'
export const userIsOwner = (user: User): boolean => user.role === 'owner'
export const userStatusReinvitable = (status: UserStatus) => status !== 'declined' && status !== 'verified'
