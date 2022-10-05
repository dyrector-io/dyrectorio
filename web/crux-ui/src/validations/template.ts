import * as yup from 'yup'
import { nameRule } from './common'

export const applyTemplateSchema = yup.object().shape({
  productName: nameRule
})
