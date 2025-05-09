import { ConcreteContainerConfigData, ContainerConfigData } from './container'
import { mergeConfigsWithConcreteConfig, mergeInstanceConfigWithDeploymentConfig } from './container-merge'

describe('container-merge', () => {
  const fullConfig: ContainerConfigData = {
    name: 'img',
    capabilities: [],
    deploymentStrategy: 'recreate',
    workingDirectory: '/app',
    expose: 'expose',
    networkMode: 'bridge',
    proxyHeaders: false,
    restartPolicy: 'no',
    tty: false,
    useLoadBalancer: false,
    annotations: {
      deployment: [
        {
          id: 'annotations.deployment',
          key: 'annotations.deployment',
          value: 'annotations.deployment',
        },
      ],
      ingress: [
        {
          id: 'annotations.ingress',
          key: 'annotations.ingress',
          value: 'annotations.ingress',
        },
      ],
      service: [
        {
          id: 'annotations.service',
          key: 'annotations.service',
          value: 'annotations.service',
        },
      ],
    },
    labels: {
      deployment: [
        {
          id: 'labels.deployment',
          key: 'labels.deployment',
          value: 'labels.deployment',
        },
      ],
      ingress: [
        {
          id: 'labels.ingress',
          key: 'labels.ingress',
          value: 'labels.ingress',
        },
      ],
      service: [
        {
          id: 'labels.service',
          key: 'labels.service',
          value: 'labels.service',
        },
      ],
    },
    args: [
      {
        id: 'arg1',
        key: 'arg1',
      },
    ],
    commands: [
      {
        id: 'command1',
        key: 'command1',
      },
    ],
    configContainer: {
      image: 'configCont',
      keepFiles: false,
      path: 'configCont',
      volume: 'configCont',
    },
    customHeaders: [
      {
        id: 'customHead',
        key: 'customHead',
      },
    ],
    dockerLabels: [
      {
        id: 'dockerLabel1',
        key: 'dockerLabel1',
        value: 'dockerLabel1',
      },
    ],
    environment: [
      {
        id: 'env1',
        key: 'env1',
        value: 'env1',
      },
    ],
    extraLBAnnotations: [
      {
        id: 'lbAnn1',
        key: 'lbAnn1',
        value: 'lbAnn1',
      },
    ],
    healthCheckConfig: {
      livenessProbe: 'healthCheckConf',
      port: 1,
      readinessProbe: 'healthCheckConf',
      startupProbe: 'healthCheckConf',
    },
    storageSet: true,
    storageId: 'storageId',
    storageConfig: {
      bucket: 'storageBucket',
      path: 'storagePath',
    },
    routing: {
      domain: 'domain',
      path: 'path',
      stripPrefix: true,
      uploadLimit: 'uploadLimit',
    },
    initContainers: [
      {
        id: 'initCont1',
        args: [
          {
            id: 'initCont1Args',
            key: 'initCont1Args',
          },
        ],
        command: [
          {
            id: 'initCont1Command',
            key: 'initCont1Command',
          },
        ],
        environment: [
          {
            id: 'initCont1Env',
            key: 'initCont1Env',
            value: 'initCont1Env',
          },
        ],
        image: 'initCont1',
        name: 'initCont1',
        useParentConfig: false,
        volumes: [
          {
            id: 'initCont1Vol1',
            name: 'initCont1Vol1',
            path: 'initCont1Vol1',
          },
        ],
      },
    ],
    logConfig: {
      driver: 'awslogs',
      options: [
        {
          id: 'logConfOps',
          key: 'logConfOps',
          value: 'logConfOps',
        },
      ],
    },
    networks: [
      {
        id: 'network1',
        key: 'network1',
      },
    ],
    portRanges: [
      {
        id: 'portRange1',
        external: {
          from: 1,
          to: 2,
        },
        internal: {
          from: 1,
          to: 2,
        },
      },
    ],
    ports: [
      {
        id: 'port1',
        internal: 1,
        external: 1,
      },
    ],
    resourceConfig: {
      limits: {
        cpu: 'limitCpu',
        memory: 'limitMemory',
      },
      requests: {
        cpu: 'requestCpu',
        memory: 'requestMemory',
      },
    },
    secrets: [
      {
        id: 'secret1',
        key: 'secret1',
        required: false,
      },
      {
        id: 'secret2',
        key: 'secret2',
        required: true,
      },
    ],
    user: 1,
    volumes: [
      {
        id: 'vol1',
        name: 'vol1',
        path: 'vol1',
        class: 'vol1',
        size: 'vol1',
        type: 'mem',
      },
    ],
    metrics: undefined,
    expectedState: undefined,
  }

  const fullConcreteConfig: ConcreteContainerConfigData = {
    name: 'concrete.img',
    capabilities: [],
    deploymentStrategy: 'recreate',
    workingDirectory: '/app',
    expose: 'exposeWithTls',
    networkMode: 'host',
    proxyHeaders: true,
    restartPolicy: 'onFailure',
    tty: true,
    useLoadBalancer: true,
    annotations: {
      deployment: [
        {
          id: 'concrete.annotations.deployment',
          key: 'concrete.annotations.deployment',
          value: 'concrete.annotations.deployment',
        },
      ],
      ingress: [
        {
          id: 'concrete.annotations.ingress',
          key: 'concrete.annotations.ingress',
          value: 'concrete.annotations.ingress',
        },
      ],
      service: [
        {
          id: 'concrete.annotations.service',
          key: 'concrete.annotations.service',
          value: 'concrete.annotations.service',
        },
      ],
    },
    labels: {
      deployment: [
        {
          id: 'concrete.labels.deployment',
          key: 'concrete.labels.deployment',
          value: 'concrete.labels.deployment',
        },
      ],
      ingress: [
        {
          id: 'concrete.labels.ingress',
          key: 'concrete.labels.ingress',
          value: 'concrete.labels.ingress',
        },
      ],
      service: [
        {
          id: 'concrete.labels.service',
          key: 'concrete.labels.service',
          value: 'concrete.labels.service',
        },
      ],
    },
    args: [
      {
        id: 'concrete.arg1',
        key: 'concrete.arg1',
      },
    ],
    commands: [
      {
        id: 'concrete.command1',
        key: 'concrete.command1',
      },
    ],
    configContainer: {
      image: 'concrete.configCont',
      keepFiles: true,
      path: 'concrete.configCont',
      volume: 'concrete.configCont',
    },
    customHeaders: [
      {
        id: 'concrete.customHead',
        key: 'concrete.customHead',
      },
    ],
    dockerLabels: [
      {
        id: 'concrete.dockerLabel1',
        key: 'concrete.dockerLabel1',
        value: 'concrete.dockerLabel1',
      },
    ],
    environment: [
      {
        id: 'concrete.env1',
        key: 'concrete.env1',
        value: 'concrete.env1',
      },
    ],
    extraLBAnnotations: [
      {
        id: 'concrete.lbAnn1',
        key: 'concrete.lbAnn1',
        value: 'concrete.lbAnn1',
      },
    ],
    healthCheckConfig: {
      livenessProbe: 'concrete.healthCheckConf',
      port: 1,
      readinessProbe: 'concrete.healthCheckConf',
      startupProbe: 'concrete.healthCheckConf',
    },
    storageSet: true,
    storageId: 'concrete.storageId',
    storageConfig: {
      bucket: 'concrete.storageBucket',
      path: 'concrete.storagePath',
    },
    routing: {
      domain: 'concrete.domain',
      path: 'concrete.path',
      stripPrefix: true,
      uploadLimit: 'concrete.uploadLimit',
    },
    initContainers: [
      {
        id: 'concrete.initCont1',
        args: [
          {
            id: 'concrete.initCont1Args',
            key: 'concrete.initCont1Args',
          },
        ],
        command: [
          {
            id: 'concrete.initCont1Command',
            key: 'concrete.initCont1Command',
          },
        ],
        environment: [
          {
            id: 'concrete.initCont1Env',
            key: 'concrete.initCont1Env',
            value: 'concrete.initCont1Env',
          },
        ],
        image: 'concrete.initCont1',
        name: 'concrete.initCont1',
        useParentConfig: true,
        volumes: [
          {
            id: 'concrete.initCont1Vol1',
            name: 'concrete.initCont1Vol1',
            path: 'concrete.initCont1Vol1',
          },
        ],
      },
    ],
    logConfig: {
      driver: 'gcplogs',
      options: [
        {
          id: 'concrete.logConfOps',
          key: 'concrete.logConfOps',
          value: 'concrete.logConfOps',
        },
      ],
    },
    networks: [
      {
        id: 'concrete.network1',
        key: 'concrete.network1',
      },
    ],
    portRanges: [
      {
        id: 'concrete.portRange1',
        external: {
          from: 10,
          to: 20,
        },
        internal: {
          from: 10,
          to: 20,
        },
      },
    ],
    ports: [
      {
        id: 'concrete.port1',
        internal: 10,
        external: 10,
      },
    ],
    resourceConfig: {
      limits: {
        cpu: 'concrete.limitCpu',
        memory: 'concrete.limitMemory',
      },
      requests: {
        cpu: 'concrete.requestCpu',
        memory: 'concrete.requestMemory',
      },
    },
    secrets: [
      {
        id: 'secret1',
        key: 'secret1',
        required: false,
        encrypted: true,
        value: 'concrete.secret1.value',
        publicKey: 'concrete.secret1.publicKey',
      },
    ],
    user: 1,
    volumes: [
      {
        id: 'concrete.vol1',
        name: 'concrete.vol1',
        path: 'concrete.vol1',
        class: 'concrete.vol1',
        size: 'concrete.vol1',
        type: 'rwo',
      },
    ],
    metrics: undefined,
    expectedState: undefined,
  }

  const fullDeploymentConfig: ConcreteContainerConfigData = {
    name: 'deployment.img',
    capabilities: [],
    deploymentStrategy: 'recreate',
    workingDirectory: '/app',
    expose: 'exposeWithTls',
    networkMode: 'host',
    proxyHeaders: true,
    restartPolicy: 'onFailure',
    tty: true,
    useLoadBalancer: true,
    annotations: {
      deployment: [
        {
          id: 'deployment.annotations.deployment',
          key: 'deployment.annotations.deployment',
          value: 'deployment.annotations.deployment',
        },
      ],
      ingress: [
        {
          id: 'deployment.annotations.ingress',
          key: 'deployment.annotations.ingress',
          value: 'deployment.annotations.ingress',
        },
      ],
      service: [
        {
          id: 'deployment.annotations.service',
          key: 'deployment.annotations.service',
          value: 'deployment.annotations.service',
        },
      ],
    },
    labels: {
      deployment: [
        {
          id: 'deployment.labels.deployment',
          key: 'deployment.labels.deployment',
          value: 'deployment.labels.deployment',
        },
      ],
      ingress: [
        {
          id: 'deployment.labels.ingress',
          key: 'deployment.labels.ingress',
          value: 'deployment.labels.ingress',
        },
      ],
      service: [
        {
          id: 'deployment.labels.service',
          key: 'deployment.labels.service',
          value: 'deployment.labels.service',
        },
      ],
    },
    args: [
      {
        id: 'deployment.arg1',
        key: 'deployment.arg1',
      },
    ],
    commands: [
      {
        id: 'deployment.command1',
        key: 'deployment.command1',
      },
    ],
    configContainer: {
      image: 'deployment.configCont',
      keepFiles: true,
      path: 'deployment.configCont',
      volume: 'deployment.configCont',
    },
    customHeaders: [
      {
        id: 'deployment.customHead',
        key: 'deployment.customHead',
      },
    ],
    dockerLabels: [
      {
        id: 'deployment.dockerLabel1',
        key: 'deployment.dockerLabel1',
        value: 'deployment.dockerLabel1',
      },
    ],
    environment: [
      {
        id: 'deployment.env1',
        key: 'deployment.env1',
        value: 'deployment.env1',
      },
    ],
    extraLBAnnotations: [
      {
        id: 'deployment.lbAnn1',
        key: 'deployment.lbAnn1',
        value: 'deployment.lbAnn1',
      },
    ],
    healthCheckConfig: {
      livenessProbe: 'deployment.healthCheckConf',
      port: 1,
      readinessProbe: 'deployment.healthCheckConf',
      startupProbe: 'deployment.healthCheckConf',
    },
    storageSet: true,
    storageId: 'deployment.storageId',
    storageConfig: {
      bucket: 'deployment.storageBucket',
      path: 'deployment.storagePath',
    },
    routing: {
      domain: 'deployment.domain',
      path: 'deployment.path',
      stripPrefix: true,
      uploadLimit: 'deployment.uploadLimit',
    },
    initContainers: [
      {
        id: 'deployment.initCont1',
        args: [
          {
            id: 'deployment.initCont1Args',
            key: 'deployment.initCont1Args',
          },
        ],
        command: [
          {
            id: 'deployment.initCont1Command',
            key: 'deployment.initCont1Command',
          },
        ],
        environment: [
          {
            id: 'deployment.initCont1Env',
            key: 'deployment.initCont1Env',
            value: 'deployment.initCont1Env',
          },
        ],
        image: 'deployment.initCont1',
        name: 'deployment.initCont1',
        useParentConfig: true,
        volumes: [
          {
            id: 'deployment.initCont1Vol1',
            name: 'deployment.initCont1Vol1',
            path: 'deployment.initCont1Vol1',
          },
        ],
      },
    ],
    logConfig: {
      driver: 'gcplogs',
      options: [
        {
          id: 'deployment.logConfOps',
          key: 'deployment.logConfOps',
          value: 'deployment.logConfOps',
        },
      ],
    },
    networks: [
      {
        id: 'deployment.network1',
        key: 'deployment.network1',
      },
    ],
    portRanges: [
      {
        id: 'deployment.portRange1',
        external: {
          from: 10,
          to: 20,
        },
        internal: {
          from: 10,
          to: 20,
        },
      },
    ],
    ports: [
      {
        id: 'deployment.port1',
        internal: 10,
        external: 10,
      },
    ],
    resourceConfig: {
      limits: {
        cpu: 'deployment.limitCpu',
        memory: 'deployment.limitMemory',
      },
      requests: {
        cpu: 'deployment.requestCpu',
        memory: 'deployment.requestMemory',
      },
    },
    secrets: [
      {
        id: 'secret1',
        key: 'secret1',
        required: false,
        encrypted: true,
        value: 'deployment.secret1.value',
        publicKey: 'deployment.secret1.publicKey',
      },
      {
        id: 'secret3',
        key: 'secret3',
        required: false,
        encrypted: true,
        value: 'deployment.secret3.value',
        publicKey: 'deployment.secret3.publicKey',
      },
    ],
    user: 1,
    volumes: [
      {
        id: 'deployment.vol1',
        name: 'deployment.vol1',
        path: 'deployment.vol1',
        class: 'deployment.vol1',
        size: 'deployment.vol1',
        type: 'rwo',
      },
    ],
    metrics: undefined,
    expectedState: undefined,
  }

  describe('mergeConfigsWithConcreteConfig', () => {
    it('should use the concrete variables when available', () => {
      const merged = mergeConfigsWithConcreteConfig([fullConfig], fullConcreteConfig)

      const expected: ConcreteContainerConfigData = {
        ...fullConcreteConfig,
        secrets: [
          {
            id: 'secret2',
            key: 'secret2',
            required: true,
            encrypted: false,
            value: '',
            publicKey: null,
          },
          ...fullConcreteConfig.secrets,
        ],
      }

      expect(merged).toEqual(expected)
    })

    it('should use the config variables when the concrete one is not available', () => {
      const merged = mergeConfigsWithConcreteConfig([fullConfig], {})

      const expected: ConcreteContainerConfigData = {
        ...fullConfig,
        secrets: [
          {
            id: 'secret1',
            key: 'secret1',
            required: false,
            encrypted: false,
            value: '',
            publicKey: null,
          },
          {
            id: 'secret2',
            key: 'secret2',
            required: true,
            encrypted: false,
            value: '',
            publicKey: null,
          },
        ],
      }

      expect(merged).toEqual(expected)
    })

    it('should use the concrete one only when available', () => {
      const concrete: ConcreteContainerConfigData = {
        ports: fullConcreteConfig.ports,
        labels: {
          deployment: [
            {
              id: 'concrete.labels.deployment',
              key: 'concrete.labels.deployment',
              value: 'concrete.labels.deployment',
            },
          ],
        },
        annotations: {
          service: [
            {
              id: 'concrete.annotations.service',
              key: 'concrete.annotations.service',
              value: 'concrete.annotations.service',
            },
          ],
        },
      }

      const expected: ConcreteContainerConfigData = {
        ...fullConfig,
        ports: fullConcreteConfig.ports,
        labels: {
          ...fullConfig.labels,
          deployment: concrete.labels.deployment,
        },
        annotations: {
          ...fullConfig.annotations,
          service: concrete.annotations.service,
        },
        secrets: [
          {
            id: 'secret1',
            key: 'secret1',
            required: false,
            encrypted: false,
            value: '',
            publicKey: null,
          },
          {
            id: 'secret2',
            key: 'secret2',
            required: true,
            encrypted: false,
            value: '',
            publicKey: null,
          },
        ],
      }

      const merged = mergeConfigsWithConcreteConfig([fullConfig], concrete)

      expect(merged).toEqual(expected)
    })

    it('should mix the instance config with the deployment config', () => {
      const instance: ConcreteContainerConfigData = {
        ...fullConcreteConfig,
        secrets: [
          ...fullConcreteConfig.secrets,
          {
            id: 'secret3',
            key: 'secret3',
            encrypted: false,
            required: false,
            value: '',
            publicKey: null,
          },
        ],
      }
      const deployment = fullDeploymentConfig

      const merged = mergeInstanceConfigWithDeploymentConfig(instance, deployment)

      const expected: ConcreteContainerConfigData = {
        ...fullConcreteConfig,
        args: [...instance.args, ...deployment.args],
        commands: [...instance.commands, ...deployment.commands],
        customHeaders: [...instance.customHeaders, ...deployment.customHeaders],
        dockerLabels: [...instance.dockerLabels, ...deployment.dockerLabels],
        environment: [...instance.environment, ...deployment.environment],
        extraLBAnnotations: [...instance.extraLBAnnotations, ...deployment.extraLBAnnotations],
        networks: [...instance.networks, ...deployment.networks],
        volumes: [...instance.volumes, ...deployment.volumes],
        metrics: null,
        expectedState: null,
        secrets: [
          {
            id: 'secret1',
            key: 'secret1',
            required: false,
            encrypted: true,
            value: 'concrete.secret1.value',
            publicKey: 'concrete.secret1.publicKey',
          },
          {
            id: 'secret3',
            key: 'secret3',
            required: false,
            encrypted: true,
            value: 'deployment.secret3.value',
            publicKey: 'deployment.secret3.publicKey',
          },
        ]
      }

      expect(merged).toEqual(expected)
    })
  })
})
