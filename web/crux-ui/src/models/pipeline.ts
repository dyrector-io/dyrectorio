import { Audit } from './audit'
import { UniqueKeyValue } from './container'
import { BasicRegistry } from './registry'
import { BasicUser } from './user'

export const PIPELINE_TYPE_VALUES = ['gitlab', 'github', 'azure'] as const
export type PipelineType = (typeof PIPELINE_TYPE_VALUES)[number]

export type PipelineRunStatus = 'unknown' | 'queued' | 'running' | 'successful' | 'failed'

export type AzureRepository = {
  organization: string
  project: string
  branch?: string
}

export type PipelineRepository = AzureRepository

export type PipelineTrigger = {
  name: string
  inputs: UniqueKeyValue[]
}

export type PipelineRun = {
  id: string
  startedAt: string
  startedBy: BasicUser
  finishedAt: string
  status: PipelineRunStatus
}

export const PIPELINE_TRIGGER_EVENT_VALUES = ['image-push', 'image-pull'] as const
export type PipelineTriggerEvent = (typeof PIPELINE_TRIGGER_EVENT_VALUES)[number]

export type PipelineEventWatcherFilters = {
  imageNameStartsWith: string
}

export type PipelineEventWatcher = {
  id: string
  name: string
  event: PipelineTriggerEvent
  filters: PipelineEventWatcherFilters
  registry: BasicRegistry
  createdAt: string
  triggerInputs: UniqueKeyValue[]
}

export type CreatePipelineEventWatcher = Omit<PipelineEventWatcher, 'id' | 'createdAt' | 'registry'> & {
  registryId: string
}
export type UpdatePipelineEventWatcher = CreatePipelineEventWatcher

export type Pipeline = {
  id: string
  name: string
  description: string
  icon?: string
  type: PipelineType
  lastRun?: PipelineRun
  repository: AzureRepository
  trigger: string
}

export type PipelineDetails = Omit<Pipeline, 'lastRun' | 'trigger'> & {
  audit: Audit
  trigger: PipelineTrigger
  eventWatchers: PipelineEventWatcher[]
}

export type UpdatePipeline = Omit<PipelineDetails, 'id' | 'lastRun'> & {
  token?: string
}

export type CreatePipeline = UpdatePipeline & {
  token: string
}

export type TriggerPipeline = {
  inputs?: UniqueKeyValue[]
}

export const WS_TYPE_PIPELINE_STATUS = 'pipeline-status'
export type PipelineStatusMessage = {
  pipelineId: string
  runId: string
  status: PipelineRunStatus
  startedBy?: BasicUser
  finishedAt?: string
}

export const pipelineDetailsToPipeline = (it: PipelineDetails): Pipeline => ({
  ...it,
  trigger: it.trigger.name,
  lastRun: null,
})

export const repositoryNameOf = (pipeline: Pipeline | PipelineDetails): string => {
  switch (pipeline.type) {
    case 'azure': {
      const repo = pipeline.repository
      return `${repo.organization}/${repo.project}`
    }
    default:
      return ''
  }
}
