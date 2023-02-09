import { MergedContainerConfigData } from '@app/models'
import { ValidationError } from 'yup'
import { getValidationError } from './common'
import { mergedContainerConfigSchema } from './container'

// eslint-disable-next-line import/prefer-default-export
export const getMergedContainerConfigFieldErrors = (newConfig: MergedContainerConfigData): ValidationError[] =>
  getValidationError(mergedContainerConfigSchema, newConfig, { abortEarly: false })?.inner ?? []
