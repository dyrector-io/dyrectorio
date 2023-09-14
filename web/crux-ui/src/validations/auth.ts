import { OidcProvider, OIDC_PROVIDER_VALUES } from '@app/models'
import yup from './yup'
import { identityNameRule, passwordLengthRule } from './common'

export const registerWithPasswordSchema = yup.object().shape({
  password: passwordLengthRule.required().label('common:password'),
  email: yup.string().email().required().label('common:email'),
  firstName: identityNameRule.required().label('common:firstName'),
  lastName: identityNameRule.min(0).label('common:lastName'),
})

export const registerWithOidcSchema = yup.object().shape({
  provider: yup.mixed<OidcProvider>().oneOf([...OIDC_PROVIDER_VALUES]),
  firstName: identityNameRule.required().label('common:firstName'),
  lastName: identityNameRule.min(0).label('common:lastName'),
  email: yup.string().email().required().label('common:email'),
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
  email: yup.string().email().required().label('common:email'),
})

export const verifyCodeSchema = yup.object().shape({
  code: yup.string().required().label('common:code'),
})

export const passwordSchema = yup.object().shape({
  password: yup.string().required().label('common:password'),
  confirmPassword: yup.string().required().label('Confirm password'),
})

export const userProfileSchema = yup.object().shape({
  email: yup.string().email().required().label('common:email'),
  firstName: identityNameRule.required().label('common:firstName'),
  lastName: identityNameRule.min(0).label('common:lastName'),
})

export const recoverySchema = yup.object().shape({
  email: yup.string().email().required().label('common:email'),
})
