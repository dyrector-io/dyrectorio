import { UID_MAX } from '@app/const'
import {
  CONTAINER_DEPLOYMENT_STRATEGY_VALUES,
  CONTAINER_EXPOSE_STRATEGY_VALUES,
  CONTAINER_LOG_DRIVER_VALUES,
  CONTAINER_NETWORK_MODE_VALUES,
  CONTAINER_RESTART_POLICY_TYPE_VALUES,
  CONTAINER_VOLUME_TYPE_VALUES,
  ContainerConfigExposeStrategy,
  ContainerConfigPortRange,
  ContainerDeploymentStrategyType,
  ContainerLogDriverType,
  ContainerNetworkMode,
  ContainerPort,
  ContainerRestartPolicyType,
  Metrics,
  VolumeType,
} from '@app/models'
import * as yup from 'yup'

export const uniqueKeySchema = yup
  .array(
    yup.object().shape({
      key: yup
        .string()
        .required()
        .ensure()
        .matches(/^\S+$/g)
        .label('common.key')
        .meta({ regex: 'errors:notContainWhitespaces' }), // all characters are non-whitespaces
    }),
  )
  .ensure()
  .test('keysAreUnique', 'Keys must be unique', arr =>
    arr ? new Set(arr.map(it => it.key)).size === arr.length : true,
  )

export const uniqueKeyValuesSchema = yup
  .array(
    yup.object().shape({
      key: yup
        .string()
        .required()
        .ensure()
        .matches(/^\S+$/g)
        .label('common.key')
        .meta({ regex: 'errors:notContainWhitespaces' }), // all characters are non-whitespaces
      value: yup.string().ensure().label('common.value'),
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
        .matches(/^\S.*\S$/g) // any characters but no trailing whitespaces
        .label('common.key')
        .meta({ regex: 'errors:notContainWhitespaces' }),
      value: yup.string().ensure().label('common.value'),
    }),
  )
  .ensure()
  .label('common.commands')

export const uniqueKeysOnlySchema = yup
  .array(
    yup.object().shape({
      key: yup
        .string()
        .required()
        .ensure()
        .matches(/^\S+$/g)
        .label('common.key')
        .meta({ regex: 'errors:notContainWhitespaces' }),
    }),
  )
  .ensure()
  .test('keysAreUnique', 'Keys must be unique', arr =>
    arr ? new Set(arr.map(it => it.key)).size === arr.length : true,
  )

const sensitiveKeywords = ['password', 'secret', 'token']
const sensitiveKeywordRegExp = new RegExp(`^((?!(${sensitiveKeywords.join('|')})).)*$`, 'i')

export const sensitiveKeyRule = yup.string().matches(sensitiveKeywordRegExp).meta({ regex: 'validation.noSensitive' })

const portNumberBaseRule = yup.number().positive().lessThan(65536)
const portNumberOptionalRule = portNumberBaseRule.nullable()
const portNumberRule = portNumberBaseRule.nullable().required()

const exposeRule = yup
  .mixed<ContainerConfigExposeStrategy>()
  .oneOf([...CONTAINER_EXPOSE_STRATEGY_VALUES])
  .default('none')
  .required()
  .label('common.expose')

const restartPolicyRule = yup
  .mixed<ContainerRestartPolicyType>()
  .oneOf([...CONTAINER_RESTART_POLICY_TYPE_VALUES])
  .default('no')
  .required()
  .label('dagent.restartPolicy')

const networkModeRule = yup
  .mixed<ContainerNetworkMode>()
  .oneOf([...CONTAINER_NETWORK_MODE_VALUES])
  .default('bridge')
  .required()
  .label('dagent.networkMode')

const deploymentStrategyRule = yup
  .mixed<ContainerDeploymentStrategyType>()
  .oneOf([...CONTAINER_DEPLOYMENT_STRATEGY_VALUES])
  .default('recreate')
  .required()
  .label('crane.deploymentStrategy')

const logDriverRule = yup
  .mixed<ContainerLogDriverType>()
  .oneOf([...CONTAINER_LOG_DRIVER_VALUES])
  .default('nodeDefault')
  .required()
  .label('dagent.logDrivers')

const volumeTypeRule = yup
  .mixed<VolumeType>()
  .oneOf([...CONTAINER_VOLUME_TYPE_VALUES])
  .default('rwo')
  .required()
  .label('common.type')

const configContainerRule = yup
  .object()
  .shape({
    image: yup.string().required().label('common.image'),
    volume: yup.string().required().label('common.volumes'),
    path: yup.string().required().label('common.path'),
    keepFiles: yup.boolean().default(false).required().label('common.keepFiles'),
  })
  .default({})
  .nullable()
  .optional()
  .label('common.configContainer')

