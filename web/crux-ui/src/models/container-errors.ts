import { Translate } from 'next-translate'
import { PortRange } from './container'
import {
  ConflictedContainerConfigData,
  ConflictedMarker,
  ConflictedPort,
  ConflictedPortRange,
  ConflictedUniqueItem,
} from './container-conflict'

export type UniqueItemErrors = Record<string, string>
export type PortErrors = Record<number, string>

// from-to string keys
export type PortRangeErrors = Record<string, string>

export type LogError = {
  driver?: string
  options?: UniqueItemErrors
}

export type ResourceConfigError = {
  limits?: string
  requests?: string
}

export type MarkerError = {
  service?: UniqueItemErrors
  deployment?: UniqueItemErrors
  ingress?: UniqueItemErrors
}

// config ids where the given property is present
export type ContainerConfigErrors = {
  // common
  name?: string
  environment?: UniqueItemErrors
  routing?: string
  expose?: string
  user?: string
  workingDirectory?: string
  tty?: string
  configContainer?: string
  ports?: PortErrors
  portRanges?: PortRangeErrors
  volumes?: UniqueItemErrors
  initContainers?: string
  capabilities?: UniqueItemErrors
  storage?: string

  // dagent
  logConfig?: string
  restartPolicy?: string
  networkMode?: string
  dockerLabels?: UniqueItemErrors
  expectedState?: string

  // crane
  deploymentStrategy?: string
  proxyHeaders?: string
  useLoadBalancer?: string
  extraLBAnnotations?: UniqueItemErrors
  healthCheckConfig?: string
  resourceConfig?: string
  annotations?: MarkerError
  labels?: MarkerError
  metrics?: string
}

export const portRangeToString = (range: PortRange) => `${range.from}-${range.to}`
export const portRangeFromString = (range: string): PortRange => {
  const [from, to] = range.split('-')
  return {
    from: Number.parseInt(from, 10),
    to: Number.parseInt(to, 10),
  }
}

export const conflictsToError = (
  t: Translate,
  configNames: Record<string, string>,
  conflicts: ConflictedContainerConfigData,
): ContainerConfigErrors | null => {
  if (!conflicts) {
    return null
  }

  const errors: ContainerConfigErrors = {}

  const idsToConfigNames = (ids: string[]): string =>
    ids
      .map(it => configNames[it])
      .filter(it => !!it)
      .join(', ')

  const uniqueItemConflictsToError = (conflict: ConflictedUniqueItem[]): UniqueItemErrors =>
    conflict.reduce((result, it) => {
      result[it.key] = t('container:errors.ambiguousInConfigs', { configs: idsToConfigNames(it.configIds) })
      return result
    }, {})

  const checkStringError = (key: keyof ConflictedContainerConfigData) => {
    if (key in conflicts) {
      const conflict = conflicts[key] as string[]
      errors[key as string] = t('container:errors.ambiguousKeyInConfigs', { key, configs: idsToConfigNames(conflict) })
    }
  }

  const checkUniqueErrors = (key: keyof ConflictedContainerConfigData) => {
    if (key in conflicts) {
      const conflict = conflicts[key] as ConflictedUniqueItem[]
      const itemConflicts = uniqueItemConflictsToError(conflict)

      errors[key as string] = itemConflicts
    }
  }

  const checkPortErrors = (key: keyof ConflictedContainerConfigData) => {
    if (key in conflicts) {
      const conflict = conflicts[key] as ConflictedPort[]
      const portConflicts = conflict.reduce((result, it) => {
        result[it.internal] = t('container:errors.ambiguousInConfigs', { configs: idsToConfigNames(it.configIds) })
        return result
      }, {})
      errors[key as string] = portConflicts
    }
  }

  const checkPortRangeErrors = (key: keyof ConflictedContainerConfigData) => {
    if (key in conflicts) {
      const conflict = conflicts[key] as ConflictedPortRange[]
      const portRangeConflicts = conflict.reduce((result, it) => {
        const rangeKey = portRangeToString(it.range)
        result[rangeKey] = t('container:errors.ambiguousInConfigs', { configs: idsToConfigNames(it.configIds) })
        return result
      }, {})
      errors[key as string] = portRangeConflicts
    }
  }

  const checkMarkerErrors = (key: keyof ConflictedContainerConfigData) => {
    if (key in conflicts) {
      const conflict = conflicts[key] as ConflictedMarker

      const err: MarkerError = {
        service: conflict.deployment ? uniqueItemConflictsToError(conflict.service) : null,
        deployment: conflict.deployment ? uniqueItemConflictsToError(conflict.deployment) : null,
        ingress: conflict.deployment ? uniqueItemConflictsToError(conflict.ingress) : null,
      }

      errors[key as string] = err
    }
  }

  checkStringError('name')
  checkUniqueErrors('environment')

  checkStringError('routing')
  checkStringError('expose')
  checkStringError('user')
  checkStringError('workingDirectory')
  checkStringError('tty')
  checkStringError('configContainer')
  checkPortErrors('ports')
  checkPortRangeErrors('portRanges')
  checkUniqueErrors('volumes')
  checkStringError('initContainers')
  checkStringError('capabilities')
  checkStringError('storage')

  // dagent
  checkStringError('logConfig')
  checkStringError('restartPolicy')
  checkStringError('networkMode')
  checkUniqueErrors('dockerLabels')
  checkStringError('expectedState')

  // crane
  checkStringError('deploymentStrategy')
  checkStringError('proxyHeaders')
  checkStringError('useLoadBalancer')
  checkUniqueErrors('extraLBAnnotations')
  checkStringError('healthCheckConfig')
  checkStringError('resourceConfig')
  checkMarkerErrors('annotations')
  checkMarkerErrors('labels')
  checkStringError('metrics')

  if (Object.keys(errors).length < 1) {
    return null
  }

  return errors
}
