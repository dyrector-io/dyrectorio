import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { JwtService } from '@nestjs/jwt'
import { Identity } from '@ory/kratos-client'
import { PipelineTriggerEventEnum } from '@prisma/client'
import { Subject } from 'rxjs'
import {
  AZURE_DEV_OPS_STATE_CHANGED_EVENT_TYPE_VALUES,
  AzureDevOpsCredentials,
  AzureDevOpsHook,
  AzureHook,
  AzureRepository,
  AzureTrigger,
  PipelineCreateRunOptions,
  PipelineEventWatcherTrigger,
  PipelineRunStatusEvent,
  PipelineRunWithPipline,
  applyPipelineInputTemplate,
  mergeEventWatcherInputs,
  registryV2EventToTemplates,
} from 'src/domain/pipeline'
import { PipelineTokenPayload } from 'src/domain/pipeline-token'
import { REGISTRY_EVENT_V2_PULL, REGISTRY_EVENT_V2_PUSH, RegistryV2Event } from 'src/domain/registry'
import { generateNonce } from 'src/domain/utils'
import { CruxBadRequestException } from 'src/exception/crux-exception'
import AzureDevOpsService from 'src/services/azure-devops.service'
import EncryptionService from 'src/services/encryption.service'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import { PaginatedList } from 'src/shared/dtos/paginating'
import TeamRepository from '../team/team.repository'
import {
  AzurePipelineStateDto,
  CreatePipelineDto,
  CreatePipelineEventWatcherDto,
  PipelineDetailsDto,
  PipelineDto,
  PipelineEventWatcherDto,
  PipelineRunDto,
  PipelineRunQueryDto,
  TriggerPipelineDto,
  UpdatePipelineDto,
} from './pipeline.dto'
import PipelineMapper from './pipeline.mapper'

@Injectable()
export default class PipelineService {
  private readonly logger = new Logger(PipelineService.name)

