import { ContainerConfig } from '@app/models/grpc/protobuf/proto/crux'
import { ValidationError } from 'yup'
import { getValidationError } from './common'
import { containerConfigSchema } from './container'

export const getContainerConfigFieldErrors = (newConfig: ContainerConfig): ValidationError[] =>
  getValidationError(containerConfigSchema, newConfig, { abortEarly: false })?.inner ?? []

export const jsonErrorOf = (fieldErrors: ValidationError[]) => (fieldErrors.length > 0 ? fieldErrors[0].message : null)
