import { UID_MAX, UID_MIN } from '@app/const'
import {
  CONTAINER_DEPLOYMENT_STRATEGY_VALUES,
  CONTAINER_EXPOSE_STRATEGY_VALUES,
  CONTAINER_LOG_DRIVER_VALUES,
  CONTAINER_NETWORK_MODE_VALUES,
  CONTAINER_RESTART_POLICY_TYPE_VALUES,
  CONTAINER_STATE_VALUES,
  CONTAINER_VOLUME_TYPE_VALUES,
  ContainerConfigExposeStrategy,
  ContainerPortRange,
  ContainerDeploymentStrategyType,
  ContainerLogDriverType,
  ContainerNetworkMode,
  ContainerPort,
  ContainerRestartPolicyType,
  EnvironmentRule,
  Metrics,
  UniqueKeyValue,
  VolumeType,
  UniqueSecretKeyValue,
} from '@app/models'
import * as yup from 'yup'
import { matchNoLeadingOrTrailingWhitespaces, matchNoWhitespace } from './common'
import { parseDyrectorioEnvRules } from './labels'

// Official regex from Docker daemon
export const CONTAINER_NAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_.-]+$/g

const ERROR_NO_SENSITIVE = 'container:validation.noSensitive'
const ERROR_INVALID_KUBERNETES_QUANTITY = 'container:validation.kubernetesQuantity'

const unsafeKeywords = ['password', 'secret', 'token']
const unsafeKeywordsRegex = new RegExp(`^((?!(${unsafeKeywords.join('|')})).)*$`, 'i')

export const unsafeKeyRule = yup.string().matches(unsafeKeywordsRegex, ERROR_NO_SENSITIVE)

const REGEX_ERROR_INVALID_CONTAINER_NAME = { regex: 'errors:yup.string.containerName' }

export const matchContainerName = (schema: yup.StringSchema<string, yup.AnyObject, undefined>) =>
  schema.matches(CONTAINER_NAME_REGEX, { message: REGEX_ERROR_INVALID_CONTAINER_NAME }) // all characters are non-whitespaces

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
  .default(null)
  .nullable()
  .optional()
  .label('container:common.expose')

const restartPolicyRule = yup
  .mixed<ContainerRestartPolicyType>()
  .oneOf([...CONTAINER_RESTART_POLICY_TYPE_VALUES])
  .default(null)
  .nullable()
  .optional()
  .label('container:dagent.restartPolicy')

const networkModeRule = yup
  .mixed<ContainerNetworkMode>()
  .oneOf([...CONTAINER_NETWORK_MODE_VALUES])
  .default(null)
  .nullable()
  .optional()
  .label('container:dagent.networkMode')

const deploymentStrategyRule = yup
  .mixed<ContainerDeploymentStrategyType>()
  .oneOf([...CONTAINER_DEPLOYMENT_STRATEGY_VALUES])
  .default(null)
  .nullable()
  .optional()
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
  .default(null)
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
  .default(null)
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
  .default(null)
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
  .default(null)
  .nullable()
  .optional()
  .label('container:common.storage')

const createOverlapTest = (
  schema: yup.NumberSchema<number, any, number>,
  portRanges: ContainerPortRange[],
  field: Exclude<keyof ContainerPortRange, 'id'>,
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
    .default(null)
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
  .default(null)
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
  .default(null)
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
  .default(null)
  .nullable()
  .optional()
  .label('container:common.initContainer')

const logConfigRule = yup
  .object()
  .shape({
    driver: logDriverRule,
    options: uniqueKeyValuesSchema.default([]).nullable().label('container:dagent.options'),
  })
  .default(null)
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
  .default(null)
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
  .default(null)
  .nullable()
  .optional()
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
    .default(null)
    .nullable()
    .optional()
    .label('container:crane.metrics')
})

const expectedContainerStateRule = yup
  .object()
  .shape({
    state: yup.string().default(null).nullable().oneOf(CONTAINER_STATE_VALUES).label('container:dagent.expectedState'),
    timeout: yup.number().default(null).nullable().min(0).label('container:dagent.expectedStateTimeout'),
    exitCode: yup.number().default(0).nullable().min(-127).max(128).label('container:dagent.expectedExitCode'),
  })
  .default(null)
  .nullable()
  .optional()
  .label('container:dagent.expectedState')

type KeyValueLike = {
  key: string
  value: string
}

const validateLabelRule = (rule: EnvironmentRule, field: string, env: KeyValueLike) => {
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
        return new yup.ValidationError('errors:yup.mixed.default', rule.type, field)
    }
  } catch (fieldError) {
    const err = new yup.ValidationError(fieldError.message, key, field)
    err.params = {
      ...fieldError.params,
      path: key,
    }
    return err
  }

  return null
}