  readonly runStatusEvent = new Subject<PipelineRunStatusEvent>()

  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly prisma: PrismaService,
    private readonly mapper: PipelineMapper,
    private readonly azureService: AzureDevOpsService,
    private readonly kratosService: KratosService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async getPipelines(teamSlug: string): Promise<PipelineDto[]> {
    const pipelines = await this.prisma.pipeline.findMany({
      where: {
        team: {
          slug: teamSlug,
        },
      },
      include: {
        runs: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    })

    const identities = await this.kratosService.getIdentitiesByIds(
      new Set(pipelines.flatMap(it => it.runs).map(it => it.createdBy)),
    )

    return pipelines.map(it => this.mapper.toDto(it, identities))
  }

  async getPipelineDetails(id: string): Promise<PipelineDetailsDto> {
    const pipeline = await this.prisma.pipeline.findUniqueOrThrow({
      include: {
        eventWatchers: {
          include: {
            registry: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
      where: {
        id,
      },
    })

    return this.mapper.toDetailsDto(pipeline)
  }

  async createPipeline(teamSlug: string, req: CreatePipelineDto, identity: Identity): Promise<PipelineDetailsDto> {
    const teamId = await this.teamRepository.getTeamIdBySlug(teamSlug)

    const creds: AzureDevOpsCredentials = {
      repo: this.mapper.azureRepositoryToDb(req.repository, null),
      token: req.token,
    }

    const project = await this.azureService.getProject(creds)
    creds.repo.projectId = project.id

    const createdPipeline = await this.prisma.$transaction(async prisma => {
      let pipeline = await prisma.pipeline.create({
        data: {
          ...this.mapper.detailsToDb(req, project.id),
          createdBy: identity.id,
          teamId,
          token: this.encryptionService.encrypt(req.token),
          hooks: [],
        },
      })

      const hook = await this.createAzureHook(creds, pipeline.id, req.trigger)

      pipeline = await prisma.pipeline.update({
        where: {
          id: pipeline.id,
        },
        data: {
          hooks: [hook],
        },
      })

      return pipeline
    })

    return this.mapper.toDetailsDto({
      ...createdPipeline,
      eventWatchers: [],
    })
  }

  async updatePipeline(id: string, req: UpdatePipelineDto, identity: Identity): Promise<void> {
    const oldPipeline = await this.prisma.pipeline.findUnique({
      where: {
        id,
      },
    })

    const token = req.token ?? this.encryptionService.decrypt(oldPipeline.token)
    const repo = oldPipeline.repository as AzureRepository
    const trigger = oldPipeline.trigger as AzureTrigger
    let hooks = oldPipeline.hooks as AzureHook[]

    let newProjectId: string = null
    if (repo.organization !== req.repository.organization || repo.project !== req.repository.project) {
      const creds: AzureDevOpsCredentials = {
        repo: {
          ...req.repository,
          projectId: null,
        },
        token,
      }

      const project = await this.azureService.getProject(creds)
      newProjectId = project.id
    }

    const needsHookUpdate = !!newProjectId || trigger.name !== req.trigger.name
    if (needsHookUpdate) {
      const creds: AzureDevOpsCredentials = {
        repo,
        token,
      }

      const deletes = hooks.map(it => this.azureService.deleteHook(creds, it))
      await Promise.all(deletes)

      if (newProjectId) {
        creds.repo = {
          ...req.repository,
          projectId: newProjectId,
        }
      }

      const hook = await this.createAzureHook(creds, id, trigger)
      hooks = [hook]
    }

    await this.prisma.pipeline.update({
      where: {
        id,
      },
      data: {
        ...this.mapper.detailsToDb(req, repo.projectId),
        hooks,
        token: !req.token ? undefined : this.encryptionService.encrypt(req.token),
        updatedAt: new Date(),
        updatedBy: identity.id,
      },
    })
  }

  async deletePipeline(id: string): Promise<void> {
    const deleted = await this.prisma.pipeline.delete({
      where: {
        id,
      },
      select: {
        type: true,
        hooks: true,
        repository: true,
        token: true,
      },
    })

    try {
      const creds = this.mapper.toAzureDevOpsCredentials(deleted)

      const hooks = deleted.hooks as AzureDevOpsHook[]
      const deletes = hooks.map(it => this.azureService.deleteHook(creds, it))
      await Promise.all(deletes)
    } catch (err) {
      this.logger.error('Failed to delete hook.', err)
    }
  }

  async getRuns(pipelineId: string, query: PipelineRunQueryDto): Promise<PaginatedList<PipelineRunDto>> {
    const where = {
      pipelineId,
    }

    const [runs, total] = await this.prisma.$transaction([
      this.prisma.pipelineRun.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.pipelineRun.count({ where }),
    ])

    const identitiyIds = new Set(runs.filter(it => it.creatorType === 'user').map(it => it.createdBy))

    const identities = await this.kratosService.getIdentitiesByIds(identitiyIds)

    return {
      items: runs.map(it => this.mapper.toPipelineRunDto(it, identities)),
      total,
    }
  }

  async trigger(id: string, req: TriggerPipelineDto, identity: Identity): Promise<PipelineRunDto> {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: {
        id,
      },
    })

    const run = await this.createRun({
      pipeline,
      inputs: req.inputs,
      creatorType: 'user',
      creator: identity,
    })

    return this.mapper.toPipelineRunDto(run, new Map(Object.entries({ [identity.id]: identity })))
  }

  async createEventWatcher(
    pipelineId: string,
    req: CreatePipelineEventWatcherDto,
    identity: Identity,
  ): Promise<PipelineEventWatcherDto> {
    const watcher = await this.prisma.pipelineEventWatcher.create({
      data: {
        ...this.mapper.eventWatcherToDb(req),
        pipelineId,
        createdBy: identity.id,
      },
      include: {
        registry: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    })

    return this.mapper.eventWatcherToDto(watcher)
  }

  async updateEventWatcher(id: string, req: CreatePipelineEventWatcherDto, identity: Identity): Promise<void> {
    await this.prisma.pipelineEventWatcher.update({
      where: {
        id,
      },
      data: {
        ...this.mapper.eventWatcherToDb(req),
        updatedAt: new Date(),
        updatedBy: identity.id,
      },
    })
  }

  async deleteEventWatcher(id: string): Promise<void> {
    await this.prisma.pipelineEventWatcher.delete({
      where: {
        id,
      },
    })
  }

  async onAzurePipelineStateChanged(pipelineId: string, req: AzurePipelineStateDto): Promise<void> {
    if (req.eventType !== AZURE_DEV_OPS_STATE_CHANGED_EVENT_TYPE_VALUES[0]) {
      throw new CruxBadRequestException({
        message: 'Invalid event type',
        property: 'eventType',
        value: req.eventType,
      })
    }

    const azRun = req.resource.run
    const run = await this.prisma.pipelineRun.update({
      where: {
        pipelineId_externalId: {
          externalId: azRun.id,
          pipelineId,
        },
      },
      data: {
        finishedAt: azRun.finishedDate,
        status: this.mapper.azureRunStateToPipelineStatus(azRun.state, azRun.result),
      },
      include: {
        pipeline: {
          select: {
            id: true,
            teamId: true,
          },
        },
      },
    })

    const startedBy = run.creatorType === 'user' ? await this.kratosService.getIdentityById(run.createdBy) : null

    this.runStatusEvent.next(this.mapper.runToRunStatusEvent(run, startedBy))
  }

  @OnEvent(REGISTRY_EVENT_V2_PUSH, { async: true })
  async onRegistryV2Push(event: RegistryV2Event): Promise<void> {
    await this.triggerPipelineForEvent('imagePush', event)
  }

  @OnEvent(REGISTRY_EVENT_V2_PULL, { async: true })
  async onRegistryV2Pull(event: RegistryV2Event): Promise<void> {
    await this.triggerPipelineForEvent('imagePull', event)
  }

  private async triggerPipelineForEvent(triggerEvent: PipelineTriggerEventEnum, event: RegistryV2Event): Promise<void> {
    const watchers = await this.prisma.pipelineEventWatcher.findMany({
      where: {
        event: triggerEvent,
        registryId: event.registry.id,
      },
      include: {
        pipeline: true,
      },
    })

    const templates = registryV2EventToTemplates(event)

    await Promise.all(
      watchers
        .filter(it => {
          const eventWatcherTrigger = it.trigger as PipelineEventWatcherTrigger
          return event.imageName.startsWith(eventWatcherTrigger.filters.imageNameStartsWith)
        })
        .map(async eventWatcher => {
          const trigger = eventWatcher.pipeline.trigger as AzureTrigger
          const eventWatcherTrigger = eventWatcher.trigger as PipelineEventWatcherTrigger

          const inputs = mergeEventWatcherInputs(trigger.inputs, eventWatcherTrigger.inputs)

          applyPipelineInputTemplate(inputs, templates)

          await this.createRun({
            creatorType: 'eventWatcher',
            creator: eventWatcher,
            pipeline: eventWatcher.pipeline,
            inputs,
          })
        }),
    )
  }

  private async createRun(options: PipelineCreateRunOptions): Promise<PipelineRunWithPipline> {
    const { pipeline, inputs, creatorType, creator } = options

    const creds = this.mapper.toAzureDevOpsCredentials(pipeline)

    const trigger = pipeline.trigger as AzureTrigger
    if (inputs) {
      trigger.inputs = inputs
    }

    const azRun = await this.azureService.trigger(creds, trigger.name, trigger.inputs)

    const run = await this.prisma.pipelineRun.create({
      data: {
        createdBy: creator.id,
        status: 'queued',
        pipelineId: pipeline.id,
        externalId: azRun.id,
        creatorType,
      },
      include: {
        pipeline: {
          select: {
            id: true,
            teamId: true,
          },
        },
      },
    })

    this.runStatusEvent.next(this.mapper.runToRunStatusEvent(run, creatorType === 'user' ? creator : null))

    this.logger.verbose(`Pipeline triggered: ${pipeline.id}`)
    return run
  }

  private async createAzureHook(
    creds: AzureDevOpsCredentials,
    pipelineId: string,
    trigger: AzureTrigger,
  ): Promise<AzureHook> {
    const token: PipelineTokenPayload = {
      sub: pipelineId,
      nonce: generateNonce(),
    }

    const signedToken = this.jwtService.sign(token)

    const azHook = await this.azureService.createHook(creds, pipelineId, trigger.name, signedToken)

    return {
      ...azHook,
      nonce: token.nonce,
    }
  }
}
