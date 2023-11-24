import { PipelineStatusEnum } from '@prisma/client'
import { UniqueKeyValue } from './container'

export type PipelineRunStatusEvent = {
  teamId: string
  pipelineId: string
  runId: string
  status: PipelineStatusEnum
  finishedAt?: Date
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
