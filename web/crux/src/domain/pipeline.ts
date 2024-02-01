import { Identity } from '@ory/kratos-client'
import {
  Pipeline,
  PipelineEventWatcher,
  PipelineRun,
  PipelineRunCreatorTypeEnum,
  PipelineStatusEnum,
} from '@prisma/client'
import { UniqueKeyValue } from './container'
import { RegistryV2Event } from './registry'

export type PipelineRunStatusEvent = {
  teamId: string
  pipelineId: string
  runId: string
  status: PipelineStatusEnum
  startedBy?: Identity
  finishedAt?: Date
}

export type PipelineHookOptions = {
  teamSlug: string
  pipelineId: string
}

export type AzureRepository = {
  organization: string
  project: string
  projectId: string
}

export type AzureTrigger = {
  name: string
  inputs: UniqueKeyValue[]
}

export type AzureHook = AzureDevOpsHook & {
  nonce: string
}

// azure devops api

export const AZURE_DEV_OPS_STATE_CHANGED_EVENT_TYPE_VALUES = ['ms.vss-pipelines.run-state-changed-event'] as const
export type AzureDevOpsStateChangedEventType = (typeof AZURE_DEV_OPS_STATE_CHANGED_EVENT_TYPE_VALUES)[number]

export type AzureDevOpsHook = {
  id: string
  eventType: AzureDevOpsStateChangedEventType
}

export type AzureDevOpsCredentials = {
  repo: AzureRepository
  token: string
}

export type AzureDevOpsVariable = {
  isSecret: boolean
  value: string
}

export type AzureDevOpsPipeline = {
  id: number
  name: string
}

export type AzureDevOpsListResponse<T> = {
  count: number
  value: T[]
}

export const AZURE_DEV_OPS_RUN_STATE_VALUES = ['canceling', 'completed', 'inProgress', 'unknown'] as const
export type AzureDevOpsRunState = (typeof AZURE_DEV_OPS_RUN_STATE_VALUES)[number]

export const AZURE_DEV_OPS_RUN_RESULT_VALUES = ['canceled', 'failed', 'succeeded', 'unknown'] as const
export type AzureDevOpsRunResult = (typeof AZURE_DEV_OPS_RUN_RESULT_VALUES)[number]

export type AzureDevOpsProject = {
  id: string
  name: string
}

export type AzureDevOpsRun = {
  id: number
  state: AzureDevOpsRunState
  result: AzureDevOpsRunResult
  createdDate: string // iso date
}

export type AzureDevOpsSubscription = {
  id: string
}

export type PipelineEventWatcherRegistryEventFilters = {
  imageNameStartsWith: string
}

export type PipelineEventWatcherTrigger = {
  filters: PipelineEventWatcherRegistryEventFilters
  inputs: UniqueKeyValue[]
}

export type PipelineRunWithPipline = PipelineRun & {
  pipeline: {
    id: string
    teamId: string
  }
}

export type PipelineCreateRunOptions = {
  pipeline: Pipeline
  inputs: UniqueKeyValue[]
  creatorType: PipelineRunCreatorTypeEnum
} & (
  | {
      creatorType: 'user'
      creator: Identity
    }
  | {
      creatorType: 'eventWatcher'
      creator: PipelineEventWatcher
    }
)

const applyTemplate = (template: string, value: string, candidate: string): string =>
  candidate.replace(new RegExp(`{{\\s*${template}\\s*}}`), value)

const applyTemplatesOnInput = (input: UniqueKeyValue, templates: Record<string, string>) => {
  Object.entries(templates).forEach(entry => {
    const [template, value] = entry

    input.value = applyTemplate(template, value, input.key)
  })
}

/**
 * @param inputs
 * @param templates JSON object of replacable property names with the actual values. Example: { 'imageName': 'alpine', 'imageTag': 'latest', 'label:debug': 'true' }
 */
export const applyPipelineInputTemplate = (inputs: UniqueKeyValue[], templates: Record<string, string>) => {
  inputs.forEach(it => applyTemplatesOnInput(it, templates))
}

export const mergeEventWatcherInputs = (
  pipelineInputs: UniqueKeyValue[],
  eventWatcherInputs: UniqueKeyValue[],
): UniqueKeyValue[] => {
  const inputs = [...pipelineInputs]
  eventWatcherInputs.forEach(watcherInput => {
    const index = inputs.findIndex(it => watcherInput.id === it.id || watcherInput.key === it.key)
    if (index > -1) {
      inputs[index] = watcherInput
    } else {
      inputs.push(watcherInput)
    }
  })

  return inputs
}

export const registryV2EventToTemplates = (event: RegistryV2Event): Record<string, string> => {
  const { imageName, imageTag } = event
  const labels = Object.entries(event.labels).map(entry => {
    const [key, value] = entry
    return [`label:${key}`, value]
  })

  const labelTemplates = Object.fromEntries(labels)

  return {
    ...labelTemplates,
    imageName,
    imageTag,
  }
}
