import { ProductType, PRODUCT_TYPE_VALUES } from '@app/models/product'
import * as yup from 'yup'
import { descriptionRule, nameRule } from './common'

export const updateProductSchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
})

export const createProductSchema = updateProductSchema.concat(
  yup.object().shape({
    type: yup.mixed<ProductType>().oneOf([...PRODUCT_TYPE_VALUES]),
  }),
)
