import { BasicUserDto } from '../team/user.dto'
import { PipelineRunStatusDto } from './pipeline.dto'

export const WS_TYPE_PIPELINE_STATUS = 'pipeline-status'
export type PipelineStatusMessage = {
  pipelineId: string
  runId: string
  status: PipelineRunStatusDto
  startedBy?: BasicUserDto
  finishedAt?: string
}
