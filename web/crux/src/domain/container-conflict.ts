import {
  ConcreteContainerConfigData,
  ContainerConfigData,
  ContainerConfigDataWithId,
  ContainerPortRange,
  Log,
  Marker,
  Port,
  PortRange,
  ResourceConfig,
  UniqueKeyValue,
  Volume,
} from './container'

export type ConflictedUniqueItem = {
  key: string
  configIds: string[]
}

export type ConflictedPort = {
  internal: number
  configIds: string[]
}

export type ConflictedPortRange = {
  range: PortRange
  configIds: string[]
}

export type ConflictedLog = {
  driver?: string[]
  options?: ConflictedUniqueItem[]
}

export type ConflictedResoureConfig = {
  limits?: string[]
  requests?: string[]
}

export type ConflictedMarker = {
  service?: ConflictedUniqueItem[]
  deployment?: ConflictedUniqueItem[]
  ingress?: ConflictedUniqueItem[]
}

type ConflictedLogKeys = {
  driver?: boolean
  options?: string[]
}

type ConflictedResoureConfigKeys = Partial<Record<keyof ConflictedResoureConfig, boolean>>
type ConflictedMarkerKeys = Partial<Record<keyof ConflictedMarker, string[]>>

// config ids where the given property is present
export type ConflictedContainerConfigData = {
  // common
  name?: string[]
  environment?: ConflictedUniqueItem[]
  routing?: string[]
  expose?: string[]
  user?: string[]
  workingDirectory?: string[]
  tty?: string[]
  configContainer?: string[]
  ports?: ConflictedPort[]
  portRanges?: ConflictedPortRange[]
  volumes?: ConflictedUniqueItem[]
  initContainers?: string[]
  capabilities?: ConflictedUniqueItem[]
  storage?: string[]

  // dagent
  logConfig?: string[]
  restartPolicy?: string[]
  networkMode?: string[]
  dockerLabels?: ConflictedUniqueItem[]
  expectedState?: string[]

  // crane
  deploymentStrategy?: string[]
  proxyHeaders?: string[]
  useLoadBalancer?: string[]
  extraLBAnnotations?: ConflictedUniqueItem[]
  healthCheckConfig?: string[]
  resourceConfig?: string[]
  annotations?: ConflictedMarker
  labels?: ConflictedMarker
  metrics?: string[]
}

export const rangesOverlap = (one: PortRange, other: PortRange): boolean => one.from <= other.to && other.from <= one.to
export const rangesAreEqual = (one: PortRange, other: PortRange): boolean =>
  one.from === other.from && one.to === other.to

const appendConflict = (conflicts: string[], oneId: string, otherId: string): string[] => {
  if (!conflicts) {
    return [oneId, otherId]
  }

  if (!conflicts.includes(oneId)) {
    conflicts.push(oneId)
  }

  if (!conflicts.includes(otherId)) {
    conflicts.push(otherId)
  }

  return conflicts
}

const appendUniqueItemConflicts = (
  conflicts: ConflictedUniqueItem[],
  oneId: string,
  otherId: string,
  keys: string[],
): ConflictedUniqueItem[] => {
  if (!conflicts) {
    return keys.map(it => ({
      key: it,
      configIds: [oneId, otherId],
    }))
  }

  keys.forEach(key => {
    let conflict = conflicts.find(it => it.key === key)
    if (!conflict) {
      conflict = {
        key,
        configIds: null,
      }

      conflicts.push(conflict)
    }

    conflict.configIds = appendConflict(conflict.configIds, oneId, otherId)
  })

  return conflicts
}

const appendPortConflicts = (
  conflicts: ConflictedPort[],
  oneId: string,
  otherId: string,
  internalPorts: number[],
): ConflictedPort[] => {
  if (!conflicts) {
    return internalPorts.map(it => ({
      internal: it,
      configIds: [oneId, otherId],
    }))
  }

  internalPorts.forEach(internalPort => {
    let conflict = conflicts.find(it => internalPort === it.internal)
    if (!conflict) {
      conflict = {
        internal: internalPort,
        configIds: null,
      }

      conflicts.push(conflict)
    }

    conflict.configIds = appendConflict(conflict.configIds, oneId, otherId)
  })

  return conflicts
}

const appendPortRangeConflicts = (
  conflicts: ConflictedPortRange[],
  oneId: string,
  otherId: string,
  ranges: PortRange[],
): ConflictedPortRange[] => {
  if (!conflicts) {
    return ranges.map(it => ({
      range: it,
      configIds: [oneId, otherId],
    }))
  }

  ranges.forEach(range => {
    let conflict = conflicts.find(it => rangesAreEqual(it.range, range))
    if (!conflict) {
      conflict = {
        range,
        configIds: null,
      }

      conflicts.push(conflict)
    }

    conflict.configIds = appendConflict(conflict.configIds, oneId, otherId)
  })

  return conflicts
}

