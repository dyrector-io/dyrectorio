/* eslint-disable import/prefer-default-export */
import yup from './yup'
import { descriptionRule, nameRule } from './common'

export const configBundleSchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
})
