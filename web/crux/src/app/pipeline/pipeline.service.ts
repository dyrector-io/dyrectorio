import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Identity } from '@ory/kratos-client'
import { Subject } from 'rxjs'
import {
  AZURE_DEV_OPS_STATE_CHANGED_EVENT_TYPE_VALUES,
  AzureDevOpsCredentials,
  AzureDevOpsHook,
  AzureHook,
  AzureRepository,
  AzureTrigger,
  PipelineRunStatusEvent,
} from 'src/domain/pipeline'
import { PipelineTokenPayload } from 'src/domain/pipeline-token'
import { generateNonce } from 'src/domain/utils'
import { CruxBadRequestException } from 'src/exception/crux-exception'
import AzureDevOpsService from 'src/services/azure-devops.service'
import PrismaService from 'src/services/prisma.service'
import TeamRepository from '../team/team.repository'
import {
  AzurePipelineStateDto,
  CreatePipelineDto,
  PipelineDetailsDto,
  PipelineDto,
  PipelineRunDto,
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
    private readonly jwtService: JwtService,
  ) {}

  async checkRegistryIsInTeam(teamId: string, registryId: string): Promise<boolean> {
    const registries = await this.prisma.registry.count({
      where: {
        id: registryId,
        team: {
          id: teamId,
        },
      },
    })

    return registries > 0
  }

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

    return pipelines.map(it => this.mapper.toDto(it))
  }

  async getPipelineDetails(id: string): Promise<PipelineDetailsDto> {
    const pipeline = await this.prisma.pipeline.findUniqueOrThrow({
      include: {
        runs: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
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
          token: req.token,
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
      runs: [],
    })
  }

  async updatePipeline(id: string, req: UpdatePipelineDto, identity: Identity): Promise<void> {
    const oldPipeline = await this.prisma.pipeline.findUnique({
      where: {
        id,
      },
    })

    const token = req.token ?? oldPipeline.token
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
        token: req.token ?? undefined,
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
      const creds: AzureDevOpsCredentials = {
        repo: deleted.repository as AzureRepository,
        token: deleted.token,
      }

      const hooks = deleted.hooks as AzureDevOpsHook[]
      const deletes = hooks.map(it => this.azureService.deleteHook(creds, it))
      await Promise.all(deletes)
    } catch (err) {
      this.logger.error('Failed to delete hook.', err)
    }
  }

  async trigger(id: string, req: TriggerPipelineDto, identity: Identity): Promise<PipelineRunDto> {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: {
        id,
      },
    })

    const creds: AzureDevOpsCredentials = {
      repo: pipeline.repository as AzureRepository,
      token: pipeline.token,
    }

    const trigger = pipeline.trigger as AzureTrigger
    if (req.inputs) {
      trigger.inputs = req.inputs
    }

    const azRun = await this.azureService.trigger(creds, trigger.name, trigger.inputs)

    const run = await this.prisma.pipelineRun.create({
      data: {
        createdBy: identity.id,
        status: 'queued',
        pipelineId: id,
        externalId: azRun.id,
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

    this.runStatusEvent.next(this.mapper.runToRunStatusEvent(run))

    this.logger.verbose(`Pipeline triggered: ${pipeline.id}`)
    return this.mapper.runToDto(run)
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

    this.runStatusEvent.next(this.mapper.runToRunStatusEvent(run))
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
