import { OidcProvider, OIDC_PROVIDER_VALUES } from '@app/models'
import * as yup from 'yup'
import { identityNameRule } from './common'

export const registerWithPasswordSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
  firstName: identityNameRule.required(),
  lastName: identityNameRule.min(0),
})

export const registerWithOidcSchema = yup.object().shape({
  provider: yup.mixed<OidcProvider>().oneOf([...OIDC_PROVIDER_VALUES]),
})

export const registerSchema = yup.object().when('method', {
  is: 'password',
  then: registerWithPasswordSchema,
  otherwise: registerWithOidcSchema,
})

export const verifyEmailSchema = yup.object().shape({
  email: yup.string().email().required(),
})

export const verifyCodeSchema = yup.object().shape({
  code: yup.string().required(),
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
