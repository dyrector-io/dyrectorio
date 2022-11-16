import * as yup from 'yup'
import { identityNameRule } from './common'

// eslint-disable-next-line import/prefer-default-export
export const registerSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
  firstName: identityNameRule.required(),
  lastName: identityNameRule.min(0),
})