const healthCheckConfigRule = yup
  .object()
  .shape({
    port: portNumberRule.nullable().optional().label('crane.port'),
    livenessProbe: yup.string().nullable().optional().label('crane.livenessProbe'),
    readinessProbe: yup.string().nullable().optional().label('crane.readinessProbe'),
    startupProbe: yup.string().nullable().optional().label('crane.startupProbe'),
  })
  .default({})
  .optional()
  .nullable()
  .label('crane.healthCheckConfig')

const resourceConfigRule = yup
  .object()
  .shape({
    limits: yup
      .object()
      .shape({
        cpu: yup.string().nullable().label('crane.cpu'),
        memory: yup.string().nullable().label('crane.memory'),
      })
      .nullable()
      .optional(),
    requests: yup
      .object()
      .shape({
        cpu: yup.string().nullable().label('crane.cpu'),
        memory: yup.string().nullable().label('crane.memory'),
      })
      .nullable()
      .optional(),
    livenessProbe: yup.string().nullable().label('crane.livenessProbe'),
  })
  .default({})
  .nullable()
  .optional()
  .label('crane.resourceConfig')

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
    storageId: yup.string().label('common.storage'),
    bucket: storageFieldRule.label('common.bucketPath'),
    path: storageFieldRule.label('common.volume'),
  })
  .default({})
  .nullable()
  .optional()
  .label('common.storage')

const createOverlapTest = (
  schema: yup.NumberSchema<number, any, number>,
  portRanges: ContainerConfigPortRange[],
  field: Exclude<keyof ContainerConfigPortRange, 'id'>,
) =>
  // eslint-disable-next-line no-template-curly-in-string
  schema.test('port-range-overlap', '{path} overlaps some port ranges', value =>
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
          internal: portNumberRule.label('common.internal'),
          external: portNumberOptionalRule.label('common.external'),
        }),
      )
      .default([])
      .nullable()
      .optional()
      .label('common.ports')
  }

  return yup
    .array(
      yup.object().shape({
        internal: createOverlapTest(portNumberRule, portRanges, 'internal').label('common.internal'),
        external: createOverlapTest(portNumberOptionalRule, portRanges, 'external').label('common.external'),
      }),
    )
    .default([])
    .nullable()
    .optional()
    .label('common.ports')
})

const portRangeConfigRule = yup
  .array(
    yup.object().shape({
      internal: yup
        .object()
        .shape({
          from: portNumberRule.label('common.from'),
          to: portNumberRule.label('common.to'),
        })
        .default({})
        .required(),
      external: yup
        .object()
        .shape({
          from: portNumberRule.label('common.from'),
          to: portNumberRule.label('common.to'),
        })
        .default({})
        .required(),
    }),
  )
  .default([])
  .nullable()
  .optional()
  .label('common.portRanges')

const volumeConfigRule = yup
  .array(
    yup.object().shape({
      name: yup.string().required().label('common.name'),
      path: yup.string().required().label('common.path'),
      size: yup
        .string()
        .nullable()
        .matches(/^([+-]?[0-9.]+)([eEinumkKMGTP]*[-+]?[0-9]*)$/)
        .label('common.size')
        .meta({ regex: 'validation.kubernetesQuantity' }),
      class: yup.string().nullable().label('common.class'),
      type: volumeTypeRule,
    }),
  )
  .default([])
  .nullable()
  .optional()
  .label('common.volumes')

const initContainerVolumeLinkRule = yup.array(
  yup.object().shape({
    name: yup.string().required().label('common.name'),
    path: yup.string().required().label('common.path'),
  }),
)

const initContainerRule = yup
  .array(
    yup.object().shape({
      name: yup
        .string()
        .required()
        .matches(/^\S+$/g)
        .label('common.name')
        .meta({ regex: 'errors:notContainWhitespaces' }),
      image: yup.string().required().label('common.image'),
      command: uniqueKeysOnlySchema.default([]).nullable().label('common.images'),
      args: uniqueKeysOnlySchema.default([]).nullable().label('common.arguments'),
      environment: uniqueKeyValuesSchema.default([]).nullable().label('common.environment'),
      useParentConfig: yup.boolean().default(false).required().label('common.useParent'),
      volumes: initContainerVolumeLinkRule.default([]).nullable().label('common.volumes'),
    }),
  )
  .default([])
  .nullable()
  .optional()
  .label('common.initContainer')

