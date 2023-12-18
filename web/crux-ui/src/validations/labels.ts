/* eslint-disable import/prefer-default-export */
import { ENVIRONMENT_VALUE_TYPES, EnvironmentRule, EnvironmentValueType } from '@app/models'

/**
 * Parse dyrector.io specific image labels which contain environment validation rules.
 *
 * Format: org.dyectorio.env.ENV=rule1,rule2:value,...
 * Where
 *  - ENV is the name of the environment variable.
 *  - Rules are separated by a single comma.
 *  - Rules and their values are separated by colons.
 * Possible rules:
 *  - Type (required): "string", "boolean" or "int".
 *  - Required: "required" marks the environment as required.
 *  - Default value: "default:value".
 */
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
