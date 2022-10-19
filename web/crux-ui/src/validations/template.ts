import { ProductType, PRODUCT_TYPE_VALUES } from '@app/models'
import * as yup from 'yup'
import { descriptionRule, nameRule } from './common'

// eslint-disable-next-line import/prefer-default-export
export const applyTemplateSchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
  type: yup.mixed<ProductType>().oneOf([...PRODUCT_TYPE_VALUES]),
})
