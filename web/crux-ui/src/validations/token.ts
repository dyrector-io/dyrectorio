import * as yup from 'yup'
import { nameRule } from './common'

// eslint-disable-next-line import/prefer-default-export
export const generateTokenSchema = yup.object().shape({
  name: nameRule.required(),
  expirationInDays: yup
    .mixed()
    .test(
      'is-token-expiration',
      '${label} is not a valid token expiration',
      value => value === 'never' || typeof value === 'number',
    ),
})
