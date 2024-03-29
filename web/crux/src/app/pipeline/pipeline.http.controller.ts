import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import { CreatedResponse, CreatedWithLocation } from 'src/interceptors/created-with-location.decorator'
import { PaginatedList } from 'src/shared/dtos/paginating'
import { AuthStrategy, IdentityFromRequest } from '../token/jwt-auth.guard'
import PipelineAccessValidationGuard from './guards/pipeline.auth.validation.guard'
import PipelineJwtAuthGuard from './guards/pipeline.jwt-auth.guard'
import PipelineTeamAccessGuard from './guards/pipeline.team-access.guard'
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
  UpdatePipelineEventWatcherDto,
} from './pipeline.dto'
import PipelineService from './pipeline.service'

const PARAM_TEAM_SLUG = 'teamSlug'
const PARAM_PIPELINE_ID = 'pipelineId'
const PARAM_EVENT_WATCHER_ID = 'eventWatcherId'
const TeamSlug = () => Param(PARAM_TEAM_SLUG)
const PipelineId = () => Param(PARAM_PIPELINE_ID)
const EventWatcherId = () => Param(PARAM_EVENT_WATCHER_ID)

const ROUTE_TEAM_SLUG = ':teamSlug'
const ROUTE_PIPELINES = 'pipelines'
const ROUTE_PIPELINE_ID = ':pipelineId'
const ROUTE_RUNS = 'runs'
const ROUTE_EVENT_WATCHERS = 'event-watchers'
const ROUTE_EVENT_WATCHER_ID = ':eventWatcherId'

