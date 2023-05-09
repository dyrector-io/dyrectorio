import { CruxBadRequestException } from 'src/exception/crux-exception'
import * as yup from 'yup'
import {
  CONTAINER_DEPLOYMENT_STRATEGY_VALUES,
  CONTAINER_EXPOSE_STRATEGY_VALUES,
  CONTAINER_LOG_DRIVER_VALUES,
  CONTAINER_NETWORK_MODE_VALUES,
  CONTAINER_RESTART_POLICY_TYPE_VALUES,
  CONTAINER_VOLUME_TYPE_VALUES,
  ContainerDeploymentStrategyType,
  ContainerExposeStrategy,
  ContainerLogDriverType,
  ContainerNetworkMode,
  ContainerRestartPolicyType,
  ContainerVolumeType,
  PORT_MAX,
} from './container'

export const nameRuleOptional = yup.string().trim().min(3).max(70)
export const nameRule = yup.string().required().trim().min(3).max(70)
export const descriptionRule = yup.string().optional()

export const shellCommandSchema = yup
  .array(
    yup.object().shape({
      key: yup
        .string()
        .required()
        .ensure()
        .matches(/^\S.*\S$/g), // any characters but no trailing whitespaces
      value: yup.string().ensure(),
    }),
  )
  .ensure()

export const uniqueKeyValuesSchema = yup
  .array(
    yup.object().shape({
      key: yup.string().required().ensure().matches(/^\S+$/g), // all characters are non-whitespaces
      value: yup.string().ensure(),
    }),
  )
  .ensure()
  .test('keysAreUnique', 'Keys must be unique', arr => new Set(arr.map(it => it.key)).size === arr.length)

export const uniqueKeysOnlySchema = yup
  .array(
    yup.object().shape({
      key: yup.string().required().ensure().matches(/^\S+$/g),
    }),
  )
  .ensure()
  .test('keysAreUnique', 'Keys must be unique', arr => new Set(arr.map(it => it.key)).size === arr.length)

const portNumberBaseRule = yup
  .number()
  .positive()
  .lessThan(PORT_MAX + 1)
const portNumberOptionalRule = portNumberBaseRule.nullable()
const portNumberRule = portNumberBaseRule.required()

const ingressRule = yup
  .object()
  .shape({
    name: yup.string().required(),
    host: yup.string().required(),
    uploadLimitInBytes: yup.string().nullable(),
  })
  .default({})
  .nullable()

const exposeRule = yup
  .mixed<ContainerExposeStrategy>()
  .oneOf([...CONTAINER_EXPOSE_STRATEGY_VALUES])
  .default('none')
  .required()

const instanceExposeRule = yup
  .mixed<ContainerExposeStrategy>()
  .oneOf([...CONTAINER_EXPOSE_STRATEGY_VALUES, null])
  .nullable()

const restartPolicyRule = yup
  .mixed<ContainerRestartPolicyType>()
  .oneOf([...CONTAINER_RESTART_POLICY_TYPE_VALUES])
  .default('no')

const instanceRestartPolicyRule = yup
  .mixed<ContainerRestartPolicyType>()
  .oneOf([...CONTAINER_RESTART_POLICY_TYPE_VALUES, null])
  .nullable()

const networkModeRule = yup
  .mixed<ContainerNetworkMode>()
  .oneOf([...CONTAINER_NETWORK_MODE_VALUES])
  .default('bridge')
  .required()

const instanceNetworkModeRule = yup
  .mixed<ContainerNetworkMode>()
  .oneOf([...CONTAINER_NETWORK_MODE_VALUES, null])
  .nullable()

const deploymentStrategyRule = yup
  .mixed<ContainerDeploymentStrategyType>()
  .oneOf([...CONTAINER_DEPLOYMENT_STRATEGY_VALUES])
  .required()

const instanceDeploymentStrategyRule = yup
  .mixed<ContainerDeploymentStrategyType>()
  .oneOf([...CONTAINER_DEPLOYMENT_STRATEGY_VALUES, null])
  .nullable()

const logDriverRule = yup
  .mixed<ContainerLogDriverType>()
  .oneOf([...CONTAINER_LOG_DRIVER_VALUES])
  .default('none')

const volumeTypeRule = yup
  .mixed<ContainerVolumeType>()
  .oneOf([...CONTAINER_VOLUME_TYPE_VALUES])
  .default('rwo')

const configContainerRule = yup
  .object()
  .shape({
    image: yup.string().required(),
    volume: yup.string().required(),
    path: yup.string().required(),
    keepFiles: yup.boolean().default(false).required(),
  })
  .default({})
  .nullable()
  .optional()

