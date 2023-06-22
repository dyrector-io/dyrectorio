import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common'
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import { CreatedResponse, CreatedWithLocation } from '../../interceptors/created-with-location.decorator'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import ProjectTeamAccessGuard from './guards/project.team-access.guard'
import ProjectUpdateValidationInterceptor from './interceptors/project.update.interceptor'
import { CreateProjectDto, ProjectDetailsDto, ProjectListItemDto, UpdateProjectDto } from './project.dto'
import ProjectService from './project.service'

const PARAM_PROJECT_ID = 'projectId'
const ProjectId = () => Param(PARAM_PROJECT_ID)

const ROUTE_PROJECTS = 'projects'
const ROUTE_PROJECT_ID = ':projectId'

@Controller(ROUTE_PROJECTS)
@ApiTags(ROUTE_PROJECTS)
@UseGuards(ProjectTeamAccessGuard)
export default class ProjectHttpController {
  constructor(private service: ProjectService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    description: "Returns a list of a team's projects and their details.",
    summary: 'Fetch the projects list.',
  })
  @ApiOkResponse({
    type: ProjectListItemDto,
    isArray: true,
    description: 'List of projects',
  })
  @ApiNoContentResponse()
  async getProjects(@IdentityFromRequest() identity: Identity): Promise<ProjectListItemDto[]> {
    return this.service.getProjects(identity)
  }

  @Get(ROUTE_PROJECT_ID)
  @HttpCode(200)
  @ApiOperation({
    description:
      "Returns a project's details. The response should contain an array, consisting of the project's `name`, `id`, `type`, `description`, `deletability`, versions and version related data, including version `name` and `id`, `changelog`, increasibility.",
    summary: 'Fetch details of a project.',
  })
  @ApiOkResponse({ type: ProjectDetailsDto, description: 'Details of a project.' })
  @UuidParams(PARAM_PROJECT_ID)
  async getProjectDetails(@ProjectId() id: string): Promise<ProjectDetailsDto> {
    return this.service.getProjectDetails(id)
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    description:
      'Create a new project for a team. Newly created team has a `type` and a `name` as required variables, and optionally a `description` and a `changelog`.',
    summary: 'Create a new project for a team.',
  })
  @CreatedWithLocation()
  @ApiBody({ type: CreateProjectDto })
  @ApiCreatedResponse({ type: ProjectListItemDto, description: 'New project created.' })
  async createProject(
    @Body() request: CreateProjectDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<ProjectListItemDto>> {
    const project = await this.service.createProject(request, identity)

    return {
      url: `/projects/${project.id}`,
      body: project,
    }
  }

  @Put(ROUTE_PROJECT_ID)
  @HttpCode(204)
  @ApiOperation({
    description:
      'Updates a project. `projectId` is a required variable to identify which project is modified, `name`, `description` and `changelog` can be adjusted with this call.',
    summary: 'Update a project.',
  })
  @ApiNoContentResponse({ description: 'Project details are modified.' })
  @UseInterceptors(ProjectUpdateValidationInterceptor)
  @UuidParams(PARAM_PROJECT_ID)
  async updateProject(
    @ProjectId() id: string,
    @Body() request: UpdateProjectDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateProject(id, request, identity)
  }

  @Delete(ROUTE_PROJECT_ID)
  @HttpCode(204)
  @ApiOperation({
    description: 'Deletes a project with the specified `projectId`',
    summary: 'Delete a project.',
  })
  @ApiNoContentResponse({ description: 'Project deleted.' })
  @UuidParams(PARAM_PROJECT_ID)
  async deleteProject(@ProjectId() id: string): Promise<void> {
    return this.service.deleteProject(id)
  }

  @Post(`${ROUTE_PROJECT_ID}/convert`)
  @HttpCode(204)
  @ApiOperation({
    description: 'Converts a project to versioned with the specified `projectId`',
    summary: 'Convert a project to versioned.',
  })
  @ApiNoContentResponse({ description: 'Project converted.' })
  @UuidParams(PARAM_PROJECT_ID)
  async convertProject(@ProjectId() id: string): Promise<void> {
    return this.service.convertProjectToVersioned(id)
  }
}
