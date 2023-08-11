import { OidcProvider, OIDC_PROVIDER_VALUES } from '@app/models'
import * as yup from 'yup'
import { identityNameRule, passwordLengthRule } from './common'

export const registerWithPasswordSchema = yup.object().shape({
  password: passwordLengthRule.required(),
  email: yup.string().email().required(),
  firstName: identityNameRule.required(),
  lastName: identityNameRule.min(0),
})

export const registerWithOidcSchema = yup.object().shape({
  provider: yup.mixed<OidcProvider>().oneOf([...OIDC_PROVIDER_VALUES]),
  firstName: identityNameRule.required(),
  lastName: identityNameRule.required(),
})

export const registerSchema = yup.object().shape({
  method: yup.string().required(),
  password: yup.string().when('method', {
    is: 'password',
    then: () => passwordLengthRule.required(),
  }),
  email: yup.string().when('method', {
    is: 'password',
    then: () => yup.string().email().required(),
  }),
  firstName: identityNameRule.when('method', {
    is: 'password',
    then: () => identityNameRule.required(),
  }),
  lastName: identityNameRule.when('method', {
    is: 'password',
    then: () => identityNameRule.min(0),
  }),
  provider: yup.mixed<OidcProvider>().when('method', {
    is: 'oidc',
    then: () => yup.mixed<OidcProvider>().oneOf([...OIDC_PROVIDER_VALUES]),
  }),
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
  firstName: identityNameRule.required(),
  lastName: identityNameRule.min(0),
})

export const recoverySchema = yup.object().shape({
  email: yup.string().email().required(),
})