const logConfigRule = yup
  .object()
  .shape({
    driver: logDriverRule,
    options: uniqueKeyValuesSchema.default([]).nullable().label('dagent.options'),
  })
  .default({})
  .nullable()
  .optional()
  .label('dagent.logConfig')

const markerRule = yup
  .object()
  .shape({
    deployment: uniqueKeyValuesSchema.default([]).nullable().label('crane.deployment'),
    service: uniqueKeyValuesSchema.default([]).nullable().label('crane.service'),
    ingress: uniqueKeyValuesSchema.default([]).nullable().label('crane.ingress'),
  })
  .default({})
  .nullable()
  .optional()

const routingRule = yup
  .mixed()
  .when('ports', () =>
    yup
      .object()
      .shape({
        domain: yup.string().nullable().label('common.domain'),
        path: yup
          .string()
          .nullable()
          .optional()
          .test('path', 'Should start with a leading "/"', (it: string) => (it ? it.startsWith('/') : true))
          .label('common.path'),
        stripPath: yup.bool().nullable().label('common.stripPath'),
        uploadLimit: yup.string().nullable().label('common.uploadLimit'),
        port: portNumberRule.nullable().optional().notRequired().label('common.port'),
      })
      .nullable()
      .optional()
      .default(null),
  )
  .label('common.routing')

const createMetricsPortRule = (ports: ContainerPort[]) => {
  if (!ports?.length) {
    return portNumberRule.nullable().optional().label('crane.metricsPort')
  }

  return (
    portNumberRule
      // eslint-disable-next-line no-template-curly-in-string
      .test('metric-port', '${path} is missing the external port definition', value =>
        value && ports.length > 0 ? ports.some(it => it.external === value) : true,
      )
      .label('crane.metricsPort')
  )
}

const metricsRule = yup.mixed().when(['ports'], ([ports]) => {
  const portRule = createMetricsPortRule(ports)

  return yup
    .object()
    .when({
      is: (it: Metrics) => it?.enabled,
      then: schema =>
        schema.shape({
          enabled: yup.boolean(),
          path: yup.string().nullable().label('crane.metricsPath'),
          port: portRule,
        }),
    })
    .nullable()
    .optional()
    .default(null)
    .label('crane.metrics')
})

const containerConfigBaseSchema = yup.object().shape({
  name: yup
    .string()
    .required()
    .matches(/^\S+$/g)
    .label('common.containerName')
    .meta({ regex: 'errors:notContainWhitespaces' }),
  environment: uniqueKeyValuesSchema.default([]).nullable().label('common.environment'),
  routing: routingRule,
  expose: exposeRule,
  user: yup.number().default(null).min(-1).max(UID_MAX).nullable().label('common.user'),
  tty: yup.boolean().default(false).required().label('common.tty'),
  configContainer: configContainerRule,
  ports: portConfigRule,
  portRanges: portRangeConfigRule,
  volumes: volumeConfigRule,
  commands: shellCommandSchema.default([]).nullable(),
  args: shellCommandSchema.default([]).nullable(),
  initContainers: initContainerRule,
  capabilities: uniqueKeyValuesSchema.default([]).nullable().label('common.capabilities'),
  storage: storageRule,

  // dagent:
  logConfig: logConfigRule,
  restartPolicy: restartPolicyRule,
  networkMode: networkModeRule,
  networks: uniqueKeysOnlySchema.default([]).nullable().label('dagent.networks'),
  dockerLabels: uniqueKeyValuesSchema.default([]).nullable().label('dagent.dockerLabels'),

  // crane
  deploymentStrategy: deploymentStrategyRule,
  customHeaders: uniqueKeysOnlySchema.default([]).nullable().label('crane.customHeaders'),
  proxyHeaders: yup.boolean().default(false).required().label('crane.proxyHeaders'),
  useLoadBalancer: yup.boolean().default(false).required().label('crane.useLoadBalancer'),
  extraLBAnnotations: uniqueKeyValuesSchema.default([]).nullable().label('crane.extraLBAnnotations'),
  healthCheckConfig: healthCheckConfigRule,
  resourceConfig: resourceConfigRule,
  labels: markerRule.label('crane.labels'),
  annotations: markerRule.label('crane.annotations'),
  metrics: metricsRule,
})

export const containerConfigSchema = containerConfigBaseSchema.shape({
  secrets: uniqueKeySchema.default([]).nullable().label('common.secrets'),
})

export const mergedContainerConfigSchema = containerConfigBaseSchema.shape({
  secrets: uniqueKeyValuesSchema.default([]).nullable().label('common.secrets'),
})
