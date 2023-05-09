import { ContainerConfigData, InstanceContainerConfigData } from 'src/domain/container'
import ContainerMapper from '../container/container.mapper'
import ImageMapper from '../image/image.mapper'
import SharedMapper from '../shared/shared.mapper'
import { PatchInstanceDto } from './deploy.dto'
import DeployMapper from './deploy.mapper'

describe('DeployMapper', () => {
  let imageMapper: ImageMapper = null
  let containerMapper: ContainerMapper = null
  let deployMapper: DeployMapper = null

  beforeEach(() => {
    containerMapper = new ContainerMapper()
    imageMapper = new ImageMapper(null, containerMapper)
    deployMapper = new DeployMapper(new SharedMapper(), imageMapper, containerMapper)
  })

  const fullImage: ContainerConfigData = {
    name: 'img',
    capabilities: [],
    deploymentStrategy: 'recreate',
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
    ingress: {
      host: 'ingress',
      name: 'ingress',
      uploadLimit: 'ingress',
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
  }

  const fullInstance: InstanceContainerConfigData = {
    name: 'instance.img',
    capabilities: [],
    deploymentStrategy: 'recreate',
    expose: 'exposeWithTls',
    networkMode: 'host',
    proxyHeaders: true,
    restartPolicy: 'onFailure',
    tty: true,
    useLoadBalancer: true,
    annotations: {
      deployment: [
        {
          id: 'instance.annotations.deployment',
          key: 'instance.annotations.deployment',
          value: 'instance.annotations.deployment',
        },
      ],
      ingress: [
        {
          id: 'instance.annotations.ingress',
          key: 'instance.annotations.ingress',
          value: 'instance.annotations.ingress',
        },
      ],
      service: [
        {
          id: 'instance.annotations.service',
          key: 'instance.annotations.service',
          value: 'instance.annotations.service',
        },
      ],
    },
    labels: {
      deployment: [
        {
          id: 'instance.labels.deployment',
          key: 'instance.labels.deployment',
          value: 'instance.labels.deployment',
        },
      ],
      ingress: [
        {
          id: 'instance.labels.ingress',
          key: 'instance.labels.ingress',
          value: 'instance.labels.ingress',
        },
      ],
      service: [
        {
          id: 'instance.labels.service',
          key: 'instance.labels.service',
          value: 'instance.labels.service',
        },
      ],
    },
    args: [
      {
        id: 'instance.arg1',
        key: 'instance.arg1',
      },
    ],
    commands: [
      {
        id: 'instance.command1',
        key: 'instance.command1',
      },
    ],
    configContainer: {
      image: 'instance.configCont',
      keepFiles: true,
      path: 'instance.configCont',
      volume: 'instance.configCont',
    },
    customHeaders: [
      {
        id: 'instance.customHead',
        key: 'instance.customHead',
      },
    ],
    dockerLabels: [
      {
        id: 'instance.dockerLabel1',
        key: 'instance.dockerLabel1',
        value: 'instance.dockerLabel1',
      },
    ],
    environment: [
      {
        id: 'instance.env1',
        key: 'instance.env1',
        value: 'instance.env1',
      },
    ],
    extraLBAnnotations: [
      {
        id: 'instance.lbAnn1',
        key: 'instance.lbAnn1',
        value: 'instance.lbAnn1',
      },
    ],
    healthCheckConfig: {
      livenessProbe: 'instance.healthCheckConf',
      port: 1,
      readinessProbe: 'instance.healthCheckConf',
      startupProbe: 'instance.healthCheckConf',
    },
    storageSet: true,
    storageId: 'instance.storageId',
    storageConfig: {
      bucket: 'instance.storageBucket',
      path: 'instance.storagePath',
    },
    ingress: {
      host: 'instance.ingress',
      name: 'instance.ingress',
      uploadLimit: 'instance.ingress',
    },
    initContainers: [
      {
        id: 'instance.initCont1',
        args: [
          {
            id: 'instance.initCont1Args',
            key: 'instance.initCont1Args',
          },
        ],
        command: [
          {
            id: 'instance.initCont1Command',
            key: 'instance.initCont1Command',
          },
        ],
        environment: [
          {
            id: 'instance.initCont1Env',
            key: 'instance.initCont1Env',
            value: 'instance.initCont1Env',
          },
        ],
        image: 'instance.initCont1',
        name: 'instance.initCont1',
        useParentConfig: true,
        volumes: [
          {
            id: 'instance.initCont1Vol1',
            name: 'instance.initCont1Vol1',
            path: 'instance.initCont1Vol1',
          },
        ],
      },
    ],
    logConfig: {
      driver: 'gcplogs',
      options: [
        {
          id: 'instance.logConfOps',
          key: 'instance.logConfOps',
          value: 'instance.logConfOps',
        },
      ],
    },
    networks: [
      {
        id: 'instance.network1',
        key: 'instance.network1',
      },
    ],
    portRanges: [
      {
        id: 'instance.portRange1',
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
        id: 'instance.port1',
        internal: 10,
        external: 10,
      },
    ],
    resourceConfig: {
      limits: {
        cpu: 'instance.limitCpu',
        memory: 'instance.limitMemory',
      },
      requests: {
        cpu: 'instance.requestCpu',
        memory: 'instance.requestMemory',
      },
    },
    secrets: [
      {
        id: 'secret1',
        key: 'instance.secret1',
        required: false,
        encrypted: true,
        value: 'instance.secret1.publicKey',
        publicKey: 'instance.secret1.publicKey',
      },
    ],
    user: 1,
    volumes: [
      {
        id: 'instance.vol1',
        name: 'instance.vol1',
        path: 'instance.vol1',
        class: 'instance.vol1',
        size: 'instance.vol1',
        type: 'rwo',
      },
    ],
  }

  const generateUndefinedInstance = (): InstanceContainerConfigData => {
    const instance: InstanceContainerConfigData = {}
    Object.keys(fullImage).forEach(key => {
      instance[key] = undefined
    })

    return instance
  }

  describe('mergeConfigs', () => {
    it('should use the instance variables when available', () => {
      const merged = containerMapper.mergeConfigs(fullImage, fullInstance)

      expect(merged).toEqual(fullInstance)
    })

    it('should use the image variables when instance is not available', () => {
      const merged = containerMapper.mergeConfigs(fullImage, {})

      const expected: InstanceContainerConfigData = {
        ...fullImage,
        secrets: [
          {
            id: 'secret1',
            key: 'secret1',
            required: false,
            encrypted: false,
            value: '',
            publicKey: null,
          },
        ],
      }

      expect(merged).toEqual(expected)
    })

    it('should use the instance only when available', () => {
      const instance: InstanceContainerConfigData = {
        ports: fullInstance.ports,
        labels: {
          deployment: [
            {
              id: 'instance.labels.deployment',
              key: 'instance.labels.deployment',
              value: 'instance.labels.deployment',
            },
          ],
        },
        annotations: {
          service: [
            {
              id: 'instance.annotations.service',
              key: 'instance.annotations.service',
              value: 'instance.annotations.service',
            },
          ],
        },
      }

      const expected: InstanceContainerConfigData = {
        ...fullImage,
        ports: fullInstance.ports,
        labels: {
          ...fullImage.labels,
          deployment: instance.labels.deployment,
        },
        annotations: {
          ...fullImage.annotations,
          service: instance.annotations.service,
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
        ],
      }

      const merged = containerMapper.mergeConfigs(fullImage, instance)

      expect(merged).toEqual(expected)
    })
  })

  describe('instanceConfigToInstanceContainerConfigData', () => {
    it('should overwrite the specified properties only', () => {
      const patch: PatchInstanceDto = {
        config: {
          ports: [
            ...fullImage.ports,
            {
              id: 'instance.new-port',
              internal: 20,
              external: 20,
            },
          ],
        },
      }

      const expected = generateUndefinedInstance()

      expected.ports = [
        ...fullImage.ports,
        {
          id: 'instance.new-port',
          internal: 20,
          external: 20,
        },
      ]

      const actual = deployMapper.instanceConfigDtoToInstanceContainerConfigData(fullImage, {}, patch.config)

      expect(actual).toEqual(expected)
    })

    it('should patch annotations and labels values based on image, when no current instance value present', () => {
      const patch: PatchInstanceDto = {
        config: {
          annotations: {
            ingress: fullInstance.annotations.ingress,
            deployment: undefined,
            service: undefined,
          },
          labels: {
            deployment: fullInstance.labels.deployment,
            ingress: undefined,
            service: undefined,
          },
        },
      }

      const expected = generateUndefinedInstance()

      expected.annotations = {
        ...fullImage.annotations,
        ingress: fullInstance.annotations.ingress,
      }

      expected.labels = {
        ...fullImage.labels,
        deployment: fullInstance.labels.deployment,
      }

      const actual = deployMapper.instanceConfigDtoToInstanceContainerConfigData(fullImage, {}, patch.config)

      expect(actual).toEqual(expected)
    })

    it('should patch annotations and labels values based on instance when instance value is present', () => {
      const annotService = [
        {
          id: 'patch.annotation.service',
          key: 'patch.annotation.service',
          value: 'patch.annotation.service',
        },
      ]

      const labelIngress = [
        {
          id: 'patch.labels.ingress',
          key: 'patch.labels.ingress',
          value: 'patch.labels.ingress',
        },
      ]

      const patch: PatchInstanceDto = {
        config: {
          annotations: {
            ingress: undefined,
            deployment: undefined,
            service: annotService,
          },
          labels: {
            deployment: undefined,
            ingress: labelIngress,
            service: undefined,
          },
        },
      }

      const instance: InstanceContainerConfigData = {
        labels: fullInstance.labels,
        annotations: fullInstance.annotations,
      }

      const expected = generateUndefinedInstance()

      expected.annotations = {
        ...fullInstance.annotations,
        service: annotService,
      }

      expected.labels = {
        ...fullInstance.labels,
        ingress: labelIngress,
      }

      const actual = deployMapper.instanceConfigDtoToInstanceContainerConfigData(fullImage, instance, patch.config)

      expect(actual).toEqual(expected)
    })
  })
})
