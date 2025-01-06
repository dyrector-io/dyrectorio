import { ConcreteContainerConfigData } from '@app/models'
import { Translate } from 'next-translate'
import { getConfigFieldErrorsForSchema, ContainerConfigValidationErrors } from './image'
import { createConcreteContainerConfigSchema } from './container'

// eslint-disable-next-line import/prefer-default-export
export const getConcreteContainerConfigFieldErrors = (
  newConfig: ConcreteContainerConfigData,
  validation: Record<string, string>,
  t: Translate,
): ContainerConfigValidationErrors =>
  getConfigFieldErrorsForSchema(createConcreteContainerConfigSchema(validation), newConfig, t)
