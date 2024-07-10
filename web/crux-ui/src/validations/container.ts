import { UID_MAX } from '@app/const'
import {
  CONTAINER_DEPLOYMENT_STRATEGY_VALUES,
  CONTAINER_EXPOSE_STRATEGY_VALUES,
  CONTAINER_LOG_DRIVER_VALUES,
  CONTAINER_NETWORK_MODE_VALUES,
  CONTAINER_RESTART_POLICY_TYPE_VALUES,
  CONTAINER_STATE_VALUES,
  CONTAINER_VOLUME_TYPE_VALUES,
  ContainerConfigExposeStrategy,
  ContainerConfigPortRange,
  ContainerDeploymentStrategyType,
  ContainerLogDriverType,
  ContainerNetworkMode,
  ContainerPort,
  ContainerRestartPolicyType,
  EnvironmentRule,
  Metrics,
  UniqueKeyValue,
  VolumeType,
} from '@app/models'
import * as yup from 'yup'
import { matchNoLeadingOrTrailingWhitespaces, matchNoWhitespace } from './common'
import { parseDyrectorioEnvRules } from './labels'

const ERROR_NO_SENSITIVE = 'container:validation.noSensitive'
const ERROR_INVALID_KUBERNETES_QUANTITY = 'container:validation.kubernetesQuantity'

const unsafeKeywords = ['password', 'secret', 'token']
const unsafeKeywordsRegex = new RegExp(`^((?!(${unsafeKeywords.join('|')})).)*$`, 'i')

export const unsafeKeyRule = yup.string().matches(unsafeKeywordsRegex, ERROR_NO_SENSITIVE)

export const uniqueKeySchema = yup
  .array(
    yup.object().shape({
      key: matchNoWhitespace(yup.string().required().ensure().label('container:common.key')),
    }),
  )
  .ensure()
  .test('keysAreUnique', 'Keys must be unique', arr =>
    arr ? new Set(arr.map(it => it.key)).size === arr.length : true,
  )

export const uniqueKeyValuesSchema = yup
  .array(
    yup.object().shape({
      key: matchNoWhitespace(yup.string().required().ensure().label('container:common.key')),
      value: yup.string().ensure().label('container:common.value'),
    }),
  )
  .ensure()
  .test('keysAreUnique', 'Keys must be unique', arr =>
    arr ? new Set(arr.map(it => it.key)).size === arr.length : true,
  )

export const unsafeUniqueKeyValuesSchema = yup
  .array(
    yup.object().shape({
      key: matchNoWhitespace(unsafeKeyRule.required().ensure().label('container:common.key')),
      value: yup.string().ensure().label('container:common.value'),
    }),
  )
  .ensure()
  .test('keysAreUnique', 'Keys must be unique', arr =>
    arr ? new Set(arr.map(it => it.key)).size === arr.length : true,
  )

export const shellCommandSchema = yup
  .array(
    yup.object().shape({
      key: matchNoLeadingOrTrailingWhitespaces(yup.string().required().ensure().label('container:common.key')),
      value: yup.string().ensure().label('container:common.value'),
    }),
  )
  .ensure()
  .label('container:common.commands')

export const uniqueKeysOnlySchema = yup
  .array(
    yup.object().shape({
      key: matchNoWhitespace(yup.string().required().ensure().label('container:common.key')),
    }),
  )
  .ensure()
  .test('keysAreUnique', 'Keys must be unique', arr =>
    arr ? new Set(arr.map(it => it.key)).size === arr.length : true,
  )

const portNumberBaseRule = yup.number().positive().lessThan(65536)
const portNumberOptionalRule = portNumberBaseRule.nullable()
const portNumberRule = portNumberBaseRule.nullable().required()

const exposeRule = yup
  .mixed<ContainerConfigExposeStrategy>()
  .oneOf([...CONTAINER_EXPOSE_STRATEGY_VALUES])
  .default('none')
  .required()
  .label('container:common.expose')