const healthCheckConfigRule = yup
  .object()
  .shape({
    port: portNumberRule.nullable().optional(),
    livenessProbe: yup.string().nullable().optional(),
    readinessProbe: yup.string().nullable().optional(),
    startupProbe: yup.string().nullable().optional(),
  })
  .default({})
  .optional()
  .nullable()

const resourceConfigRule = yup
  .object()
  .shape({
    limits: yup
      .object()
      .shape({
        cpu: yup.string().nullable(),
        memory: yup.string().nullable(),
      })
      .nullable()
      .optional(),
    memory: yup
      .object()
      .shape({
        cpu: yup.string().nullable(),
        memory: yup.string().nullable(),
      })
      .nullable()
      .optional(),
    livenessProbe: yup.string().nullable(),
  })
  .default({})
  .nullable()
  .optional()

const storageRule = yup
  .object()
  .shape({
    bucket: yup.string().required(),
    path: yup.string().required(),
  })
  .default({})
  .nullable()
  .optional()

const portConfigRule = yup
  .array(
    yup.object().shape({
      internal: portNumberRule,
      external: portNumberOptionalRule,
    }),
  )
  .default([])
  .nullable()
  .optional()

const portRangeConfigRule = yup
  .array(
    yup.object().shape({
      internal: yup
        .object()
        .shape({
          from: portNumberRule,
          to: portNumberRule,
        })
        .default({})
        .required(),
      external: yup
        .object()
        .shape({
          from: portNumberRule,
          to: portNumberRule,
        })
        .default({})
        .required(),
    }),
  )
  .default([])
  .nullable()
  .optional()

const volumeConfigRule = yup
  .array(
    yup.object().shape({
      name: yup.string().required(),
      path: yup.string().required(),
      size: yup.string().nullable(),
      class: yup.string().nullable(),
      type: volumeTypeRule,
    }),
  )
  .default([])
  .nullable()
  .optional()

const initContainerVolumeLinkRule = yup.array(
  yup.object().shape({
    name: yup.string().required(),
    path: yup.string().required(),
  }),
)

const initContainerRule = yup
  .array(
    yup.object().shape({
      name: yup.string().required(),
      image: yup.string().required(),
      command: uniqueKeysOnlySchema.default([]).nullable(),
      args: uniqueKeysOnlySchema.default([]).nullable(),
      environments: uniqueKeyValuesSchema.default([]).nullable(),
      useParentConfig: yup.boolean().default(false).required(),
      volumes: initContainerVolumeLinkRule.default([]).nullable(),
    }),
  )
  .default([])
  .nullable()
  .optional()

const logConfigRule = yup
  .object()
  .shape({
    driver: logDriverRule,
    options: uniqueKeyValuesSchema.default([]).nullable(),
  })
  .default({})
  .nullable()
  .optional()

const markerRule = yup
  .object()
  .shape({
    deployment: uniqueKeyValuesSchema.default([]).nullable(),
    service: uniqueKeyValuesSchema.default([]).nullable(),
    ingress: uniqueKeyValuesSchema.default([]).nullable(),
  })
  .default({})
  .nullable()
  .optional()

const uniqueSecretKeyValuesSchema = yup
  .array(
    yup.object().shape({
      key: yup.string().required().ensure().matches(/^\S+$/g), // all characters are non-whitespaces
      value: yup.string().when('encrypt', {
        is: encrypt => !!encrypt,
        then: yup.string().ensure(),
        otherwise: yup.string().nullable(),
      }),
    }),
  )
  .ensure()
  .test('keysAreUnique', 'Keys must be unique', arr => new Set(arr.map(it => it.key)).size === arr.length)

export const containerConfigSchema = yup.object().shape({
  name: yup.string().required(),
  environments: uniqueKeyValuesSchema.default([]).nullable(),
  secrets: uniqueSecretKeyValuesSchema.default([]).nullable(),
  ingress: ingressRule,
  expose: exposeRule,
  user: yup.number().default(null).nullable(),
  tty: yup.boolean().default(false).required(),
  configContainer: configContainerRule,
  ports: portConfigRule,
  portRanges: portRangeConfigRule,
  volumes: volumeConfigRule,
  commands: shellCommandSchema.default([]).nullable(),
  args: shellCommandSchema.default([]).nullable(),
  initContainers: initContainerRule,
  capabilities: uniqueKeyValuesSchema.default([]).nullable(),
  storageId: yup.string().default(null).nullable(),
  storageConfig: storageRule,

  // dagent:
  logConfig: logConfigRule,
  restartPolicy: restartPolicyRule,
  networkMode: networkModeRule,
  networks: uniqueKeysOnlySchema.default([]).nullable(),
  dockerLabels: uniqueKeyValuesSchema.default([]).nullable(),

  // crane
  deploymentStrategy: deploymentStrategyRule,
  customHeaders: uniqueKeysOnlySchema.default([]).nullable(),
  proxyHeaders: yup.boolean().default(false).required(),
  useLoadBalancer: yup.boolean().default(false).required(),
  extraLBAnnotations: uniqueKeyValuesSchema.default([]).nullable(),
  healthCheckConfig: healthCheckConfigRule,
  resourceConfig: resourceConfigRule,
  annotations: markerRule,
  labels: markerRule,
})

