import { Audit } from './audit'
import { UniqueKeyValue } from './container'

export const PIPELINE_TYPE_VALUES = ['gitlab', 'github', 'azure'] as const

export type PipelineType = (typeof PIPELINE_TYPE_VALUES)[number]

export type PipelineStatus = 'ready' | 'running' | 'successful' | 'failed'

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
  startedAt: string
  finishedAt: string
  status: PipelineStatus
}

export type Pipeline = {
  id: string
  name: string
  description: string
  icon?: string
  type: PipelineType
  status: PipelineStatus
  repository: AzureRepository
  trigger: PipelineTrigger
}

export type PipelineDetails = Pipeline & {
  audit: Audit
  inputs: UniqueKeyValue[]
  lastRun?: PipelineRun
}

export type UpdatePipeline = Omit<Pipeline, 'id' | 'status'> & {
  token?: string
}

export type CreatePipeline = UpdatePipeline & {
  token: string
}

export type TriggerPipeline = {
  inputs?: Record<string, string>
}

export const repositoryNameOf = (pipeline: Pipeline): string => {
  switch (pipeline.type) {
    case 'azure': {
      const repo = pipeline.repository
      return `${repo.organization}/${repo.project}`
    }
    default:
      return ''
  }
}
