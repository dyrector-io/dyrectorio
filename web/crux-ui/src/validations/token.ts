import * as yup from 'yup'
import { nameRule } from './common'

// eslint-disable-next-line import/prefer-default-export
export const generateTokenSchema = yup.object().shape({
  name: nameRule.required(),
  expirationInDays: yup.number().min(0).required(),
})
