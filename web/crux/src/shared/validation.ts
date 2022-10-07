import { InvalidArgumentException } from 'src/exception/errors'
import * as yup from 'yup'
import {
  ExplicitContainerDeploymentStrategyType,
  ExplicitContainerNetworkMode,
  ExplicitContainerRestartPolicyType,
  EXPLICIT_CONTAINER_DEPLOYMENT_STRATEGY_VALUES,
  EXPLICIT_CONTAINER_NETWORK_MODE_VALUES,
  EXPLICIT_CONTAINER_RESTART_POLICY_TYPE_VALUES,
} from './model'

export const nameRuleOptional = yup.string().trim().min(3).max(70)
export const nameRule = yup.string().required().trim().min(3).max(70)
export const descriptionRule = yup.string().optional()

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
      path: yup.string(),
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
  initContainers: yup.array(
    yup.object().shape({
      name: yup.string().required(),
      image: yup.string().required(),
      args: yup.array(yup.string()).default([]).optional(),
      command: yup.array(yup.string()).default([]).optional(),
      useParentConfig: yup.boolean().default(false).optional(),
      environments: yup.object().shape({}).default({}).optional(),
      volumes: yup.array(
        yup.object().shape({
          name: yup.string(),
          path: yup.string(),
        }),
      ),
    }),
  ),

  // dagent:
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
  networks: yup.array(yup.string()).default([]).optional(),

  // crane:
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

export const containerConfigSchema = yup.object({
  environment: uniqueKeyValuesSchema,
  capabilities: uniqueKeyValuesSchema,
  secrets: uniqueKeysOnlySchema,
  config: explicitContainerConfigSchema,
})

export const instanceConfigSchema = yup.object().shape({
  environment: uniqueKeyValuesSchema,
  capabilities: uniqueKeyValuesSchema,
  config: explicitContainerConfigSchema.nullable(),
  secrets: uniqueKeyValuesSchema,
})

export const deploymentSchema = yup.object({
  environment: uniqueKeyValuesSchema,
  instances: yup.array(
    yup.object({
      config: instanceConfigSchema.nullable(),
      image: yup.object({
        config: containerConfigSchema,
      }),
    }),
  ),
})

const templateRegistrySchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
  icon: yup.string(),
  type: yup.string().required(),
  hub: yup.mixed().when(['type'], {
    is: type => type === 'hub',
    then: yup.object({
      imageNamePrefix: yup.string().required(),
    }),
  }),
  v2: yup.mixed().when(['type'], {
    is: type => type === 'v2',
    then: yup.object({
      url: yup.string().required(),
      user: yup.string(),
      token: yup.string(),
    }),
  }),
  gitlab: yup.mixed().when(['type'], {
    is: type => type === 'gitlab',
    then: yup.object({
      user: yup.string().required(),
      token: yup.string().required(),
      imageNamePrefix: yup.string().required(),
      url: yup.string(),
      apiUrl: yup.string(),
      namespace: yup.string().required(),
    }),
  }),
  github: yup.mixed().when(['type'], {
    is: type => type === 'github',
    then: yup.object({
      user: yup.string().required(),
      token: yup.string().required(),
      imageNamePrefix: yup.string().required(),
      namespace: yup.string().required(),
    }),
  }),
  google: yup.mixed().when(['type'], {
    is: type => type === 'google',
    then: yup.object({
      url: yup.string().required(),
      user: yup.string(),
      token: yup.string().required(),
      imageNamePrefix: yup.string().required(),
    }),
  }),
})

export const templateSchema = yup.object({
  name: yup.string(),
  description: yup.string(),
  registries: yup.array(templateRegistrySchema),
  product: yup
    .object({
      description: descriptionRule,
      type: yup.string().oneOf(['simple', 'complex']).required(),
      versions: yup
        .array(
          yup.object({
            name: nameRuleOptional,
            type: yup.string().oneOf(['incremental', 'rolling']),
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
          }),
        )
        .required(),
    })
    .required(),
})

export const yupValidate = (schema: yup.AnySchema, candidate: any) => {
  try {
    schema.validateSync(candidate)
  } catch (err) {
    const validationError = err as yup.ValidationError
    throw new InvalidArgumentException({
      message: 'Validation failed',
      property: validationError.path,
      value: validationError.errors,
    })
  }
}
