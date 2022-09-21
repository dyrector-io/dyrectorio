import { UserRole, USER_ROLE_VALUES } from '@app/models/user'
import * as yup from 'yup'
import { nameRule } from './common'

export const inviteUserSchema = yup.object().shape({
  email: yup.string().email().required(),
})

export const selectTeamSchema = yup.object().shape({
  id: yup.string().required(),
})

export const createTeamSchema = yup.object().shape({
  name: nameRule,
})

export const updateTeamSchema = createTeamSchema

export const roleSchema = yup.mixed<UserRole>().oneOf([...USER_ROLE_VALUES])
