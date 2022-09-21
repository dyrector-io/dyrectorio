/* eslint-disable import/prefer-default-export */
import * as yup from 'yup'
import { explicitContainerConfigSchema, uniqueKeyValuesSchema } from './container'

export const instanceConfigSchema = yup.object().shape({
  environment: uniqueKeyValuesSchema,
  capabilities: uniqueKeyValuesSchema,
  config: explicitContainerConfigSchema.nullable(),
  secrets: uniqueKeyValuesSchema,
})
