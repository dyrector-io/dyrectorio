import * as yup from 'yup'
import { DYO_ICONS } from './elements/dyo-icon-picker'
import {
  ExplicitContainerNetworkMode,
  EXPLICIT_CONTAINER_NETWORK_MODE_VALUES,
  ProductType,
  PRODUCT_TYPE_VALUES,
  RegistryType,
  REGISTRY_TYPE_VALUES,
  VersionType,
  VERSION_TYPE_VALUES,
} from './models'

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

const nameRule = yup.string().required()
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
  is: (type, _private) => ['gitlab', 'github'].includes(type) || (type === 'v2' && _private),
  then: yup.string().required(),
})

export const registrySchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
  type: yup.mixed<RegistryType>().oneOf([...REGISTRY_TYPE_VALUES]),
  icon: iconRule,
  urlPrefix: yup.string().when('type', {
    is: type => ['hub', 'gitlab', 'github'].includes(type),
    then: yup.string().required(),
  }),
  url: yup.string().when(['type', 'selfManaged'], {
    is: (type, selfManaged) => type === 'v2' || (type === 'gitlab' && selfManaged),
    then: yup.string().required(),
  }),
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
  name: yup.string().required(),
  description: yup.string(),
  prefix: yup.string().required(),
})

const portNumberRule = yup.number().positive().lessThan(65536).required()

export const explicitContainerConfigSchema = yup.object().shape({
  ports: yup
    .array(
      yup.object().shape({
        internal: portNumberRule,
        external: portNumberRule,
      }),
    )
    .default([]),
  mounts: yup.array(yup.string()).default([]),
  networkMode: yup
    .mixed<ExplicitContainerNetworkMode>()
    .oneOf([...EXPLICIT_CONTAINER_NETWORK_MODE_VALUES])
    .default('none'),
  expose: yup.array(
    yup
      .object()
      .shape({
        public: yup.boolean().required(),
        tls: yup.boolean().required(),
      })
      .default([]),
  ),
  user: yup.number().positive().nullable().default(null),
})

export const completeContainerConfigSchema = explicitContainerConfigSchema.shape({
  name: yup.string().required(),
  environment: stringStringMapRule.default({}),
  capabilities: stringStringMapRule.default({}),
})

export const uniqueKeyValuesSchema = yup
  .array(
    yup.object().shape({
      key: yup.string().required().ensure().matches(/^\S+$/g), // all characters are non-whitespaces
      value: yup.string().ensure(),
    }),
  )
  .ensure()
  .test('keysAreUnique', 'Keys must be unique', arr => new Set(arr.map(it => it.key)).size === arr.length)

export const containerConfigSchema = yup.object().shape({
  environment: uniqueKeyValuesSchema,
  capabilities: uniqueKeyValuesSchema,
  config: explicitContainerConfigSchema,
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

export const deploymentSchema = yup.object().shape({
  environment: uniqueKeyValuesSchema,
  instances: yup.array(
    yup.object().shape({
      image: imageSchema,
      config: explicitContainerConfigSchema.nullable(),
    }),
  ),
})

export const inviteUserSchema = yup.object().shape({
  email: yup.string().email().required(),
})

export const selectTeamSchema = yup.object().shape({
  id: yup.string().required(),
})

export const createTeamSchema = yup.object().shape({
  name: yup.string().min(3).max(128),
})
