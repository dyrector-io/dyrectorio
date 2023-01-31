import * as yup from 'yup'
import { identityNameRule } from './common'

export const registerSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
  firstName: identityNameRule.required(),
  lastName: identityNameRule.min(0),
})

export const verifySchema = yup.object().shape({
  email: yup.string().email().required(),
})

export const passwordSchema = yup.object().shape({
  password: yup.string().required().label('Password'),
  confirmPassword: yup.string().required().label('Confirm password'),
})

export const userProfileSchema = yup.object().shape({
  email: yup.string().email().required(),
  firstName: yup.string().required(),
  lastName: yup.string().required(),
})

export const recoverySchema = yup.object().shape({
  email: yup.string().email().required(),
})