const restartPolicyRule = yup
  .mixed<ContainerRestartPolicyType>()
  .oneOf([...CONTAINER_RESTART_POLICY_TYPE_VALUES])
  .default('no')
  .required()
  .label('container:dagent.restartPolicy')

const networkModeRule = yup
  .mixed<ContainerNetworkMode>()
  .oneOf([...CONTAINER_NETWORK_MODE_VALUES])
  .default('bridge')
  .required()
  .label('container:dagent.networkMode')

const deploymentStrategyRule = yup
  .mixed<ContainerDeploymentStrategyType>()
  .oneOf([...CONTAINER_DEPLOYMENT_STRATEGY_VALUES])
  .default('recreate')
  .required()
  .label('container:crane.deploymentStrategy')

const logDriverRule = yup
  .mixed<ContainerLogDriverType>()
  .oneOf([...CONTAINER_LOG_DRIVER_VALUES])
  .default('nodeDefault')
  .required()
  .label('container:dagent.logDrivers')

const volumeTypeRule = yup
  .mixed<VolumeType>()
  .oneOf([...CONTAINER_VOLUME_TYPE_VALUES])
  .default('rwo')
  .required()
  .label('container:common.type')

const configContainerRule = yup
  .object()
  .shape({
    image: yup.string().required().label('container:common.image'),
    volume: yup.string().required().label('container:common.volumes'),
    path: yup.string().required().label('container:common.path'),
    keepFiles: yup.boolean().default(false).required().label('container:common.keepFiles'),
  })
  .default({})
  .nullable()
  .optional()
  .label('container:common.configContainer')

const healthCheckConfigRule = yup
  .object()
  .shape({
    port: portNumberRule.nullable().optional().label('container:crane.port'),
    livenessProbe: yup.string().nullable().optional().label('container:crane.livenessProbe'),
    readinessProbe: yup.string().nullable().optional().label('container:crane.readinessProbe'),
    startupProbe: yup.string().nullable().optional().label('container:crane.startupProbe'),
  })
  .default({})
  .optional()
  .nullable()
  .label('container:crane.healthCheckConfig')

const resourceConfigRule = yup
  .object()
  .shape({
    limits: yup
      .object()
      .shape({
        cpu: yup.string().nullable().label('container:crane.cpu'),
        memory: yup.string().nullable().label('container:crane.memory'),
      })
      .nullable()
      .optional(),
    requests: yup
      .object()
      .shape({
        cpu: yup.string().nullable().label('container:crane.cpu'),
        memory: yup.string().nullable().label('container:crane.memory'),
      })
      .nullable()
      .optional(),
    livenessProbe: yup.string().nullable().label('container:crane.livenessProbe'),
  })
  .default({})
  .nullable()
  .optional()
  .label('container:crane.resourceConfig')

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
    storageId: yup.string().label('container:common.storage'),
    bucket: storageFieldRule.label('container:common.bucketPath'),
    path: storageFieldRule.label('container:common.volume'),
  })
  .default({})
  .nullable()
  .optional()
  .label('container:common.storage')

const createOverlapTest = (
  schema: yup.NumberSchema<number, any, number>,
  portRanges: ContainerConfigPortRange[],
  field: Exclude<keyof ContainerConfigPortRange, 'id'>,
) =>
  // eslint-disable-next-line no-template-curly-in-string
  schema.test('port-range-overlap', 'container:validation.pathOverlapsSomePortranges', value =>
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
          internal: portNumberRule.label('container:common.internal'),
          external: portNumberOptionalRule.label('container:common.external'),
        }),
      )
      .default([])
      .nullable()
      .optional()
      .label('container:common.ports')
  }

  return yup
    .array(
      yup.object().shape({
        internal: createOverlapTest(portNumberRule, portRanges, 'internal').label('container:common.internal'),
        external: createOverlapTest(portNumberOptionalRule, portRanges, 'external').label('container:common.external'),
      }),
    )
    .default([])
    .nullable()
    .optional()
    .label('container:common.ports')
})

