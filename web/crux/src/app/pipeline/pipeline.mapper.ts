import { Injectable } from '@nestjs/common'
import { Pipeline, PipelineRun, PipelineStatusEnum, Prisma } from '@prisma/client'
import { JsonValue } from '@prisma/client/runtime/library'
import {
  AzureDevOpsCredentials,
  AzureDevOpsRunResult,
  AzureDevOpsRunState,
  AzureRepository,
  AzureTrigger,
  PipelineRunStatusEvent,
} from 'src/domain/pipeline'
import { CruxInternalServerErrorException } from 'src/exception/crux-exception'
import EncryptionService from 'src/services/encryption.service'
import { BasicProperties } from 'src/shared/dtos/shared.dto'
import AuditMapper from '../audit/audit.mapper'
import {
  AzureDevOpsRepositoryDto,
  BasicPipelineDto,
  CreatePipelineDto,
  PipelineDetailsDto,
  PipelineDto,
  PipelineRunDto,
  UpdatePipelineDto,
} from './pipeline.dto'

@Injectable()
export default class PipelineMapper {
  constructor(
    private readonly auditMapper: AuditMapper,
    private readonly encryptionService: EncryptionService,
  ) {}

  toBasicDto(it: Pick<Pipeline, BasicProperties>): BasicPipelineDto {
    return {
      id: it.id,
      name: it.name,
      type: it.type,
    }
  }

  toDto(it: PipelineWithRuns): PipelineDto {
    const trigger = it.trigger as AzureTrigger

    return {
      ...this.toBasicDto(it),
      trigger: trigger.name,
      description: it.description,
      icon: it.icon,
      repository: it.repository as any as AzureDevOpsRepositoryDto,
      lastRun: this.runToDto(it.runs.find(Boolean)),
    }
  }

  toDetailsDto(pipeline: PipelineWithRuns): PipelineDetailsDto {
    const repo = pipeline.repository as AzureRepository

    return {
      ...this.toBasicDto(pipeline),
      description: pipeline.description,
      icon: pipeline.icon,
      repository: {
        organization: repo.organization,
        project: repo.project,
      },
      audit: this.auditMapper.toDto(pipeline),
      trigger: pipeline.trigger as AzureTrigger,
      runs: pipeline.runs.map(it => this.runToDto(it)),
    }
  }

  runToDto(it: PipelineRun): PipelineRunDto {
    if (!it) {
      return null
    }

    return {
      id: it.id,
      startedAt: it.createdAt,
      startedBy: it.createdBy,
      status: it.status,
      finishedAt: it.finishedAt,
    }
  }

  detailsToDb(
    req: CreatePipelineDto | UpdatePipelineDto,
    projectId: string,
  ): Omit<
    Extract<Prisma.PipelineUncheckedCreateInput, Prisma.PipelineUncheckedUpdateInput>,
    'token' | 'teamId' | 'createdBy' | 'hooks'
  > {
    return {
      name: req.name,
      type: 'azure',
      description: req.description,
      icon: req.icon,
      repository: this.azureRepositoryToDb(req.repository, projectId),
      trigger: req.trigger as any as JsonValue,
    }
  }

  runToRunStatusEvent(it: PipelineRunWithPipline): PipelineRunStatusEvent {
    return {
      teamId: it.pipeline.teamId,
      pipelineId: it.pipeline.id,
      runId: it.id,
      status: it.status,
      finishedAt: it.finishedAt,
    }
  }

  toAzureCredentials(it: PipelineCredentials): AzureDevOpsCredentials {
    if (it.type !== 'azure') {
      throw new CruxInternalServerErrorException({
        message: `Invalid pipeline type. Cannot map a ${it.type} pipeline to AzureDevOpsCredentials`,
      })
    }

    return {
      repo: it.repository as AzureRepository,
      token: this.encryptionService.decrypt(it.token),
    }
  }

  azureRepositoryToDb(it: AzureDevOpsRepositoryDto, projectId: string): AzureRepository {
    return {
      organization: it.organization,
      project: it.project,
      projectId,
    }
  }

  azureRunStateToPipelineStatus(state: AzureDevOpsRunState, result?: AzureDevOpsRunResult): PipelineStatusEnum {
    switch (state) {
      case 'canceling':
        return 'failed'
      case 'inProgress':
        return 'running'
      case 'completed':
        return result === 'succeeded' ? 'successful' : 'failed'
      default:
        return 'unknown'
    }
  }
}

type PipelineCredentials = Pick<Pipeline, 'type' | 'repository' | 'token'>

type PipelineWithRuns = Pipeline & {
  runs: PipelineRun[]
}

type PipelineRunWithPipline = PipelineRun & {
  pipeline: {
    id: string
    teamId: string
  }
}
