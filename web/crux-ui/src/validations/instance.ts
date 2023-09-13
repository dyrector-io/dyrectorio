import { MergedContainerConfigData } from '@app/models'
import { mergedContainerConfigSchema } from './container'
import { Translate } from 'next-translate'
import { getConfigFieldErrorsForSchema, ContainerConfigValidationErrors } from './image'

// eslint-disable-next-line import/prefer-default-export
export const getMergedContainerConfigFieldErrors = (
  newConfig: MergedContainerConfigData,
  t: Translate,
): ContainerConfigValidationErrors => getConfigFieldErrorsForSchema(mergedContainerConfigSchema, newConfig, t)
