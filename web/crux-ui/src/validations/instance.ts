import { MergedContainerConfigData } from '@app/models'
import { Translate } from 'next-translate'
import { getConfigFieldErrorsForSchema, ContainerConfigValidationErrors } from './image'
import { createMergedContainerConfigSchema } from './container'

// eslint-disable-next-line import/prefer-default-export
export const getMergedContainerConfigFieldErrors = (
  newConfig: MergedContainerConfigData,
  validation: Record<string, string>,
  t: Translate,
): ContainerConfigValidationErrors =>
  getConfigFieldErrorsForSchema(createMergedContainerConfigSchema(validation), newConfig, t)
