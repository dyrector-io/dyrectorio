import {
  ContainerConfigExposeStrategy,
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

const portNumberRule = yup.number().positive().lessThan(65536).required()

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
  .mixed<ContainerConfigExposeStrategy>()
  .oneOf([...CONTAINER_EXPOSE_STRATEGY_VALUES])
  .default('none')
  .required()

const restartPolicyRule = yup
  .mixed<ContainerRestartPolicyType>()
  .oneOf([...CONTAINER_RESTART_POLICY_TYPE_VALUES])
  .default('undefined')
  .required()

const networkModeRule = yup
  .mixed<ContainerNetworkMode>()
  .oneOf([...CONTAINER_NETWORK_MODE_VALUES])
  .default('none')
  .required()

const deploymentStrategyRule = yup
  .mixed<ContainerDeploymentStrategyType>()
  .oneOf([...CONTAINER_DEPLOYMENT_STRATEGY_VALUES])
  .default('unknown')
  .required()

const logDriverRule = yup
  .mixed<ContainerLogDriverType>()
  .oneOf([...CONTAINER_LOG_DRIVER_VALUES])
  .default('none')
  .required()

const volumeTypeRule = yup
  .mixed<VolumeType>()
  .oneOf([...CONTAINER_VOLUME_TYPE_VALUES])
  .default('ro')
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

const baseImportContainerRule = yup.object().shape({
  volume: yup.string().required(),
  command: yup.string(),
})

const importContainerRule = baseImportContainerRule
  .shape({
    environments: uniqueKeyValuesSchema.default([]).nullable(),
  })
  .default({})
  .nullable()
  .optional()

const portConfigRule = yup
  .array(
    yup.object().shape({
      internal: portNumberRule,
      external: portNumberRule,
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

export const containerConfigSchema = yup.object().shape({
  name: yup.string().required(),
  environments: uniqueKeyValuesSchema.default([]).nullable(),
  secrets: uniqueKeyValuesSchema.default([]).nullable(),
  ingress: ingressRule,
  expose: exposeRule,
  user: yup.number().default(null).nullable(),
  tty: yup.boolean().default(false).required(),
  importContainer: importContainerRule,
  configContainer: configContainerRule,
  ports: portConfigRule,
  portRanges: portRangeConfigRule,
  volumes: volumeConfigRule,
  commands: uniqueKeysOnlySchema.default([]).nullable(),
  args: uniqueKeysOnlySchema.default([]).nullable(),
  initContainers: initContainerRule,
  capabilities: uniqueKeyValuesSchema.default([]).nullable(),

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
})
