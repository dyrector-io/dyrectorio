import * as yup from 'yup'
import { AnyObject } from 'yup/lib/types'
import { DYO_ICONS } from './elements/dyo-icon-picker'
import {
  NodeType,
  NODE_TYPE_VALUES,
  NotificationType,
  NOTIFICATION_TYPE_VALUES,
  ProductType,
  PRODUCT_TYPE_VALUES,
  RegistryType,
  REGISTRY_TYPE_VALUES,
  UserRole,
  USER_ROLE_VALUES,
  VersionType,
  VERSION_TYPE_VALUES,
} from './models'
import { uniqueKeyValuesSchema, explicitContainerConfigSchema, containerConfigSchema, deploymentSchema } from '@dyrectorio/common'

export const getValidationError = (schema: yup.AnySchema, candidate: any): yup.ValidationError => {
  try {
    schema.validateSync(candidate)
    return null
  } catch (e) {
    return e
  }
}

const stringStringMapRule = yup.object().test(it => {
  const entries = Object.entries(it)
  const strings = entries.filter(entry => {
    const [key, value] = entry
    return typeof key === 'string' && typeof value === 'string'
  })

  return entries.length === strings.length
})

const iconRule = yup
  .string()
  .oneOf([null, ...DYO_ICONS])
  .nullable()

const nameRule = yup.string().required().min(3).max(70)
const descriptionRule = yup.string().optional()

export const updateProductSchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
})

export const createProductSchema = updateProductSchema.concat(
  yup.object().shape({
    type: yup.mixed<ProductType>().oneOf([...PRODUCT_TYPE_VALUES]),
  }),
)

const registryCredentialRole = yup.string().when(['type', '_private'], {
  is: (type, _private) => ['gitlab', 'github'].includes(type) || ((type === 'v2' || type === 'google') && _private),
  then: yup.string().required(),
})

const googleRegistryUrls = ['gcr.io', 'us.gcr.io', 'eu.gcr.io', 'asia.gcr.io'] as const

export const registrySchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
  type: yup.mixed<RegistryType>().oneOf([...REGISTRY_TYPE_VALUES]),
  icon: iconRule,
  imageNamePrefix: yup.string().when('type', {
    is: type => ['hub', 'gitlab', 'github', 'google'].includes(type),
    then: yup.string().required(),
  }),
  url: yup
    .string()
    .when(['type', 'selfManaged'], {
      is: (type, selfManaged) => type === 'v2' || type === 'google' || (type === 'gitlab' && selfManaged),
      then: yup.string().required(),
    })
    .when(['type'], { is: type => type === 'google', then: yup.string().oneOf([...googleRegistryUrls]) }),
  apiUrl: yup.string().when(['type', 'selfManaged'], {
    is: (type, selfManaged) => type === 'gitlab' && selfManaged,
    then: yup.string().required(),
  }),
  user: registryCredentialRole,
  token: registryCredentialRole,
})

export const nodeSchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
  icon: iconRule,
  type: yup.mixed<NodeType>().oneOf([...NODE_TYPE_VALUES]),
})

export const nodeType = yup.object().shape({
  type: yup.mixed<NodeType>().oneOf([...NODE_TYPE_VALUES]),
})

export const increaseVersionSchema = yup.object().shape({
  name: nameRule,
  changelog: descriptionRule,
})

export const updateVersionSchema = increaseVersionSchema.concat(
  yup.object().shape({
    default: yup.boolean().required(),
  }),
)

export const createVersionSchema = updateVersionSchema.concat(
  yup.object().shape({
    type: yup.mixed<VersionType>().oneOf([...VERSION_TYPE_VALUES]),
  }),
)

export const createDeploymentSchema = yup.object().shape({
  nodeId: yup.string().required(),
})

export const updateDeploymentSchema = yup.object().shape({
  name: nameRule,
  description: yup.string(),
  prefix: yup.string().required(),
})

export const completeContainerConfigSchema = explicitContainerConfigSchema.shape({
  name: yup.string().required(),
  environment: stringStringMapRule.default({}),
  capabilities: stringStringMapRule.default({}),
})

export const patchContainerConfigSchema = yup.object().shape({
  environment: uniqueKeyValuesSchema.nullable(),
  capabilities: uniqueKeyValuesSchema.nullable(),
  config: explicitContainerConfigSchema.nullable(),
})

export const imageSchema = yup.object().shape({
  environment: uniqueKeyValuesSchema,
  config: containerConfigSchema,
})

export const inviteUserSchema = yup.object().shape({
  email: yup.string().email().required(),
})

export const selectTeamSchema = yup.object().shape({
  id: yup.string().required(),
})

export const createTeamSchema = yup.object().shape({
  name: nameRule,
})

export const updateTeamSchema = createTeamSchema

export const roleSchema = yup.mixed<UserRole>().oneOf([...USER_ROLE_VALUES])

export const notificationSchema = yup.object().shape({
  name: nameRule,
  type: yup
    .mixed<NotificationType>()
    .oneOf([...NOTIFICATION_TYPE_VALUES])
    .required(),
  url: yup
    .string()
    .url()
    .when('type', (type: NotificationType, schema: yup.StringSchema<string, AnyObject, string>) => {
      let pattern: RegExp
      switch (type) {
        case 'discord':
          pattern = /^https:\/\/(discord|discordapp).com\/api\/webhooks/
          break
        case 'slack':
          pattern = /^https:\/\/hooks.slack.com\/services/
          break
        case 'teams':
          pattern = /^https:\/\/[a-zA-Z]+.webhook.office.com/
          break
      }

      return schema.matches(pattern)
    })
    .required(),
})
