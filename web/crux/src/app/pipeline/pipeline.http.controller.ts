import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common'
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
import { AuthStrategy, IdentityFromRequest } from '../token/jwt-auth.guard'
import PipelineAccessValidationGuard from './guards/pipeline.auth.validation.guard'
import PipelineJwtAuthGuard from './guards/pipeline.jwt-auth.guard'
import PipelineTeamAccessGuard from './guards/pipeline.team-access.guard'
import {
  AzurePipelineStateDto,
  CreatePipelineDto,
  PipelineDetailsDto,
  PipelineDto,
  PipelineRunDto,
  TriggerPipelineDto,
  UpdatePipelineDto,
} from './pipeline.dto'
import PipelineService from './pipeline.service'

const PARAM_TEAM_SLUG = 'teamSlug'
const PARAM_PIPELINE_ID = 'pipelineId'
const TeamSlug = () => Param(PARAM_TEAM_SLUG)
const PipelineId = () => Param(PARAM_PIPELINE_ID)

const ROUTE_TEAM_SLUG = ':teamSlug'
const ROUTE_PIPELINES = 'pipelines'
const ROUTE_PIPELINE_ID = ':pipelineId'
const ROUTE_RUNS = 'runs'

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
      'Get the details of a pipeline. Request must include `teamSlug` and `pipelineId` in URL. Response should include `id`, `name`, `type`, `description`, `icon`, `repository`, `audit`, `trigger` and `runs`.',
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
      'Creates a new pipeline. Request must include `teamSlug` in the URL, body is required to include `name`, `type`, `repository`, `trigger` and `token`. Request body may include `description`, `icon`. Response should include `id`, `name`, `type`, `description`, `icon`, `repository`, `audit`, `trigger` and `runs`.',
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
    @TeamSlug() _: string,
    @PipelineId() id: string,
    @Body() request: UpdatePipelineDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updatePipeline(id, request, identity)
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
  @ApiConflictResponse({ description: 'Pipeline name taken.' })
  @AuditLogLevel('no-data')
  async trigger(
    @TeamSlug() _: string,
    @PipelineId() id: string,
    @Body() request: TriggerPipelineDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<PipelineRunDto>> {
    const run = await this.service.trigger(id, request, identity)

    return {
      url: `${ROUTE_TEAM_SLUG}/${ROUTE_PIPELINES}/${id}/runs/${run.id}`,
      body: run,
    }
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
