import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import {
  Pipeline,
  PipelineEventWatcher,
  PipelineRun,
  PipelineStatusEnum,
  PipelineTriggerEventEnum,
  Prisma,
  Registry,
} from '@prisma/client'
import { JsonValue } from '@prisma/client/runtime/library'
import { nameOfIdentity } from 'src/domain/identity'
import {
  AzureDevOpsCredentials,
  AzureDevOpsRunResult,
  AzureDevOpsRunState,
  AzureRepository,
  AzureTrigger,
  PipelineEventWatcherTrigger,
  PipelineRunStatusEvent,
  PipelineRunWithPipline,
} from 'src/domain/pipeline'
import { CruxInternalServerErrorException } from 'src/exception/crux-exception'
import EncryptionService from 'src/services/encryption.service'
import { BasicProperties } from 'src/shared/dtos/shared.dto'
import AuditMapper from '../audit/audit.mapper'
import {
  AzureDevOpsRepositoryDto,
  BasicPipelineDto,
  CreatePipelineDto,
  CreatePipelineEventWatcherDto,
  PipelineDetailsDto,
  PipelineDto,
  PipelineEventWatcherDto,
  PipelineRunDto,
  PipelineTriggerEventDto,
  UpdatePipelineDto,
  UpdatePipelineEventWatcherDto,
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

  toDto(it: PipelineWithRuns, identites: Map<string, Identity>): PipelineDto {
    const trigger = it.trigger as AzureTrigger

    return {
      ...this.toBasicDto(it),
      trigger: trigger.name,
      description: it.description,
      icon: it.icon,
      repository: it.repository as any as AzureDevOpsRepositoryDto,
      lastRun: this.toPipelineRunDto(it.runs.find(Boolean), identites),
    }
  }

  toDetailsDto(pipeline: PipelineWithEventWatchers): PipelineDetailsDto {
    const repo = pipeline.repository as AzureRepository

    return {
      ...this.toBasicDto(pipeline),
      description: pipeline.description,
      icon: pipeline.icon,
      repository: {
        organization: repo.organization,
        project: repo.project,
        branch: repo.branch,
      },
      audit: this.auditMapper.toDto(pipeline),
      trigger: pipeline.trigger as AzureTrigger,
      eventWatchers: pipeline.eventWatchers.map(it => this.eventWatcherToDto(it)),
    }
  }

  toPipelineRunDto(it: PipelineRun, identitites: Map<string, Identity>): PipelineRunDto {
    if (!it) {
      return null
    }

    return {
      id: it.id,
      startedAt: it.createdAt,
      startedBy:
        it.creatorType !== 'user'
          ? null
          : {
              id: it.createdBy,
              name: nameOfIdentity(identitites.get(it.createdBy)),
            },
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

  eventWatcherToDb(
    it: CreatePipelineEventWatcherDto | UpdatePipelineEventWatcherDto,
  ): Omit<
    Extract<Prisma.PipelineEventWatcherUncheckedCreateInput, Prisma.PipelineEventWatcherUncheckedUpdateInput>,
    'id' | 'pipelineId' | 'createdBy'
  > {
    const trigger: PipelineEventWatcherTrigger = {
      filters: {
        imageNameStartsWith: it.filters.imageNameStartsWith,
      },
      inputs: it.triggerInputs,
    }

    return {
      name: it.name,
      event: this.triggerEventToDb(it.event),
      registryId: it.registryId,
      trigger: trigger as JsonValue,
    }
  }

  eventWatcherToDto(it: EventWatcherWithRegistry): PipelineEventWatcherDto {
    const trigger = it.trigger as PipelineEventWatcherTrigger

    return {
      id: it.id,
      name: it.name,
      event: this.triggerEventToDto(it.event),
      filters: trigger.filters,
      triggerInputs: trigger.inputs,
      createdAt: it.createdAt,
      registry: it.registry,
    }
  }

  runToRunStatusEvent(it: PipelineRunWithPipline, identity: Identity | null): PipelineRunStatusEvent {
    return {
      teamId: it.pipeline.teamId,
      pipelineId: it.pipeline.id,
      runId: it.id,
      status: it.status,
      startedBy: identity,
      finishedAt: it.finishedAt,
    }
  }

  toAzureDevOpsCredentials(it: PipelineCredentials): AzureDevOpsCredentials {
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
      branch: it.branch && it.branch.length > 0 ? it.branch : null,
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

  triggerEventToDb(dto: PipelineTriggerEventDto): PipelineTriggerEventEnum {
    switch (dto) {
      case 'image-pull':
        return 'imagePull'
      case 'image-push':
        return 'imagePush'
      default:
        throw new CruxInternalServerErrorException({
          message: 'Invalid trigger event dto',
          value: dto,
        })
    }
  }

  triggerEventToDto(event: PipelineTriggerEventEnum): PipelineTriggerEventDto {
    switch (event) {
      case 'imagePull':
        return 'image-pull'
      case 'imagePush':
        return 'image-push'
      default:
        throw new CruxInternalServerErrorException({
          message: 'Invalid PipelineTriggerEventEnum',
          value: event,
        })
    }
  }
}

type PipelineCredentials = Pick<Pipeline, 'type' | 'repository' | 'token'>

type EventWatcherWithRegistry = PipelineEventWatcher & {
  registry: Pick<Registry, BasicProperties>
}

type PipelineWithEventWatchers = Pipeline & {
  eventWatchers: EventWatcherWithRegistry[]
}

type PipelineWithRuns = Pipeline & {
  runs: PipelineRun[]
}
