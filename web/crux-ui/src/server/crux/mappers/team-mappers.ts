import { User, UserRole, UserStatus } from '@app/models'
import {
  UserResponse,
  UserRole as ProtoUserRole,
  userRoleFromJSON,
  userRoleToJSON,
  UserStatus as ProtoUserStatus,
  userStatusToJSON,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'

export const userStatusToDto = (status: ProtoUserStatus): UserStatus =>
  userStatusToJSON(status).toLowerCase() as UserStatus

export const userRoleToDto = (role: ProtoUserRole): UserRole => userRoleToJSON(role).toLowerCase() as UserRole

export const userToDto = (user: UserResponse): User => ({
  ...user,
  status: userStatusToDto(user.status),
  role: userRoleToDto(user.role),
  lastLogin: timestampToUTC(user.lastLogin),
})

export const userRoleToGrpc = (role: UserRole): ProtoUserRole => userRoleFromJSON(role.toUpperCase()) as ProtoUserRole