const appendLogConflict = (
  conflicts: ConflictedLog,
  oneId: string,
  otherId: string,
  keys: ConflictedLogKeys,
): ConflictedLog => {
  if (!conflicts) {
    conflicts = {}
  }

  if (keys.driver) {
    conflicts.driver = appendConflict(conflicts.driver, oneId, otherId)
  }

  if (keys.options) {
    conflicts.options = appendUniqueItemConflicts(conflicts.options, oneId, otherId, keys.options)
  }

  return conflicts
}

const appendResourceConfigConflict = (
  conflicts: ConflictedResoureConfig,
  oneId: string,
  otherId: string,
  keys: ConflictedResoureConfigKeys,
): ConflictedResoureConfig => {
  if (!conflicts) {
    conflicts = {}
  }

  if (keys.limits) {
    conflicts.limits = appendConflict(conflicts.limits, oneId, otherId)
  }

  if (keys.requests) {
    conflicts.requests = appendConflict(conflicts.requests, oneId, otherId)
  }

  return conflicts
}

const appendMarkerConflict = (
  conflicts: ConflictedMarker,
  oneId: string,
  otherId: string,
  keys: ConflictedMarkerKeys,
): ConflictedMarker => {
  if (!conflicts) {
    conflicts = {}
  }

  if (keys.deployment) {
    conflicts.deployment = appendUniqueItemConflicts(conflicts.deployment, oneId, otherId, keys.deployment)
  }

  if (keys.ingress) {
    conflicts.ingress = appendUniqueItemConflicts(conflicts.ingress, oneId, otherId, keys.ingress)
  }

  if (keys.service) {
    conflicts.service = appendUniqueItemConflicts(conflicts.service, oneId, otherId, keys.service)
  }

  return conflicts
}

const stringsConflict = (one: string, other: string): boolean => {
  if (typeof one !== 'string' || typeof other !== 'string') {
    // one of them are null or uninterpretable
    return false
  }

  return one !== other
}

const booleansConflict = (one: boolean, other: boolean): boolean => {
  if (typeof one !== 'boolean' || typeof other !== 'boolean') {
    // one of them are null or uninterpretable
    return false
  }

  return one !== other
}

const numbersConflict = (one: number, other: number): boolean => {
  if (typeof one !== 'number' || typeof other !== 'number') {
    // some of them are null or uninterpretable
    return false
  }

  return one !== other
}

const objectsConflict = (one: object, other: object): boolean => {
  if (typeof one !== 'object' || typeof other !== 'object') {
    // some of them are null or uninterpretable
    return false
  }

  return JSON.stringify(one) !== JSON.stringify(other)
}

// returns the conflicting keys
const uniqueKeyValuesConflict = (one: UniqueKeyValue[], other: UniqueKeyValue[]): string[] | null => {
  if (!one || !other) {
    return null
  }

  const conflicts = one
    .filter(item => {
      const otherItem = other.find(it => it.key === item.key)
      if (!otherItem) {
        return false
      }

      return item.value !== otherItem.value
    })
    .map(it => it.key)

  if (conflicts.length < 1) {
    return null
  }

  return conflicts
}

// returns the conflicting internal ports
const portsConflict = (one: Port[], other: Port[]): number[] | null => {
  if (!one || !other) {
    return null
  }

  const conflicts = one.filter(item => other.find(it => it.internal === item.internal)).map(it => it.internal)

  if (conflicts.length < 1) {
    return null
  }

  return conflicts
}

// returns the conflicting internal ranges
const portRangesConflict = (one: ContainerPortRange[], other: ContainerPortRange[]): PortRange[] | null => {
  if (!one || !other) {
    return null
  }

  const conflicts = one
    .filter(item =>
      other.find(it => rangesOverlap(item.internal, it.internal) || rangesOverlap(item.external, item.internal)),
    )
    .map(it => it.internal)

  if (conflicts.length < 1) {
    return null
  }

  return conflicts
}

// returns the conflicting paths
const volumesConflict = (one: Volume[], other: Volume[]): string[] | null => {
  if (!one || !other) {
    return null
  }

  const conflicts = one
    .filter(item => {
      const otherItem = other.find(it => it.path === item.path)

      return objectsConflict(item, otherItem)
    })
    .map(it => it.path)

  if (conflicts.length < 1) {
    return null
  }

  return conflicts
}

