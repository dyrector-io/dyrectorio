import { UserRoleEnum } from '@prisma/client'

type UserWithRole = {
  role: UserRoleEnum
}

export const userIsAdmin = (user: UserWithRole): boolean => user.role === 'owner' || user.role === 'admin'
export const userIsOwner = (user: UserWithRole): boolean => user.role === 'owner'