export const instanceContainerConfigSchema = yup.object().shape({
  name: yup.string().nullable(),
  environments: uniqueKeyValuesSchema.default([]).nullable(),
  secrets: uniqueKeyValuesSchema.default([]).nullable(),
  ingress: ingressRule.nullable(),
  expose: instanceExposeRule,
  user: yup.number().default(null).nullable(),
  tty: yup.boolean().default(false).nullable(),
  configContainer: configContainerRule.nullable(),
  ports: portConfigRule.nullable(),
  portRanges: portRangeConfigRule.nullable(),
  volumes: volumeConfigRule.nullable(),
  commands: shellCommandSchema.default([]).nullable(),
  args: shellCommandSchema.default([]).nullable(),
  initContainers: initContainerRule.nullable(),
  capabilities: uniqueKeyValuesSchema.default([]).nullable(),
  storageId: yup.string().default(null).nullable(),
  storageConfig: storageRule,

  // dagent:
  logConfig: logConfigRule.nullable(),
  restartPolicy: instanceRestartPolicyRule,
  networkMode: instanceNetworkModeRule,
  networks: uniqueKeysOnlySchema.default([]).nullable(),
  dockerLabels: uniqueKeyValuesSchema.default([]).nullable(),

  // crane
  deploymentStrategy: instanceDeploymentStrategyRule,
  customHeaders: uniqueKeysOnlySchema.default([]).nullable(),
  proxyHeaders: yup.boolean().default(false).nullable(),
  useLoadBalancer: yup.boolean().default(false).nullable(),
  extraLBAnnotations: uniqueKeyValuesSchema.default([]).nullable(),
  healthCheckConfig: healthCheckConfigRule.nullable(),
  resourceConfig: resourceConfigRule.nullable(),
  annotations: markerRule.nullable(),
  labels: markerRule.nullable(),
})

export const deploymentSchema = yup.object({
  environment: uniqueKeyValuesSchema,
  instances: yup.array(
    yup.object({
      image: yup.object({
        config: containerConfigSchema,
      }),
      config: instanceContainerConfigSchema.nullable(),
    }),
  ),
})

const templateRegistrySchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
  icon: yup.string(),
  type: yup.string().required(),
  details: yup
    .mixed()
    .when('type', {
      is: type => type === 'hub',
      then: yup.object({
        imageNamePrefix: yup.string().required(),
      }),
    })
    .when('type', {
      is: type => type === 'v2',
      then: yup.object({
        url: yup.string().required(),
        user: yup.string(),
        token: yup.string(),
      }),
    })
    .when('type', {
      is: type => type === 'gitlab',
      then: yup.object({
        user: yup.string().required(),
        token: yup.string().required(),
        imageNamePrefix: yup.string().required(),
        url: yup.string(),
        apiUrl: yup.string(),
        namespace: yup.string().required(),
      }),
    })
    .when('type', {
      is: type => type === 'github',
      then: yup.object({
        user: yup.string().required(),
        token: yup.string().required(),
        imageNamePrefix: yup.string().required(),
        namespace: yup.string().required(),
      }),
    })
    .when(['type'], {
      is: type => type === 'google',
      then: yup.object({
        url: yup.string().required(),
        user: yup.string(),
        token: yup.string(),
        imageNamePrefix: yup.string().required(),
      }),
    }),
})

export const templateSchema = yup.object({
  name: yup.string(),
  description: yup.string(),
  technologies: yup.array(yup.string()),
  registries: yup.array(templateRegistrySchema),
  images: yup
    .array(
      yup.object({
        name: nameRuleOptional,
        registryName: yup.string().required(),
        image: yup.string().required(),
        tag: yup.string().required(),
        config: yup.object().required(),
        capabilities: uniqueKeyValuesSchema,
        environment: uniqueKeyValuesSchema,
        secrets: uniqueKeyValuesSchema,
      }),
    )
    .required(),
})

export const yupValidate = (schema: yup.AnySchema, candidate: any) => {
  try {
    schema.validateSync(candidate)
  } catch (err) {
    const validationError = err as yup.ValidationError
    throw new CruxBadRequestException({
      message: 'Validation failed',
      property: validationError.path,
      value: validationError.errors,
    })
  }
}