const logsConflict = (one: Log, other: Log): ConflictedLogKeys | null => {
  if (!one || !other) {
    return null
  }

  const driver = stringsConflict(one.driver, other.driver)
  const options = uniqueKeyValuesConflict(one.options, other.options)

  const conflicts: ConflictedLogKeys = {}

  if (driver) {
    conflicts.driver = driver
  }

  if (options) {
    conflicts.options = options
  }

  if (Object.keys(conflicts).length < 1) {
    return null
  }

  return conflicts
}

const resoureConfigsConflict = (one: ResourceConfig, other: ResourceConfig): ConflictedResoureConfigKeys | null => {
  if (!one || !other) {
    return null
  }

  const conflicts: ConflictedResoureConfigKeys = {
    limits: objectsConflict(one.limits, other.limits),
    requests: objectsConflict(one.requests, other.requests),
  }

  if (!Object.values(conflicts).find(it => it)) {
    // no conflicts
    return null
  }

  return conflicts
}

const markersConflict = (one: Marker, other: Marker): ConflictedMarkerKeys | null => {
  if (!one || !other) {
    return null
  }

  const deployment = uniqueKeyValuesConflict(one.deployment, other.deployment)
  const ingress = uniqueKeyValuesConflict(one.ingress, other.ingress)
  const service = uniqueKeyValuesConflict(one.service, other.service)

  const conflicts: ConflictedMarkerKeys = {}

  if (deployment) {
    conflicts.deployment = deployment
  }

  if (ingress) {
    conflicts.ingress = ingress
  }

  if (service) {
    conflicts.service = service
  }

  if (Object.keys(conflicts).length < 1) {
    return null
  }

  return conflicts
}

const collectConflicts = (
  conflicts: ConflictedContainerConfigData,
  one: ContainerConfigDataWithId,
  other: ContainerConfigDataWithId,
) => {
  const checkStringConflict = (key: keyof ContainerConfigData) => {
    const oneValue = one[key] as string
    const otherValue = other[key] as string

    if (stringsConflict(oneValue, otherValue)) {
      conflicts[key] = appendConflict(conflicts[key], one.id, other.id)
    }
  }

  const checkUniqueKeyValuesConflict = (key: keyof ContainerConfigData) => {
    const oneValue = one[key] as UniqueKeyValue[]
    const otherValue = other[key] as UniqueKeyValue[]

    const uniqueKeyValueConflicts = uniqueKeyValuesConflict(oneValue, otherValue)
    if (uniqueKeyValueConflicts) {
      conflicts[key] = appendUniqueItemConflicts(conflicts[key], one.id, other.id, uniqueKeyValueConflicts)
    }
  }

  const checkBooleanConflict = (key: keyof ContainerConfigData) => {
    const oneValue = one[key] as boolean
    const otherValue = other[key] as boolean

    if (booleansConflict(oneValue, otherValue)) {
      conflicts[key] = appendConflict(conflicts[key], one.id, other.id)
    }
  }

  const checkNumberConflict = (key: keyof ContainerConfigData) => {
    const oneValue = one[key] as number
    const otherValue = other[key] as number

    if (numbersConflict(oneValue, otherValue)) {
      conflicts[key] = appendConflict(conflicts[key], one.id, other.id)
    }
  }

  const checkObjectConflict = (key: keyof ContainerConfigData) => {
    const oneValue = one[key] as object
    const otherValue = other[key] as object

    if (objectsConflict(oneValue, otherValue)) {
      conflicts[key] = appendConflict(conflicts[key], one.id, other.id)
    }
  }

  const checkPortsConflict = (key: keyof ContainerConfigData) => {
    const oneValue = one[key] as Port[]
    const otherValue = other[key] as Port[]

    const portsConflicts = portsConflict(oneValue, otherValue)
    if (portsConflicts) {
      conflicts[key] = appendPortConflicts(conflicts[key], one.id, other.id, portsConflicts)
    }
  }

  const checkPortRangesConflict = (key: keyof ContainerConfigData) => {
    const oneValue = one[key] as ContainerPortRange[]
    const otherValue = other[key] as ContainerPortRange[]

    const portRangesConflicts = portRangesConflict(oneValue, otherValue)
    if (portRangesConflicts) {
      conflicts[key] = appendPortRangeConflicts(conflicts[key], one.id, other.id, portRangesConflicts)
    }
  }

  const checkVolumesConflict = (key: keyof ContainerConfigData) => {
    const oneValue = one[key] as Volume[]
    const otherValue = other[key] as Volume[]

    const volumeConflicts = volumesConflict(oneValue, otherValue)
    if (volumeConflicts) {
      conflicts[key] = appendUniqueItemConflicts(conflicts[key], one.id, other.id, volumeConflicts)
    }
  }

  const checkStorageConflict = () => {
    if (typeof one.storageSet !== 'boolean' || typeof other.storageSet !== 'boolean') {
      // one of them are null or uninterpretable
      return
    }

    if (one.storageSet && other.storageSet) {
      // both cannot be set
      conflicts.storage = appendConflict(conflicts.storage, one.id, other.id)
    }
  }

  const checkLogsConflict = (key: keyof ContainerConfigData) => {
    const oneValue = one[key] as Log
    const otherValue = other[key] as Log

    const logConflicts = logsConflict(oneValue, otherValue)
    if (logConflicts) {
      conflicts[key] = appendLogConflict(conflicts[key], one.id, other.id, logConflicts)
    }
  }

  const checkResourceConfigConflict = (key: keyof ContainerConfigData) => {
    const oneValue = one[key] as ResourceConfig
    const otherValue = other[key] as ResourceConfig

    const resourceConfigConflicts = resoureConfigsConflict(oneValue, otherValue)
    if (resourceConfigConflicts) {
      conflicts[key] = appendResourceConfigConflict(conflicts[key], one.id, other.id, resourceConfigConflicts)
    }
  }

  const checkMarkerConflict = (key: keyof ContainerConfigData) => {
    const oneValue = one[key] as Marker
    const otherValue = other[key] as Marker

    const markerConflicts = markersConflict(oneValue, otherValue)
    if (markerConflicts) {
      conflicts[key] = appendMarkerConflict(conflicts[key], one.id, other.id, markerConflicts)
    }
  }

  // common
  checkStringConflict('name')
  checkUniqueKeyValuesConflict('environment')
  // 'secrets' are keys only so duplicates are allowed
  checkObjectConflict('routing')
  checkStringConflict('expose')
  checkNumberConflict('user')
  checkStringConflict('workingDirectory')
  checkBooleanConflict('tty')
  checkObjectConflict('configContainer')
  checkPortsConflict('ports')
  checkPortRangesConflict('portRanges')
  checkVolumesConflict('volumes')
  // 'commands' are keys only so duplicates are allowed
  // 'args' are keys only so duplicates are allowed
  checkObjectConflict('initContainers') // TODO (@m8vago) compare them correctly after the init container rework
  checkUniqueKeyValuesConflict('capabilities')
  checkStorageConflict()

  // dagent
  checkLogsConflict('logConfig')
  checkStringConflict('restartPolicy')
  checkStringConflict('networkMode')
  // 'networks' are keys only so duplicates are allowed
  checkUniqueKeyValuesConflict('dockerLabels')
  checkStringConflict('expectedState')

  // crane
  checkStringConflict('deploymentStrategy')
  // 'customHeaders' are keys only so duplicates are allowed
  checkBooleanConflict('proxyHeaders')
  checkBooleanConflict('useLoadBalancer')
  checkUniqueKeyValuesConflict('extraLBAnnotations')
  checkObjectConflict('healthCheckConfig')
  checkResourceConfigConflict('resourceConfig')
  checkMarkerConflict('annotations')
  checkMarkerConflict('labels')
  checkObjectConflict('metrics')

  if (Object.keys(conflicts).length < 1) {
    return null
  }

  return conflicts
}

