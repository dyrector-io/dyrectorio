import { v4 as uuid } from 'uuid'
import {
  CONTAINER_LOG_DRIVER_VALUES,
  CONTAINER_NETWORK_MODE_VALUES,
  CONTAINER_VOLUME_TYPE_VALUES,
  ContainerConfigData,
  Port,
  ContainerPortRange,
  Volume,
  ContainerRestartPolicyType,
  UniqueKey,
  UniqueKeyValue,
  VolumeType,
} from './container'
import { Project } from './project'
import { VersionType } from './version'

export const COMPOSE_RESTART_VALUES = ['no', 'always', 'on-failure', 'unless-stopped'] as const
export type ComposeRestart = (typeof COMPOSE_RESTART_VALUES)[number]

export type ComposeNamedNetwork = {
  name?: string
  external?: boolean
}

export type ComposeNamedVolume = ComposeNamedNetwork

export const COMPOSE_NETWORK_MODE_VALUES = CONTAINER_NETWORK_MODE_VALUES
export type ComposeNetworkMode = (typeof COMPOSE_NETWORK_MODE_VALUES)[number]

export const COMPOSE_LOG_DRIVER_VALUES = CONTAINER_LOG_DRIVER_VALUES
export type ComposeLogDriver = (typeof COMPOSE_LOG_DRIVER_VALUES)[number]

export type ComposeLogging = {
  driver?: ComposeLogDriver // defaults to json-file
  options?: Record<string, string>
}

export type ComposeService = {
  container_name?: string
  image: string
  environment?: string[]
  entrypoint?: string | string[]
  command?: string | string[]
  ports?: (string | number)[]
  volumes?: string[]
  restart?: ComposeRestart // defaults to no
  labels?: string[]
  network_mode: ComposeNetworkMode
  networks?: string[]
  logging?: ComposeLogging
  tty?: boolean
  working_dir?: string
  user?: string // we only support numbers, so '0' will work but root won't
  env_file?: string | string[]
}

export type Compose = {
  services: Record<string, ComposeService>
  volumes: Record<string, ComposeNamedVolume>
  networks: Record<string, ComposeNamedNetwork>
}

export type DotEnvironment = {
  name: string
  errorMessage?: string
  environment: Record<string, string>
}

export type ConvertedContainer = {
  image: string
  config: ContainerConfigData
}

export const COMPOSE_TARGET_TYPE_VALUES = ['new-project', 'existing-project'] as const
export type ComposeTargetType = (typeof COMPOSE_TARGET_TYPE_VALUES)[number]

export type ComposeGenerateVersion = {
  targetType: ComposeTargetType
  versionName: string
  versionType: VersionType
  projectName: string
  project: Project | null
}

const splitPortRange = (range: string): [number, number] | null => {
  if (!range) {
    return null
  }

  const [from, to] = range.split('-')
  if (!to) {
    return null
  }

  return [Number.parseInt(from, 10), Number.parseInt(to, 10)]
}

const mapPort = (port: string | number): [Port, ContainerPortRange] => {
  try {
    if (typeof port === 'number') {
      return [
        {
          id: uuid(),
          internal: port,
        },
        null,
      ]
    }

    // string port
    let [external, internal] = port.split(':', 2)

    if (!internal) {
      // it only internal part
      internal = external
      external = null
    }

    const internalRange = splitPortRange(internal)
    if (!internalRange) {
      return [
        {
          id: uuid(),
          internal: Number.parseInt(internal, 10),
          external: external ? Number.parseInt(external, 10) : null,
        },
        null,
      ]
    }

    const externalRange = splitPortRange(external)
    const [internalFrom, internalTo] = internalRange
    const [externalFrom, externalTo] = externalRange ?? [null, null]

    return [
      null,
      {
        id: uuid(),
        internal: {
          from: internalFrom,
          to: internalTo,
        },
        external: externalRange
          ? {
              from: externalFrom,
              to: externalTo,
            }
          : null,
      },
    ]
  } catch {
    return null
  }
}

const mapVolume = (volume: string): Volume => {
  const [name, path, type] = volume.split(':', 3)

  return {
    id: uuid(),
    name: path ? name : '',
    path: path || name,
    type: type && CONTAINER_VOLUME_TYPE_VALUES.includes(type as VolumeType) ? (type as VolumeType) : 'rwo',
  }
}

const mapRestart = (restart: ComposeRestart): ContainerRestartPolicyType => {
  switch (restart) {
    case 'no':
      return 'no'
    case 'always':
      return 'always'
    case 'on-failure':
      return 'onFailure'
    case 'unless-stopped':
      return 'unlessStopped'
    default:
      return 'no'
  }
}

const mapUser = (user: string): number => {
  try {
    return Number.parseInt(user, 10)
  } catch {
    return null
  }
}

export const envStringToKeyValue = (env: string): [string, string] => {
  const [key, ...rest] = env.split('=')
  const value = rest.join('=')
  return [key, value]
}

export const mapKeyValuesToRecord = (items: string[] | null): Record<string, string> =>
  items?.reduce((result, it) => {
    const [key, value] = envStringToKeyValue(it)

    result[key] = value
    return result
  }, {})

const mapKeyValues = (items: string[] | null): UniqueKeyValue[] | null =>
  items?.map(it => {
    const [key, value] = envStringToKeyValue(it)

    return {
      id: uuid(),
      key,
      value,
    }
  })

const mapStringOrStringArray = (candidate: string | string[]): UniqueKey[] =>
  !candidate
    ? null
    : (typeof candidate === 'string' ? [candidate] : candidate).map(key => ({
        id: uuid(),
        key,
      }))

