import { UserRole, USER_ROLE_VALUES } from '@app/models'
import yup from './yup'
import { identityNameRule, nameRule } from './common'

export const teamSlugRule = yup
  .string()
  .min(3)
  .max(16)
  .matches(/^\S*$/)
  .label('common:slug')
  .meta({ regex: 'common:validation.notContainWhitespaces' })

export const inviteUserSchema = yup.object().shape({
  email: yup.string().email().required().label('common:email'),
  firstName: identityNameRule.required().label('common:firstName'),
  lastName: identityNameRule.min(0).label('common:lastName'),
})

export const createTeamSchema = yup.object().shape({
  name: nameRule,
  slug: teamSlugRule.required(),
})

export const updateTeamSchema = createTeamSchema

export const roleRule = yup.mixed<UserRole>().oneOf([...USER_ROLE_VALUES])
