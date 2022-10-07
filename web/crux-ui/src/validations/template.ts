import * as yup from 'yup'
import { nameRule } from './common'

// eslint-disable-next-line import/prefer-default-export
export const applyTemplateSchema = yup.object().shape({
  productName: nameRule,
})
