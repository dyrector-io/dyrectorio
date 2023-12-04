import { ContainerConfigData, ENVIRONMENT_VALUE_TYPES, EnvironmentRule, EnvironmentValueType } from '@app/models'
import yup from './yup'
import { ErrorWithPath, getValidationError } from './common'
import { createContainerConfigSchema } from './container'
import { Translate } from 'next-translate'

export type ContainerConfigValidationErrors = Record<string, yup.ValidationError>

export const getConfigFieldErrorsForSchema = (
  schema: yup.Schema<any, any, any>,
  data: any,
  t: Translate,
): ContainerConfigValidationErrors => {
  const errors = getValidationError(schema, data, { abortEarly: false }, t)?.inner ?? []
  return errors.reduce((map, it) => {
    map[it.path] = it
    return map
  }, {} as ContainerConfigValidationErrors)
}

export const getContainerConfigFieldErrors = (
  newConfig: ContainerConfigData,
  imageLabels: Record<string, string>,
  t: Translate,
): ContainerConfigValidationErrors =>
  getConfigFieldErrorsForSchema(createContainerConfigSchema(imageLabels), newConfig, t)

export const jsonErrorOf = (fieldErrors: ContainerConfigValidationErrors) => {
  const entries = Object.entries(fieldErrors)
  if (entries.length <= 0) {
    return null
  }

  const entry = entries[0]
  const error = entry[1]
  return error.message
}

export const findErrorFor = (fieldErrors: ContainerConfigValidationErrors, path: string) =>
  fieldErrors[path]?.message ?? null

export const findErrorStartsWith = (
  fieldErrors: ContainerConfigValidationErrors,
  pathStartsWith: string,
): ErrorWithPath => {
  const entry = Object.entries(fieldErrors).find(([key, _]) => key.startsWith(pathStartsWith))

  return entry
    ? {
        path: entry[0],
        message: entry[1].message,
      }
    : null
}

export const matchError = (error: ErrorWithPath, pathEndsWith: string): boolean =>
  error?.path.endsWith(pathEndsWith) ?? false

export const parseDyrectorioEnvRules = (labels: Record<string, string>): Record<string, EnvironmentRule> => {
  if (!labels) {
    return {}
  }

  return Object.entries(labels).reduce((prev, [key, value]) => {
    if (!key.startsWith('org.dyectorio.env')) {
      return prev
    }

    const env = key.substring('org.dyectorio.env.'.length)
    const params = value.split(',')

    const rule: EnvironmentRule = {} as any
    params.forEach(it => {
      if (it === 'required') {
        rule.required = true
      } else if (ENVIRONMENT_VALUE_TYPES.includes(it as EnvironmentValueType)) {
        rule.type = it as EnvironmentValueType
      } else if (it.includes(':')) {
        const [prop, propValue] = it.split(':')
        rule[prop] = propValue
      } else {
        throw new Error(`Invalid label rule value: ${it}`)
      }
    })

    if (!rule.type) {
      throw new Error(`Label rule must define environment type: ${value}`)
    }

    return {
      ...prev,
      [env]: rule,
    }
  }, {})
}
