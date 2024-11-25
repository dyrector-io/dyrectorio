import { ContainerConfigPortRangeDto } from 'src/app/container/container.dto'
import { EnvironmentRule, ImageValidation } from 'src/app/image/image.dto'
import { ContainerPort } from 'src/app/node/node.dto'
import { CruxBadRequestException } from 'src/exception/crux-exception'
import { UID_MAX, UID_MIN } from 'src/shared/const'
import * as yup from 'yup'
import {
  CONTAINER_DEPLOYMENT_STRATEGY_VALUES,
  CONTAINER_EXPOSE_STRATEGY_VALUES,
  CONTAINER_LOG_DRIVER_VALUES,
  CONTAINER_NETWORK_MODE_VALUES,
  CONTAINER_RESTART_POLICY_TYPE_VALUES,
  CONTAINER_STATE_VALUES,
  CONTAINER_VOLUME_TYPE_VALUES,
  ContainerDeploymentStrategyType,
  ContainerExposeStrategy,
  ContainerLogDriverType,
  ContainerNetworkMode,
  ContainerRestartPolicyType,
  ContainerVolumeType,
  Metrics,
  PORT_MAX,
  UniqueKeyValue,
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
        .matches(/^[^\s]+(\s+[^\s]+)*$/g), // any characters but no trailing whitespaces
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

const routingRule = yup.object().shape({
  domain: yup.string().nullable(),
  path: yup.string().nullable(),
  stripPath: yup.bool().nullable(),
  uploadLimit: yup.string().nullable(),
})

const exposeRule = yup.mixed<ContainerExposeStrategy>().oneOf([...CONTAINER_EXPOSE_STRATEGY_VALUES])
const restartPolicyRule = yup.mixed<ContainerRestartPolicyType>().oneOf([...CONTAINER_RESTART_POLICY_TYPE_VALUES])
const networkModeRule = yup.mixed<ContainerNetworkMode>().oneOf([...CONTAINER_NETWORK_MODE_VALUES])
const deploymentStrategyRule = yup
  .mixed<ContainerDeploymentStrategyType>()
  .oneOf([...CONTAINER_DEPLOYMENT_STRATEGY_VALUES])

const logDriverRule = yup.mixed<ContainerLogDriverType>().oneOf([...CONTAINER_LOG_DRIVER_VALUES])

const volumeTypeRule = yup.mixed<ContainerVolumeType>().oneOf([...CONTAINER_VOLUME_TYPE_VALUES])

const configContainerRule = yup.object().shape({
  image: yup.string().required(),
  volume: yup.string().required(),
  path: yup.string().required(),
  keepFiles: yup.boolean().default(false).required(),
})

const healthCheckConfigRule = yup.object().shape({
  port: portNumberRule.nullable().optional(),
  livenessProbe: yup.string().nullable().optional(),
  readinessProbe: yup.string().nullable().optional(),
  startupProbe: yup.string().nullable().optional(),
})

const resourceConfigRule = yup.object().shape({
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

const storageRule = yup.object().shape({
  bucket: yup.string().required(),
  path: yup.string().required(),
})

const createOverlapTest = (
  schema: yup.NumberSchema<number, object, number>,
  portRanges: ContainerConfigPortRangeDto[],
  field: Exclude<keyof ContainerConfigPortRangeDto, 'id'>,
) =>
  // eslint-disable-next-line no-template-curly-in-string
  schema.test('port-range-overlap', '${path} overlaps port ranges', value =>
    portRanges.length > 0
      ? !portRanges.some(it => {
          const portRange = it[field]
          return value >= portRange.from && value <= portRange.to
        })
      : true,
  )

// note: here yup passes reference as array
const portConfigRule = yup.mixed().when('portRanges', ([portRanges]) => {
  if (!portRanges?.length) {
    return yup.array(
      yup.object().shape({
        internal: portNumberRule,
        external: portNumberOptionalRule,
      }),
    ).nullable().optional()
  }

  return yup
    .array(
      yup.object().shape({
        internal: createOverlapTest(portNumberRule, portRanges, 'internal'),
        external: createOverlapTest(portNumberOptionalRule, portRanges, 'external'),
      }),
    ).nullable().optional()
})

const portRangeConfigRule = yup.array(
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

const volumeConfigRule = yup.array(
  yup.object().shape({
    name: yup.string().required(),
    path: yup.string().required(),
    size: yup.string().nullable(),
    class: yup.string().nullable(),
    type: volumeTypeRule,
  }),
)

const initContainerVolumeLinkRule = yup.array(
  yup.object().shape({
    name: yup.string().required(),
    path: yup.string().required(),
  }),
)

const initContainerRule = yup.array(
  yup.object().shape({
    name: yup.string().required().matches(/^\S+$/g),
    image: yup.string().required(),
    command: shellCommandSchema.default([]).nullable(),
    args: shellCommandSchema.default([]).nullable(),
    environment: uniqueKeyValuesSchema.default([]).nullable(),
    useParentConfig: yup.boolean().default(false).required(),
    volumes: initContainerVolumeLinkRule.default([]).nullable(),
  }),
)

const logConfigRule = yup.object().shape({
  driver: logDriverRule,
  options: uniqueKeyValuesSchema.default([]).nullable(),
})

const markerRule = yup.object().shape({
  deployment: uniqueKeyValuesSchema.default([]).nullable(),
  service: uniqueKeyValuesSchema.default([]).nullable(),
  ingress: uniqueKeyValuesSchema.default([]).nullable(),
})

const uniqueSecretKeySchema = yup
  .array(
    yup.object().shape({
      key: yup.string().required().ensure().matches(/^\S+$/g), // all characters are non-whitespaces
    }),
  )
  .ensure()
  .test('keysAreUnique', 'Keys must be unique', arr => new Set(arr.map(it => it.key)).size === arr.length)

const uniqueSecretKeyValuesSchema = yup
  .array(
    yup.object().shape({
      key: yup.string().required().ensure().matches(/^\S+$/g), // all characters are non-whitespaces
      value: yup.string().when('encrypt', {
        is: encrypt => !!encrypt,
        then: s => s.ensure(),
        otherwise: s => s.nullable(),
      }),
    }),
  )
  .ensure()
  .test('keysAreUnique', 'Keys must be unique', arr => new Set(arr.map(it => it.key)).size === arr.length)

const createMetricsPortRule = (ports: ContainerPort[]) => {
  if (!ports?.length) {
    return portNumberOptionalRule.nullable().optional()
  }

  // eslint-disable-next-line no-template-curly-in-string
  return portNumberOptionalRule.test('metric-port', '${path} is missing the internal port definition', value =>
    value && ports.length > 0 ? ports.some(it => it.internal === value) : true,
  )
}

const metricsRule = yup.mixed().when(['ports'], ([ports]) => {
  const portRule = createMetricsPortRule(ports)

  return yup.object().when({
    is: (it: Metrics) => it?.enabled,
    then: schema =>
      schema.shape({
        enabled: yup.boolean(),
        path: yup.string().nullable(),
        port: portRule,
      }),
  }).nullable().optional()
})

const expectedContainerStateRule = yup.object().shape({
  state: yup.string().default(null).nullable().oneOf(CONTAINER_STATE_VALUES),
  timeout: yup.number().default(null).nullable().min(0),
  exitCode: yup.number().default(0).nullable().min(-127).max(128),
})

const containerConfigSchema = yup.object().shape({
  name: yup.string().optional().nullable().matches(/^\S+$/g),
  environment: uniqueKeyValuesSchema.optional().nullable(),
  secrets: uniqueSecretKeySchema.optional().nullable(),
  routing: routingRule.optional().nullable(),
  expose: exposeRule.optional().nullable(),
  user: yup.number().default(null).min(UID_MIN).max(UID_MAX).optional().nullable(),
  workingDirectory: yup.string().optional().nullable().matches(/^\S+$/g),
  tty: yup.boolean().optional().nullable(),
  configContainer: configContainerRule.optional().nullable(),
  ports: portConfigRule.optional().nullable(),
  portRanges: portRangeConfigRule.optional().nullable(),
  volumes: volumeConfigRule.optional().nullable(),
  commands: shellCommandSchema.optional().nullable(),
  args: shellCommandSchema.optional().nullable(),
  initContainers: initContainerRule.optional().nullable(),
  capabilities: uniqueKeyValuesSchema.optional().nullable(),
  storageId: yup.string().optional().nullable(),
  storageConfig: storageRule.optional().nullable(),

  // dagent:
  logConfig: logConfigRule.optional().nullable(),
  restartPolicy: restartPolicyRule.optional().nullable(),
  networkMode: networkModeRule.optional().nullable(),
  networks: uniqueKeysOnlySchema.optional().nullable(),
  dockerLabels: uniqueKeyValuesSchema.optional().nullable(),
  expectedState: expectedContainerStateRule.optional().nullable(),

  // crane
  deploymentStrategy: deploymentStrategyRule.optional().nullable(),
  customHeaders: uniqueKeysOnlySchema.optional().nullable(),
  proxyHeaders: yup.boolean().optional().nullable(),
  useLoadBalancer: yup.boolean().optional().nullable(),
  extraLBAnnotations: uniqueKeyValuesSchema.optional().nullable(),
  healthCheckConfig: healthCheckConfigRule.optional().nullable(),
  resourceConfig: resourceConfigRule.optional().nullable(),
  annotations: markerRule.optional().nullable(),
  labels: markerRule.optional().nullable(),
  metrics: metricsRule.optional().nullable(),
})

export const concreteContainerConfigSchema = yup.object().shape({
  name: yup.string().optional().nullable(),
  environment: uniqueKeyValuesSchema.optional().nullable(),
  secrets: uniqueSecretKeyValuesSchema.optional().nullable(),
  routing: routingRule.optional().nullable(),
  expose: exposeRule.optional().nullable(),
  user: yup.number().optional().nullable().min(-1).max(UID_MAX),
  tty: yup.boolean().optional().nullable(),
  configContainer: configContainerRule.optional().nullable(),
  ports: portConfigRule.optional().nullable(),
  portRanges: portRangeConfigRule.optional().nullable(),
  volumes: volumeConfigRule.optional().nullable(),
  commands: shellCommandSchema.optional().nullable(),
  args: shellCommandSchema.optional().nullable(),
  initContainers: initContainerRule.optional().nullable(),
  capabilities: uniqueKeyValuesSchema.optional().nullable(),
  storageId: yup.string().optional().nullable(),
  storageConfig: storageRule.optional().nullable(),

  // dagent:
  logConfig: logConfigRule.optional().nullable(),
  restartPolicy: restartPolicyRule.optional().nullable(),
  networkMode: networkModeRule.optional().nullable(),
  networks: uniqueKeysOnlySchema.optional().nullable(),
  dockerLabels: uniqueKeyValuesSchema.optional().nullable(),
  expectedState: expectedContainerStateRule.optional().nullable(),

  // crane
  deploymentStrategy: deploymentStrategyRule.optional().nullable(),
  customHeaders: uniqueKeysOnlySchema.optional().nullable(),
  proxyHeaders: yup.boolean().optional().nullable(),
  useLoadBalancer: yup.boolean().optional().nullable(),
  extraLBAnnotations: uniqueKeyValuesSchema.optional().nullable(),
  healthCheckConfig: healthCheckConfigRule.optional().nullable(),
  resourceConfig: resourceConfigRule.optional().nullable(),
  annotations: markerRule.optional().nullable(),
  labels: markerRule.optional().nullable(),
  metrics: metricsRule.optional().nullable(),
})

const validateEnvironmentRule = (rule: EnvironmentRule, index: number, env: UniqueKeyValue) => {
  const { key, value } = env

  try {
    switch (rule.type) {
      case 'boolean':
        yup.boolean().validateSync(value)
        break
      case 'int':
        yup.number().validateSync(value)
        break
      case 'string':
        yup.string().validateSync(value)
        break
      default:
        return new yup.ValidationError('errors:yup.mixed.default', rule.type, `environment[${index}]`)
    }
  } catch (fieldError) {
    const err = new yup.ValidationError(fieldError.message, key, `environment[${index}]`)
    err.params = {
      ...fieldError.params,
      path: key,
    }
    return err
  }

  return null
}

const testEnvironment = (validation: ImageValidation, arr: UniqueKeyValue[]) => {
  if (!validation) {
    return null
  }

  const requiredKeys = Object.entries(validation.environmentRules)
    .filter(([, rule]) => rule.required)
    .map(([key]) => key)
  const foundKeys = arr.map(it => it.key)

  const missingKey = requiredKeys.find(it => !foundKeys.includes(it))
  if (missingKey) {
    const err = new yup.ValidationError('errors:yup.mixed.required', missingKey, 'environment')
    err.params = {
      path: missingKey,
    }
    return err
  }

  const fieldErrors = arr
    .map((it, index) => {
      const { key } = it
      const rule = validation.environmentRules[key]
      if (!rule) {
        return null
      }

      return validateEnvironmentRule(rule, index, it)
    })
    .filter(it => !!it)

  if (fieldErrors.length > 0) {
    const err = new yup.ValidationError(fieldErrors, missingKey, 'environment')
    return err
  }

  return null
}

export const createStartDeploymentSchema = (instanceValidation: Record<string, ImageValidation>) =>
  yup.object({
    config: containerConfigSchema,
    configBundles: yup.array(
      yup.object({
        configBundle: yup.object({
          config: containerConfigSchema,
        }),
      }),
    ),
    instances: yup
      .array(
        yup.object({
          id: yup.string(),
          config: concreteContainerConfigSchema,
        }),
      )
      .test(
        'containerNameAreUnique',
        'Container names must be unique',
        instances => new Set(instances.map(it => it.config.name)).size === instances.length,
      )
      .test('instanceEnvironments', 'Instance environments must match their image label rules.', instances => {
        const errors = instances
          .map(it => {
            const validation = instanceValidation[it.id]
            if (!validation) {
              return null
            }

            return testEnvironment(validation, it.config.environment as UniqueKeyValue[])
          })
          .filter(it => !!it)

        if (errors.length > 0) {
          return new yup.ValidationError(errors, null, 'environment')
        }

        return true
      }),
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
      then: () =>
        yup.object({
          imageNamePrefix: yup.string().required(),
        }),
    })
    .when('type', {
      is: type => type === 'v2',
      then: () =>
        yup.object({
          url: yup.string().required(),
          user: yup.string(),
          token: yup.string(),
        }),
    })
    .when('type', {
      is: type => type === 'gitlab',
      then: () =>
        yup.object({
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
      then: () =>
        yup.object({
          user: yup.string().required(),
          token: yup.string().required(),
          imageNamePrefix: yup.string().required(),
          namespace: yup.string().required(),
        }),
    })
    .when(['type'], {
      is: type => type === 'google',
      then: () =>
        yup.object({
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

export const nullifyUndefinedProperties = (candidate: object) => {
  if (candidate) {
    Object.entries(candidate).forEach(entry => {
      const [key, value] = entry
      if (typeof value === 'undefined') {
        candidate[key] = null
      }
    })
  }
}

export const yupValidate = (schema: yup.AnySchema, candidate: any) => {
  try {
    schema.validateSync(candidate)
  } catch (err) {
    const validationError = err as yup.ValidationError
    throw new CruxBadRequestException({
      message: 'Validation failed',
      property: validationError.path,
      value: validationError.errors,
      error: validationError.type,
    })
  }
}