export const mapComposeServiceToContainerConfig = (
  service: ComposeService,
  serviceKey: string,
): ContainerConfigData => {
  const ports: Port[] = []
  const portRanges: ContainerPortRange[] = []
  service.ports?.forEach(it => {
    const [port, portRange] = mapPort(it)
    if (port) {
      ports.push(port)
    } else if (portRange) {
      portRanges.push(portRange)
    }
  })

  return {
    name: service.container_name ?? serviceKey,
    environment: mapKeyValues(service.environment),
    commands: mapStringOrStringArray(service.entrypoint),
    args: mapStringOrStringArray(service.command),
    ports: ports.length > 0 ? ports : null,
    portRanges: portRanges.length > 0 ? portRanges : null,
    volumes: service.volumes?.map(it => mapVolume(it)),
    restartPolicy: service.restart ? mapRestart(service.restart) : null,
    dockerLabels: mapKeyValues(service.labels),
    networkMode: service.network_mode,
    networks: service.networks?.map(key => ({
      id: uuid(),
      key,
    })),
    logConfig: !service.logging
      ? null
      : {
          driver: service.logging.driver,
          options: !service.logging.options
            ? []
            : Object.entries(service.logging.options).map(entry => {
                const [key, value] = entry
                return {
                  id: uuid(),
                  key,
                  value,
                }
              }),
        },
    tty: service.tty,
    workingDirectory: service.working_dir,
    user: mapUser(service.user),
    expose: 'none',
    capabilities: [],
    deploymentStrategy: 'recreate',
    proxyHeaders: false,
    useLoadBalancer: false,
  }
}

export const mapComposeServices = (compose: Compose): ConvertedContainer[] =>
  Object.entries(compose.services).map(entry => {
    const [key, service] = entry

    return {
      image: service.image,
      config: mapComposeServiceToContainerConfig(service, key),
    }
  })

export class DotEnvApplicator {
  constructor(private readonly dotEnv: Record<string, string>) {}

  applyToString(candidate: string): string {
    let original = candidate ?? undefined
    let applied = this.applyToStringOnce(candidate) ?? undefined

    let iterations = 0
    while (original !== applied && iterations < 32) {
      original = applied
      applied = this.applyToStringOnce(original) ?? undefined
      candidate = applied

      iterations++
    }

    return applied
  }

  applyToStringArray(candidate: string[]): string[] {
    if (!candidate) {
      return candidate
    }

    return candidate.map(it => this.applyToString(it))
  }

  applyToEnum<T extends string>(candidate: T): T {
    return this.applyToString(candidate) as T
  }

  applyToStringOrStringArray(candidate: string | string[]): string | string[] {
    if (!candidate) {
      return candidate
    }

    if (typeof candidate === 'string') {
      return this.applyToString(candidate)
    }

    return this.applyToStringArray(candidate)
  }

  applyToStringOrNumberArray(candidate: (string | number)[]): (string | number)[] {
    if (!candidate) {
      return candidate
    }

    return candidate.map(it => {
      if (typeof it === 'number') {
        return it
      }

      return this.applyToString(it)
    })
  }

  applyToObjectValues(candidate: Record<string, string>): Record<string, string> {
    if (!candidate) {
      return candidate
    }

    const result = Object.entries(candidate).map(it => {
      const [key, value] = it

      return [key, this.applyToString(value)]
    })

    return Object.fromEntries(result)
  }

  applyToBoolean(candidate: any): boolean {
    if (typeof candidate !== 'string') {
      return candidate
    }

    const result = this.applyToString(candidate)
    return result === 'true'
  }

  private applyEnvToFoundEnv(key: string): string {
    const [name, defaultValue] = key.split(':-')
    if (defaultValue) {
      key = name
    }

    return this.dotEnv[key] ?? defaultValue ?? `\${${key}}`
  }

  private applyToStringOnce(candidate: string): string {
    if (!candidate) {
      return candidate
    }

    candidate = candidate.replace(/\${[^}]*}/g, subStr => {
      const envName = subStr.substring(2, subStr.length - 1)
      return this.applyEnvToFoundEnv(envName)
    })

    candidate = candidate.replace(/\$[^{][a-zA-Z0-9_]*/g, subStr => {
      const envName = subStr.substring(1).trim()
      return this.applyEnvToFoundEnv(envName)
    })

    return candidate
  }
}

export const applyDotEnvToComposeService = (
  compose: ComposeService,
  environment: Record<string, string>,
): ComposeService => {
  const dotEnv = new DotEnvApplicator(environment)

  return {
    container_name: dotEnv.applyToString(compose.container_name),
    image: dotEnv.applyToString(compose.image),
    environment: dotEnv.applyToStringArray(compose.environment),
    entrypoint: dotEnv.applyToStringOrStringArray(compose.entrypoint),
    command: dotEnv.applyToStringOrStringArray(compose.command),
    ports: dotEnv.applyToStringOrNumberArray(compose.ports),
    volumes: dotEnv.applyToStringArray(compose.volumes),
    restart: dotEnv.applyToEnum(compose.restart),
    labels: dotEnv.applyToStringArray(compose.labels),
    network_mode: dotEnv.applyToEnum(compose.network_mode),
    networks: dotEnv.applyToStringArray(compose.networks),
    logging: !compose.logging
      ? compose.logging
      : {
          driver: dotEnv.applyToEnum(compose.logging.driver),
          options: dotEnv.applyToObjectValues(compose.logging.options),
        },
    tty: dotEnv.applyToBoolean(compose.tty),
    working_dir: dotEnv.applyToString(compose.working_dir),
    user: dotEnv.applyToString(compose.user),
    env_file: compose.env_file,
  }
}