@Controller(`${ROUTE_TEAM_SLUG}/${ROUTE_PIPELINES}`)
@ApiTags(ROUTE_PIPELINES)
@UseGuards(PipelineJwtAuthGuard, PipelineTeamAccessGuard)
export default class PipelineHttpController {
  constructor(private service: PipelineService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'Response should include `id`, `name`, `type`, `description`, `icon`, `repository`, `trigger` and `lastRun`. `teamSlug` is required in URL.',
    summary: 'Fetch the list of pipelines.',
  })
  @ApiOkResponse({
    type: PipelineDto,
    isArray: true,
    description: 'List of pipelines.',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized request for pipelines.' })
  async getPipelines(@TeamSlug() teamSlug: string): Promise<PipelineDto[]> {
    return this.service.getPipelines(teamSlug)
  }

  @Get(ROUTE_PIPELINE_ID)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'Get the details of a pipeline. Request must include `teamSlug` and `pipelineId` in URL. Response should include `id`, `name`, `type`, `description`, `icon`, `repository`, `audit`, `trigger` and `eventWatchers`.',
    summary: 'Return details of a pipeline.',
  })
  @ApiOkResponse({ type: PipelineDetailsDto, description: 'Pipeline details.' })
  @ApiBadRequestResponse({ description: 'Bad request for pipeline details.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for pipeline details.' })
  @ApiNotFoundResponse({ description: 'Pipeline not found.' })
  @UuidParams(PARAM_PIPELINE_ID)
  async getPipelineDetails(@TeamSlug() _: string, @PipelineId() id: string): Promise<PipelineDetailsDto> {
    return this.service.getPipelineDetails(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description:
      'Creates a new pipeline. Request must include `teamSlug` in the URL, body is required to include `name`, `type`, `repository`, `trigger` and `token`. Request body may include `description`, `icon`. Response should include `id`, `name`, `type`, `description`, `icon`, `repository`, `audit`, `trigger` and `eventWatchers`.',
    summary: 'Create a new pipeline.',
  })
  @CreatedWithLocation()
  @ApiBody({ type: CreatePipelineDto })
  @ApiCreatedResponse({ type: PipelineDetailsDto, description: 'New pipeline created.' })
  @ApiBadRequestResponse({ description: 'Bad request for pipeline creation.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for pipeline creation.' })
  @ApiConflictResponse({ description: 'Pipeline name taken.' })
  @UseGuards(PipelineAccessValidationGuard)
  @AuditLogLevel('no-data')
  async createPipeline(
    @TeamSlug() teamSlug: string,
    @Body() request: CreatePipelineDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<PipelineDetailsDto>> {
    const pipeline = await this.service.createPipeline(teamSlug, request, identity)

    return {
      url: `${ROUTE_TEAM_SLUG}/${ROUTE_PIPELINES}/${pipeline.id}`,
      body: pipeline,
    }
  }

  @Put(ROUTE_PIPELINE_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description:
      'Updates a pipeline. Request must include `teamSlug`and `pipelineId` in URL. `name`, `type`, `repository` and `trigger` must be included in body. Request body may include `description`, `icon` and `token`.',
    summary: 'Modify a pipeline.',
  })
  @ApiNoContentResponse({ description: 'Pipeline updated.' })
  @ApiBadRequestResponse({ description: 'Bad request for pipeline update.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for pipeline update.' })
  @ApiNotFoundResponse({ description: 'Pipeline not found.' })
  @ApiConflictResponse({ description: 'Pipeline name taken.' })
  @UuidParams(PARAM_PIPELINE_ID)
  @UseGuards(PipelineAccessValidationGuard)
  @AuditLogLevel('no-data')
  async updatePipeline(
    @TeamSlug() teamSlug: string,
    @PipelineId() id: string,
    @Body() request: UpdatePipelineDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updatePipeline(teamSlug, id, request, identity)
  }

  @Delete(ROUTE_PIPELINE_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Deletes a pipeline. Request must include `teamSlug` and `pipelineId` in URL.',
    summary: 'Delete a pipeline from dyrector.io.',
  })
  @ApiNoContentResponse({ description: 'Pipeline deleted.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for pipeline delete.' })
  @ApiNotFoundResponse({ description: 'Pipeline not found.' })
  @UuidParams(PARAM_PIPELINE_ID)
  async deletePipeline(@TeamSlug() _: string, @PipelineId() id: string): Promise<void> {
    return this.service.deletePipeline(id)
  }

  @Get(`${ROUTE_PIPELINE_ID}/${ROUTE_RUNS}`)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'Request must include `skip`, `take`. Response should include an array of `items`: `id`, `startedAt`, `startedBy` and optionally `finishedAt`.',
    summary: 'Fetch pipeline runs.',
  })
  @ApiOkResponse({ type: PipelineRunDto, description: 'Paginated list of pipeline runs.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for pipeline runs.' })
  @UuidParams(PARAM_PIPELINE_ID)
  async getRuns(@PipelineId() id: string, @Query() query: PipelineRunQueryDto): Promise<PaginatedList<PipelineRunDto>> {
    return await this.service.getRuns(id, query)
  }

  @Post(`${ROUTE_PIPELINE_ID}/${ROUTE_RUNS}`)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description:
      'Triggers a new run. Request must include `teamSlug` and `pipelineId` in the URL. Request body may include `inputs`. The response should include `id`, `startedAt`, `startedBy`, `finishedAt`, `status`.',
    summary: 'Triggers the pipeline if it is not running already.',
  })
  @CreatedWithLocation()
  @ApiBody({ type: TriggerPipelineDto })
  @ApiCreatedResponse({ type: PipelineRunDto, description: 'The newly created run.' })
  @ApiBadRequestResponse({ description: 'Invalid request.' })
  @ApiForbiddenResponse({ description: 'Invalid permissions.' })
  @ApiConflictResponse({ description: 'Pipeline is already running.' })
  @AuditLogLevel('no-data')
  @UuidParams(PARAM_PIPELINE_ID)
  async trigger(
    @TeamSlug() _: string,
    @PipelineId() id: string,
    @Body() request: TriggerPipelineDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<PipelineRunDto>> {
    const run = await this.service.trigger(id, request, identity)

    return {
      url: `${ROUTE_TEAM_SLUG}/${ROUTE_PIPELINES}/${id}/${ROUTE_RUNS}/${run.id}`,
      body: run,
    }
  }

  @Post(`${ROUTE_PIPELINE_ID}/${ROUTE_EVENT_WATCHERS}`)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description:
      'Creates a new event watcher. Request must include `teamSlug` and `pipelineId` in the URL. `name`, `event` and `triggerInputs` in the body. The response should include `id`, `name`, `triggerInputs`, `event`, `createdAt`.',
    summary: 'Creates a new event watcher, to trigger the pipeline automatically.',
  })
  @CreatedWithLocation()
  @ApiBody({ type: CreatePipelineEventWatcherDto })
  @ApiCreatedResponse({ type: PipelineEventWatcherDto, description: 'The newly created event watcher.' })
  @ApiBadRequestResponse({ description: 'Invalid request.' })
  @ApiForbiddenResponse({ description: 'Invalid permissions.' })
  @ApiConflictResponse({ description: 'Event watcher name taken.' })
  @UuidParams(PARAM_PIPELINE_ID)
  async createEventWatcher(
    @TeamSlug() teamSlug: string,
    @PipelineId() pipelineId: string,
    @Body() request: CreatePipelineEventWatcherDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<PipelineEventWatcherDto>> {
    const eventWatcher = await this.service.createEventWatcher(pipelineId, request, identity)

    return {
      url: `${ROUTE_TEAM_SLUG}/${ROUTE_PIPELINES}/${pipelineId}/${ROUTE_RUNS}/${eventWatcher.id}`,
      body: eventWatcher,
    }
  }

  @Put(`${ROUTE_PIPELINE_ID}/${ROUTE_EVENT_WATCHERS}/${ROUTE_EVENT_WATCHER_ID}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description:
      'Updates an event watcher.  Request must include `teamSlug`, `pipelineId` and `eventWatcherId` in the URL. `name`, `event` and `triggerInputs` in the body.',
    summary: 'Modify an event watcher.',
  })
  @ApiNoContentResponse({ description: 'Event watcher updated.' })
  @ApiBadRequestResponse({ description: 'Bad request for event watcher update.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for event watcher update.' })
  @ApiNotFoundResponse({ description: 'Event watcher not found.' })
  @ApiConflictResponse({ description: 'Event watcher name taken.' })
  @UuidParams(PARAM_PIPELINE_ID, PARAM_EVENT_WATCHER_ID)
  async updateEventWatcher(
    @TeamSlug() _: string,
    @PipelineId() __: string,
    @EventWatcherId() id: string,
    @Body() request: UpdatePipelineEventWatcherDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateEventWatcher(id, request, identity)
  }

  @Delete(`${ROUTE_PIPELINE_ID}/${ROUTE_EVENT_WATCHERS}/${ROUTE_EVENT_WATCHER_ID}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description:
      'Deletes an event watcher. Request must include `teamSlug`, `pipelineId` and `eventWatcherId` in the URL.',
    summary: 'Delete a event watcher of a pipeline.',
  })
  @ApiNoContentResponse({ description: 'Event watcher deleted.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for event watcher delete.' })
  @ApiNotFoundResponse({ description: 'Event watcher not found.' })
  @UuidParams(PARAM_PIPELINE_ID, PARAM_EVENT_WATCHER_ID)
  async deleteEventWatcher(
    @TeamSlug() _: string,
    @PipelineId() __: string,
    @EventWatcherId() id: string,
  ): Promise<void> {
    return this.service.deleteEventWatcher(id)
  }

  @Post(`${ROUTE_PIPELINE_ID}/hooks/azure/pipeline-state`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description:
      'Update pipeline status. Request must include `teamSlug`and `pipelineId` in URL. `eventType` and `resource` must be included in body.',
    summary: 'Update hook for Azure DevOps pipelines.',
  })
  @ApiBody({ type: TriggerPipelineDto })
  @ApiNoContentResponse({ description: 'Status updated.' })
  @ApiBadRequestResponse({ description: 'Bad request for Azure DevOps hook.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for Azure DevOps hook.' })
  @ApiNotFoundResponse({ description: 'Pipeline not found.' })
  @AuthStrategy('pipeline-token')
  @AuditLogLevel('disabled')
  @UuidParams(PARAM_PIPELINE_ID)
  async azurePipelineStateHook(
    @TeamSlug() _: string,
    @PipelineId() id: string,
    @Body() request: AzurePipelineStateDto,
  ): Promise<void> {
    await this.service.onAzurePipelineStateChanged(id, request)
  }
}
