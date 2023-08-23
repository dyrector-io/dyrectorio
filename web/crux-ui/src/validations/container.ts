import { UID_MAX } from '@app/const'
import {
  ContainerConfigExposeStrategy,
  ContainerConfigPortRange,
  ContainerDeploymentStrategyType,
  ContainerLogDriverType,
  ContainerNetworkMode,
  ContainerRestartPolicyType,
  CONTAINER_DEPLOYMENT_STRATEGY_VALUES,
  CONTAINER_EXPOSE_STRATEGY_VALUES,
  CONTAINER_LOG_DRIVER_VALUES,
  CONTAINER_NETWORK_MODE_VALUES,
  CONTAINER_RESTART_POLICY_TYPE_VALUES,
  CONTAINER_VOLUME_TYPE_VALUES,
  VolumeType,
} from '@app/models/container'
import * as yup from 'yup'

export const uniqueKeySchema = yup
  .array(
    yup.object().shape({
      key: yup.string().required().ensure().matches(/^\S+$/g), // all characters are non-whitespaces
    }),
  )
  .ensure()
  .test('keysAreUnique', 'Keys must be unique', arr =>
    arr ? new Set(arr.map(it => it.key)).size === arr.length : true,
  )

export const uniqueKeyValuesSchema = yup
  .array(
    yup.object().shape({
      key: yup.string().required().ensure().matches(/^\S+$/g), // all characters are non-whitespaces
      value: yup.string().ensure(),
    }),
  )
  .ensure()
  .test('keysAreUnique', 'Keys must be unique', arr =>
    arr ? new Set(arr.map(it => it.key)).size === arr.length : true,
  )

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

export const uniqueKeysOnlySchema = yup
  .array(
    yup.object().shape({
      key: yup.string().required().ensure().matches(/^\S+$/g),
    }),
  )
  .ensure()
  .test('keysAreUnique', 'Keys must be unique', arr =>
    arr ? new Set(arr.map(it => it.key)).size === arr.length : true,
  )

const sensitiveKeywords = ['password', 'secret', 'token']
const sensitiveKeywordRegExp = new RegExp(`^((?!(${sensitiveKeywords.join('|')})).)*$`, 'i')

export const sensitiveKeyRule = yup.string().matches(sensitiveKeywordRegExp)

const portNumberBaseRule = yup.number().positive().lessThan(65536)
const portNumberOptionalRule = portNumberBaseRule.nullable()
const portNumberRule = portNumberBaseRule.nullable().required()

const routingRule = yup
  .object()
  .shape({
    domain: yup.string().nullable(),
    path: yup.string().nullable(),
    stripPath: yup.bool().nullable(),
    uploadLimit: yup.string().nullable(),
  })
  .default({})
  .nullable()

const exposeRule = yup
  .mixed<ContainerConfigExposeStrategy>()
  .oneOf([...CONTAINER_EXPOSE_STRATEGY_VALUES])
  .default('none')
  .required()

const restartPolicyRule = yup
  .mixed<ContainerRestartPolicyType>()
  .oneOf([...CONTAINER_RESTART_POLICY_TYPE_VALUES])
  .default('no')
  .required()

const networkModeRule = yup
  .mixed<ContainerNetworkMode>()
  .oneOf([...CONTAINER_NETWORK_MODE_VALUES])
  .default('bridge')
  .required()

const deploymentStrategyRule = yup
  .mixed<ContainerDeploymentStrategyType>()
  .oneOf([...CONTAINER_DEPLOYMENT_STRATEGY_VALUES])
  .default('recreate')
  .required()

const logDriverRule = yup
  .mixed<ContainerLogDriverType>()
  .oneOf([...CONTAINER_LOG_DRIVER_VALUES])
  .default('nodeDefault')
  .required()

const volumeTypeRule = yup
  .mixed<VolumeType>()
  .oneOf([...CONTAINER_VOLUME_TYPE_VALUES])
  .default('rwo')
  .required()

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
    requests: yup
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

const storageFieldRule = yup
  .string()
  .when('storageId', {
    is: (storageId: string) => !!storageId,
    then: schema => schema.required(),
    otherwise: schema => schema.nullable(),
  })
  .nullable()

const storageRule = yup
  .object()
  .shape({
    storageId: yup.string(),
    bucket: storageFieldRule,
    path: storageFieldRule,
  })
  .default({})
  .nullable()
  .optional()

const createOverlapTest = (
  schema: yup.NumberSchema<number, any, number>,
  portRanges: ContainerConfigPortRange[],
  field: Exclude<keyof ContainerConfigPortRange, 'id'>,
) =>
  // eslint-disable-next-line no-template-curly-in-string
  schema.test('port-range-overlap', '${path} overlaps port ranges', value =>
    value && portRanges.length > 0
      ? !portRanges.some(it => {
          const portRange = it[field]
          if (!portRange.from || !portRange.to) {
            return false
          }
          return value >= portRange.from && portRange.to && value <= portRange.to
        })
      : true,
  )

// note: here yup passes reference as array
const portConfigRule = yup.mixed().when('portRanges', ([portRanges]) => {
  if (!portRanges?.length) {
    return yup
      .array(
        yup.object().shape({
          internal: portNumberRule,
          external: portNumberOptionalRule,
        }),
      )
      .default([])
      .nullable()
      .optional()
  }

  return yup
    .array(
      yup.object().shape({
        internal: createOverlapTest(portNumberRule, portRanges, 'internal'),
        external: createOverlapTest(portNumberOptionalRule, portRanges, 'external'),
      }),
    )
    .default([])
    .nullable()
    .optional()
})

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
      size: yup
        .string()
        .nullable()
        .matches(/^([+-]?[0-9.]+)([eEinumkKMGTP]*[-+]?[0-9]*)$/),
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
      name: yup.string().required().matches(/^\S+$/g),
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

const metricsRule = yup
  .object()
  .shape({
    path: yup.string().nullable(),
    port: portNumberRule.optional().nullable(),
  })
  .default({})
  .nullable()
  .optional()

const containerConfigBaseSchema = yup.object().shape({
  name: yup.string().required().matches(/^\S+$/g),
  environments: uniqueKeyValuesSchema.default([]).nullable(),
  routing: routingRule,
  expose: exposeRule,
  user: yup.number().default(null).min(-1).max(UID_MAX).nullable(),
  tty: yup.boolean().default(false).required(),
  configContainer: configContainerRule,
  ports: portConfigRule,
  portRanges: portRangeConfigRule,
  volumes: volumeConfigRule,
  commands: shellCommandSchema.default([]).nullable(),
  args: shellCommandSchema.default([]).nullable(),
  initContainers: initContainerRule,
  capabilities: uniqueKeyValuesSchema.default([]).nullable(),
  storage: storageRule,

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
  labels: markerRule,
  annotations: markerRule,
  metrics: metricsRule,
})

export const containerConfigSchema = containerConfigBaseSchema.shape({
  secrets: uniqueKeySchema.default([]).nullable(),
})

export const mergedContainerConfigSchema = containerConfigBaseSchema.shape({
  secrets: uniqueKeyValuesSchema.default([]).nullable(),
})