type ContainerConfigDataProperty = keyof ContainerConfigData
export const checkForConflicts = (
  configs: ContainerConfigDataWithId[],
  definedKeys: ContainerConfigDataProperty[] = [],
): ConflictedContainerConfigData | null => {
  configs = configs.map(conf => {
    const newConf: ContainerConfigDataWithId = {
      ...conf,
    }

    Object.keys(conf).forEach(it => {
      const prop = it as ContainerConfigDataProperty
      if (!definedKeys.includes(prop)) {
        return
      }

      delete newConf[prop]
    })

    return newConf
  })

  const conflicts: ConflictedContainerConfigData = {}

  configs.forEach(one => {
    const others = configs.filter(it => it !== one)

    others.forEach(other => collectConflicts(conflicts, one, other))
  })

  if (Object.keys(conflicts).length < 1) {
    return null
  }

  return conflicts
}

const UNINTERESTED_KEYS = ['id', 'type', 'updatedAt', 'updatedBy', 'secrets']
export const getConflictsForConcreteConfig = (
  configs: ContainerConfigDataWithId[],
  concreteConfig: ConcreteContainerConfigData,
): ConflictedContainerConfigData | null =>
  checkForConflicts(
    configs,
    Object.entries(concreteConfig)
      .filter(entry => {
        const [key, value] = entry
        if (UNINTERESTED_KEYS.includes(key)) {
          return false
        }

        return typeof value !== 'undefined' && value !== null
      })
      .map(entry => {
        const [key] = entry
        return key
      }) as ContainerConfigDataProperty[],
  )
