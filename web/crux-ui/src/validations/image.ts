import * as yup from 'yup'
import { containerConfigSchema, explicitContainerConfigSchema, uniqueKeyValuesSchema } from './container'

export const imageSchema = yup.object().shape({
  environment: uniqueKeyValuesSchema,
  config: containerConfigSchema,
})

export const patchContainerConfigSchema = yup.object().shape({
  environment: uniqueKeyValuesSchema.nullable(),
  capabilities: uniqueKeyValuesSchema.nullable(),
  config: explicitContainerConfigSchema.nullable(),
})
