import { Audit } from './audit'
import { UniqueKeyValue } from './container'

export const PIPELINE_TYPE_VALUES = ['gitlab', 'github', 'azure'] as const

export type PipelineType = (typeof PIPELINE_TYPE_VALUES)[number]

export type PipelineRunStatus = 'unknown' | 'queued' | 'running' | 'successful' | 'failed'

export type AzureRepository = {
  organization: string
  project: string
}

export type PipelineRepository = AzureRepository

export type PipelineTrigger = {
  name: string
  inputs: UniqueKeyValue[]
}

export type PipelineRun = {
  id: string
  startedAt: string
  finishedAt: string
  status: PipelineRunStatus
}

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
  runs: PipelineRun[]
}

export type UpdatePipeline = Omit<PipelineDetails, 'id' | 'lastRun'> & {
  token?: string
}

export type CreatePipeline = UpdatePipeline & {
  token: string
}

export type TriggerPipeline = {
  inputs?: Record<string, string>
}

export const WS_TYPE_PIPELINE_STATUS = 'pipeline-status'
export type PipelineStatusMessage = {
  pipelineId: string
  runId: string
  status: PipelineRunStatus
  finishedAt?: string
}

export const pipelineDetailsToPipeline = (it: PipelineDetails): Pipeline => ({
  ...it,
  trigger: it.trigger.name,
  lastRun: it.runs.find(Boolean) ?? null,
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
