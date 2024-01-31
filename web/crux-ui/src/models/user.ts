export const USER_ROLE_VALUES = ['owner', 'admin', 'user'] as const
export type UserRole = (typeof USER_ROLE_VALUES)[number]

export const USER_STATUS_VALUES = ['pending', 'verified', 'expired', 'declined'] as const
export type UserStatus = (typeof USER_STATUS_VALUES)[number]

export type BasicUser = {
  id: string
  name: string
}

export type User = BasicUser & {
  email: string
  role: UserRole
  status: UserStatus
  lastLogin?: string
}

export type InviteUser = {
  email: string
  firstName: string
  lastName?: string
  captcha?: string
}

export type UserMetaUser = BasicUser

export type UserMetaBasicTeam = {
  id: string
  name: string
}

export type UserMetaTeam = UserMetaBasicTeam & {
  slug: string
  role: UserRole
}

export type UserMeta = {
  user: UserMetaUser
  teams: UserMetaTeam[]
  invitations: UserMetaBasicTeam[]
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

export const activeTeamOf = (meta: UserMeta, teamSlug: string): UserMetaTeam => {
  const team = meta?.teams.find(it => it.slug === teamSlug)
  return team
}

export const userIsAdmin = (user: User): boolean => user.role === 'owner' || user.role === 'admin'
export const userIsOwner = (user: User): boolean => user.role === 'owner'
export const userStatusReinvitable = (status: UserStatus) => status !== 'declined' && status !== 'verified'