const portRangeConfigRule = yup
  .array(
    yup.object().shape({
      internal: yup
        .object()
        .shape({
          from: portNumberRule.label('container:common.from'),
          to: portNumberRule.label('container:common.to'),
        })
        .default({})
        .required(),
      external: yup
        .object()
        .shape({
          from: portNumberRule.label('container:common.from'),
          to: portNumberRule.label('container:common.to'),
        })
        .default({})
        .required(),
    }),
  )
  .default([])
  .nullable()
  .optional()
  .label('container:common.portRanges')

const volumeConfigRule = yup
  .array(
    yup.object().shape({
      name: yup.string().required().label('container:common.name'),
      path: yup.string().required().label('container:common.path'),
      size: yup
        .string()
        .nullable()
        .matches(/^([+-]?[0-9.]+)([eEinumkKMGTP]*[-+]?[0-9]*)$/, ERROR_INVALID_KUBERNETES_QUANTITY)
        .label('container:common.size'),
      class: yup.string().nullable().label('container:common.class'),
      type: volumeTypeRule,
    }),
  )
  .default([])
  .nullable()
  .optional()
  .label('container:common.volumes')

const initContainerVolumeLinkRule = yup.array(
  yup.object().shape({
    name: yup.string().required().label('container:common.name'),
    path: yup.string().required().label('container:common.path'),
  }),
)

const initContainerRule = yup
  .array(
    yup.object().shape({
      name: matchNoWhitespace(yup.string().required().label('container:common.name')),
      image: yup.string().required().label('container:common.image'),
      command: shellCommandSchema.default([]).nullable().label('container:common.images'),
      args: shellCommandSchema.default([]).nullable().label('container:common.arguments'),
      environment: uniqueKeyValuesSchema.default([]).nullable().label('container:common.environment'),
      useParentConfig: yup.boolean().default(false).required().label('container:common.useParent'),
      volumes: initContainerVolumeLinkRule.default([]).nullable().label('container:common.volumes'),
    }),
  )
  .default([])
  .nullable()
  .optional()
  .label('container:common.initContainer')

const logConfigRule = yup
  .object()
  .shape({
    driver: logDriverRule,
    options: uniqueKeyValuesSchema.default([]).nullable().label('container:dagent.options'),
  })
  .default({})
  .nullable()
  .optional()
  .label('container:dagent.logConfig')

const markerRule = yup
  .object()
  .shape({
    deployment: uniqueKeyValuesSchema.default([]).nullable().label('container:crane.deployment'),
    service: uniqueKeyValuesSchema.default([]).nullable().label('container:crane.service'),
    ingress: uniqueKeyValuesSchema.default([]).nullable().label('container:crane.ingress'),
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
        domain: yup.string().nullable().label('container:common.domain'),
        path: yup
          .string()
          .nullable()
          .optional()
          .test('path', 'container:validation.shouldStartWithSlash', (it: string) => (it ? it.startsWith('/') : true))
          .label('container:common.path'),
        stripPath: yup.bool().nullable().label('container:common.stripPath'),
        uploadLimit: yup.string().nullable().label('container:common.uploadLimit'),
        port: portNumberRule.nullable().optional().notRequired().label('container:common.port'),
      })
      .nullable()
      .optional()
      .default(null),
  )
  .label('container:common.routing')

const createMetricsPortRule = (ports: ContainerPort[]) => {
  if (!ports?.length) {
    return portNumberRule.nullable().optional().label('container:crane.metricsPort')
  }

  return (
    portNumberRule
      // eslint-disable-next-line no-template-curly-in-string
      .test('metric-port', 'container:validation.missingExternalPort', value =>
        value && ports.length > 0 ? ports.some(it => it.external === value) : true,
      )
      .label('container:crane.metricsPort')
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
          path: yup.string().nullable().label('container:crane.metricsPath'),
          port: portRule,
        }),
    })
    .nullable()
    .optional()
    .default(null)
    .label('container:crane.metrics')
})

