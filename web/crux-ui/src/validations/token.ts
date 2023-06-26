import * as yup from 'yup'
import { nameRule } from './common'

// eslint-disable-next-line import/prefer-default-export
export const generateTokenSchema = yup.object().shape({
  name: nameRule.required(),
  expirationInDays: yup.mixed().test(
    'is-token-expiration',
    // eslint-disable-next-line no-template-curly-in-string
    '${label} is not a valid token expiration',
    value => value === 'never' || typeof value === 'number',
  ),
})
