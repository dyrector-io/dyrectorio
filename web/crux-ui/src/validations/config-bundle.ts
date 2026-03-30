import { descriptionRule, nameRule } from './common'
import yup from './yup'

// eslint-disable-next-line import-x/prefer-default-export
export const configBundleSchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
})
