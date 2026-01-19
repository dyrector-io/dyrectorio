import { ConcreteContainerConfigData } from './container'
import {
  DeployableConfigBundle,
  DeployableDeployment,
  DeployableImage,
  DeployableInstance,
  instanceConfigOf,
} from './start-deployment'

const emptyConfig: ConcreteContainerConfigData = {
  annotations: null,
  args: null,
  capabilities: [],
  commands: null,
  configContainer: null,
  corsHeaders: null,
  deploymentStrategy: null,
  dockerLabels: null,
  environment: null,
  expectedState: null,
  experimental: null,
  expose: null,
  extraLBAnnotations: null,
  healthCheckConfig: null,
  initContainers: null,
  labels: null,
  logConfig: null,
  metrics: null,
  name: null,
  networkMode: null,
  networks: null,
  portRanges: null,
  ports: null,
  proxyBuffering: null,
  proxyHeaders: null,
  resourceConfig: null,
  restartPolicy: null,
  routing: null,
  secrets: null,
  storageConfig: null,
  storageId: null,
  storageSet: false,
  tty: null,
  useLoadBalancer: null,
  user: null,
  volumes: null,
  workingDirectory: null,
}

const imageConfig: DeployableImage = {
  id: 'image',
  name: 'image-name',
  tag: 'latest',
  order: 1,
  labels: {},
  configId: 'image-config-id',
  config: {
    secrets: [
      {
        id: 'image-required',
        key: 'image-required',
        required: true,
      },
      {
        id: 'image-not-required',
        key: 'image-not-required',
        required: false,
      },
    ],
  },
  registryId: 'registry-id',
  registry: null,
  versionId: 'version-id',
  createdAt: new Date(),
  createdBy: 'user-id',
  updatedAt: new Date(),
  updatedBy: 'user-id',
}

const instanceConfig: DeployableInstance = {
  id: 'instance',
  configId: 'instance-config-id',
  config: {
    secrets: [
      {
        id: 'instance',
        key: 'instance',
        value: 'instance',
        encrypted: true,
        required: false,
        publicKey: null,
      },
      {
        id: 'instance-bundle-one-required',
        key: 'bundle-one-required',
        value: 'instance-bundle-one-required',
        required: true,
        encrypted: true,
        publicKey: null,
      },
    ],
  },
  image: imageConfig,
}

const bundleOneConfig: DeployableConfigBundle = {
  config: {
    id: 'bundle-one-config-id',
    secrets: [
      {
        id: 'bundle-one-required',
        key: 'bundle-one-required',
        required: true,
      },
    ],
  },
}

const bundleTwoConfig: DeployableConfigBundle = {
  config: {
    id: 'bundle-two-config-id',
    secrets: [
      {
        id: 'bundle-two-not-required',
        key: 'bundle-two-not-required',
        required: false,
      },
    ],
  },
}

const deploymentConfig: DeployableDeployment = {
  id: 'deployment',
  nodeId: 'node-id',
  prefix: 'prefix',
  status: 'preparing',
  tries: 0,
  protected: false,
  note: 'deployment-note',
  configId: 'deployment-config-id',
  config: {
    secrets: [
      {
        id: 'deployment-image-required',
        key: 'image-required',
        value: 'deployment-image-required',
        encrypted: true,
        required: false,
        publicKey: null,
      },
    ],
  },
  configBundles: [
    {
      configBundle: bundleOneConfig,
    },
    {
      configBundle: bundleTwoConfig,
    },
  ],
  versionId: 'version-id',
  version: {
    name: 'version-name',
    type: 'incremental',
  },
  updatedAt: new Date(),
  updatedBy: 'user-id',
  createdAt: new Date(),
  createdBy: 'user-id',
  deployedAt: null,
  deployedBy: null,
  instances: [instanceConfig],
}

describe('start-deployment', () => {
  describe('instanceConfigOf', () => {
    it('should mix with deployment secrets', () => {
      const merged = instanceConfigOf(deploymentConfig, instanceConfig)

      const expected: ConcreteContainerConfigData = {
        ...emptyConfig,
        name: 'image-name',
        secrets: [
          {
            id: 'instance',
            key: 'instance',
            value: 'instance',
            encrypted: true,
            required: false,
            publicKey: null,
          },
          {
            id: 'instance-bundle-one-required',
            key: 'bundle-one-required',
            value: 'instance-bundle-one-required',
            required: true,
            encrypted: true,
            publicKey: null,
          },
          {
            id: 'deployment-image-required',
            key: 'image-required',
            value: 'deployment-image-required',
            encrypted: true,
            required: false,
            publicKey: null,
          },
        ],
      }

      expect(merged).toEqual(expected)
    })
  })
})