const expectedContainerStateRule = yup
  .object()
  .shape({
    state: yup.string().default(null).nullable().oneOf(CONTAINER_STATE_VALUES).label('container:dagent.expectedState'),
    timeout: yup.number().default(null).nullable().min(0).label('container:dagent.expectedStateTimeout'),
    exitCode: yup.number().default(0).nullable().min(-127).max(128).label('container:dagent.expectedExitCode'),
  })
  .default({})
  .nullable()
  .optional()
  .label('container:dagent.expectedState')

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

const testEnvironment = (imageLabels: Record<string, string>) => (arr: UniqueKeyValue[]) => {
  if (!imageLabels) {
    return true
  }

  const rules = parseDyrectorioEnvRules(imageLabels)

  const requiredKeys = Object.entries(rules)
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
      const rule = rules[key]
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

  return true
}

const createContainerConfigBaseSchema = (imageLabels: Record<string, string>) =>
  yup.object().shape({
    name: matchNoWhitespace(yup.string().required().label('container:common.containerName')),
    environment: uniqueKeyValuesSchema
      .default([])
      .nullable()
      .label('container:common.environment')
      .test('ruleValidation', 'errors:yup.mixed.required', testEnvironment(imageLabels)),
    routing: routingRule,
    expose: exposeRule,
    user: yup.number().default(null).min(-1).max(UID_MAX).nullable().label('container:common.user'),
    workingDirectory: yup.string().default(null).nullable().optional().label('container:common.workingDirectory'),
    tty: yup.boolean().default(false).required().label('container:common.tty'),
    configContainer: configContainerRule,
    ports: portConfigRule,
    portRanges: portRangeConfigRule,
    volumes: volumeConfigRule,
    commands: shellCommandSchema.default([]).nullable(),
    args: shellCommandSchema.default([]).nullable(),
    initContainers: initContainerRule,
    capabilities: uniqueKeyValuesSchema.default([]).nullable().label('container:common.capabilities'),
    storage: storageRule,

    // dagent:
    logConfig: logConfigRule,
    restartPolicy: restartPolicyRule,
    networkMode: networkModeRule,
    networks: uniqueKeysOnlySchema.default([]).nullable().label('container:dagent.networks'),
    dockerLabels: uniqueKeyValuesSchema.default([]).nullable().label('container:dagent.dockerLabels'),
    expectedState: expectedContainerStateRule,

    // crane
    deploymentStrategy: deploymentStrategyRule,
    customHeaders: uniqueKeysOnlySchema.default([]).nullable().label('container:crane.customHeaders'),
    proxyHeaders: yup.boolean().default(false).required().label('container:crane.proxyHeaders'),
    useLoadBalancer: yup.boolean().default(false).required().label('container:crane.useLoadBalancer'),
    extraLBAnnotations: uniqueKeyValuesSchema.default([]).nullable().label('container:crane.extraLBAnnotations'),
    healthCheckConfig: healthCheckConfigRule,
    resourceConfig: resourceConfigRule,
    labels: markerRule.label('container:crane.labels'),
    annotations: markerRule.label('container:crane.annotations'),
    metrics: metricsRule,
  })

export const createContainerConfigSchema = (imageLabels: Record<string, string>) =>
  createContainerConfigBaseSchema(imageLabels).shape({
    secrets: uniqueKeySchema.default([]).nullable().label('container:common.secrets'),
  })

export const createMergedContainerConfigSchema = (imageLabels: Record<string, string>) =>
  createContainerConfigBaseSchema(imageLabels).shape({
    secrets: uniqueKeyValuesSchema.default([]).nullable().label('container:common.secrets'),
  })
