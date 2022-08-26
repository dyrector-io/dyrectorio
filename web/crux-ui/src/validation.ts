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
import {
  ExplicitContainerDeploymentStrategyType,
  ExplicitContainerNetworkMode,
  ExplicitContainerRestartPolicyType,
  EXPLICIT_CONTAINER_DEPLOYMENT_STRATEGY_VALUES,
  EXPLICIT_CONTAINER_NETWORK_MODE_VALUES,
  EXPLICIT_CONTAINER_RESTART_POLICY_TYPE_VALUES,
} from './models-config'

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

const registryCredentialRole = yup.mixed().when(['type', '_private'], {
  is: (type, _private) => ['gitlab', 'github'].includes(type) || ((type === 'v2' || type === 'google') && _private),
  then: yup.string().required(),
  otherwise: yup.mixed().transform(value => value ? value : undefined)
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
  name: yup.string().required(),
  description: yup.string(),
  prefix: yup.string().required(),
})

const portNumberRule = yup.number().positive().lessThan(65536).required()

export const explicitContainerConfigSchema = yup.object().shape({
  ingress: yup
    .object()
    .shape({
      name: yup.string(),
      host: yup.string(),
      uploadLimitInBytes: yup.string().optional(),
    })
    .default({})
    .optional()
    .nullable(),
  expose: yup
    .object()
    .shape({
      public: yup.boolean(),
      tls: yup.boolean(),
    })
    .default({})
    .optional()
    .nullable(),
  importContainer: yup
    .object()
    .shape({
      volume: yup.string(),
      command: yup.string(),
      environments: yup.object().shape({}),
    })
    .default({})
    .optional()
    .nullable(),
  configContainer: yup
    .object()
    .shape({
      image: yup.string(),
      volume: yup.string(),
      path: yup.boolean(),
      keepFiles: yup.boolean(),
    })
    .default({})
    .optional()
    .nullable(),
  user: yup.number().positive().nullable().default(null).optional(),
  TTY: yup.boolean().default(false).optional(),
  ports: yup
    .array(
      yup.object().shape({
        internal: portNumberRule,
        external: portNumberRule,
      }),
    )
    .default([])
    .optional(),
  portRanges: yup
    .array(
      yup.object().shape({
        internal: yup.object().shape({ from: portNumberRule, to: portNumberRule }),
        external: yup.object().shape({ from: portNumberRule, to: portNumberRule }),
      }),
    )
    .default([])
    .optional(),
  volumes: yup
    .array(
      yup.object().shape({
        name: yup.string(),
        path: yup.string(),
        size: yup.string().optional(),
        type: yup.string().optional(),
        class: yup.string().optional(),
      }),
    )
    .default([])
    .optional(),
  commands: yup.array(yup.string()).default([]).optional(),
  args: yup.array(yup.string()).default([]).optional(),

  //dagent:
  logConfig: yup
    .object()
    .shape({
      type: yup.string(),
      config: yup.object().shape({}),
    })
    .default({})
    .optional()
    .nullable(),
  restartPolicy: yup
    .mixed<ExplicitContainerRestartPolicyType>()
    .oneOf([...EXPLICIT_CONTAINER_RESTART_POLICY_TYPE_VALUES])
    .default('unless_stopped')
    .optional(),
  networkMode: yup
    .mixed<ExplicitContainerNetworkMode>()
    .oneOf([...EXPLICIT_CONTAINER_NETWORK_MODE_VALUES])
    .default('none')
    .optional(),

  //crane:
  deploymentStrategy: yup
    .mixed<ExplicitContainerDeploymentStrategyType>()
    .oneOf([...EXPLICIT_CONTAINER_DEPLOYMENT_STRATEGY_VALUES])
    .default('recreate')
    .optional(),
  customHeaders: yup.array(yup.string()).default([]).optional(),
  proxyHeaders: yup.boolean().default(false).optional(),
  useLoadBalancer: yup.boolean().default(false).optional(),
  healthCheckConfig: yup
    .object()
    .shape({
      port: yup.number().positive().lessThan(65536),
      livenessProbe: yup.string().optional(),
      readinessProbe: yup.string().optional(),
      startupProbe: yup.string().optional(),
    })
    .default({})
    .optional()
    .nullable(),
  resourceConfig: yup
    .object()
    .shape({
      limits: yup
        .object()
        .shape({ cpu: yup.string().nullable(), memory: yup.string().nullable() })
        .default({})
        .optional(),
      requests: yup
        .object()
        .shape({ cpu: yup.string().nullable(), memory: yup.string().nullable() })
        .default({})
        .optional(),
    })
    .default({})
    .nullable()
    .optional(),
  extraLBAnnotations: yup.object().shape({}).default({}).nullable().optional(),
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
  config: explicitContainerConfigSchema.nullable(),
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
      overriddenConfig: explicitContainerConfigSchema.nullable(),
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

export const updateTeamSchema = createTeamSchema

export const roleSchema = yup.mixed<UserRole>().oneOf([...USER_ROLE_VALUES])

export const notificationSchema = yup.object().shape({
  name: yup.string().required(),
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