const testRules = (
  rules: [string, EnvironmentRule][],
  arr: (UniqueKeyValue | UniqueSecretKeyValue)[],
  fieldName: string,
) => {
  if (rules.length === 0) {
    return null
  }

  const requiredKeys = rules.map(([key]) => key)
  const foundKeys = arr.map(it => it.key)

  const missingKey = requiredKeys.find(it => !foundKeys.includes(it))
  if (missingKey) {
    const err = new yup.ValidationError('errors:yup.mixed.required', missingKey, fieldName)
    err.params = {
      path: missingKey,
    }
    return err
  }

  const ruleMap = new Map(rules)

  const envErrors = arr
    .map((it, index) => {
      const { key } = it
      const rule = ruleMap[key]
      if (!rule) {
        return null
      }

      return validateLabelRule(rule, `${fieldName}[${index}]`, it)
    })
    .filter(it => !!it)

  if (envErrors.length > 0) {
    const err = new yup.ValidationError(envErrors, null, fieldName)
    return err
  }

  return null
}

const testEnvironmentRules = (imageLabels: Record<string, string>) => (envs: UniqueKeyValue[]) => {
  const rules = parseDyrectorioEnvRules(imageLabels)
  if (!rules) {
    return null
  }

  const requiredRules = Object.entries(rules).filter(([, rule]) => rule.required)
  const envRules = requiredRules.filter(([_, rule]) => !rule.secret)

  return testRules(envRules, envs, 'environment')
}

const testSecretRules = (imageLabels: Record<string, string>) => (secrets: UniqueSecretKeyValue[]) => {
  const rules = parseDyrectorioEnvRules(imageLabels)
  if (!rules) {
    return null
  }

  const requiredRules = Object.entries(rules).filter(([, rule]) => rule.required)
  const secretRules = requiredRules.filter(([_, rule]) => rule.secret)

  return testRules(secretRules, secrets, 'secret')
}

const createContainerConfigBaseSchema = (imageLabels: Record<string, string>) =>
  yup.object().shape({
    name: matchContainerName(yup.string().nullable().optional().label('container:common.containerName')),
    environment: uniqueKeyValuesSchema
      .default(null)
      .nullable()
      .optional()
      .label('container:common.environment')
      .test(
        'labelRules',
        'Environment variables must match their image label rules.',
        testEnvironmentRules(imageLabels),
      ),
    routing: routingRule,
    expose: exposeRule,
    user: yup.number().default(null).min(UID_MIN).max(UID_MAX).nullable().optional().label('container:common.user'),
    workingDirectory: yup.string().default(null).nullable().optional().label('container:common.workingDirectory'),
    tty: yup.boolean().default(null).nullable().optional().label('container:common.tty'),
    configContainer: configContainerRule,
    ports: portConfigRule,
    portRanges: portRangeConfigRule,
    volumes: volumeConfigRule,
    commands: shellCommandSchema.default(null).nullable().optional(),
    args: shellCommandSchema.default(null).nullable().optional(),
    initContainers: initContainerRule,
    capabilities: uniqueKeyValuesSchema.default(null).nullable().optional().label('container:common.capabilities'),
    storage: storageRule,

    // dagent:
    logConfig: logConfigRule,
    restartPolicy: restartPolicyRule,
    networkMode: networkModeRule,
    networks: uniqueKeysOnlySchema.default(null).nullable().optional().label('container:dagent.networks'),
    dockerLabels: uniqueKeyValuesSchema.default(null).nullable().optional().label('container:dagent.dockerLabels'),
    expectedState: expectedContainerStateRule,

    // crane
    deploymentStrategy: deploymentStrategyRule,
    customHeaders: uniqueKeysOnlySchema.default(null).nullable().optional().label('container:crane.customHeaders'),
    proxyHeaders: yup.boolean().default(null).nullable().optional().label('container:crane.proxyHeaders'),
    useLoadBalancer: yup.boolean().default(null).nullable().optional().label('container:crane.useLoadBalancer'),
    extraLBAnnotations: uniqueKeyValuesSchema
      .default(null)
      .nullable()
      .optional()
      .label('container:crane.extraLBAnnotations'),
    healthCheckConfig: healthCheckConfigRule,
    resourceConfig: resourceConfigRule,
    labels: markerRule.label('container:crane.labels'),
    annotations: markerRule.label('container:crane.annotations'),
    metrics: metricsRule,
  })

export const createContainerConfigSchema = (imageLabels: Record<string, string>) =>
  createContainerConfigBaseSchema(imageLabels).shape({
    secrets: uniqueKeySchema.default(null).nullable().optional().label('container:common.secrets'),
  })

export const createConcreteContainerConfigSchema = (imageLabels: Record<string, string>) =>
  createContainerConfigBaseSchema(imageLabels).shape({
    secrets: uniqueKeyValuesSchema
      .default(null)
      .nullable()
      .optional()
      .label('container:common.secrets')
      .test('secretRules', 'Secrets must match their image label rules.', testSecretRules(imageLabels)),
  })
