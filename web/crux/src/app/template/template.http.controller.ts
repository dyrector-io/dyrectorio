import {
  Body,
  Controller,
  ExecutionContext,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Response,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import { Response as ExpressResponse } from 'express'
import { AuditLogTeamSlug, AuditLogTeamSlugProvider } from 'src/decorators/audit-logger.decorator'
import { DisableTeamAccessGuard } from 'src/guards/team-access.guard'
import TemplateFileService from 'src/services/template.file.service'
import { CreatedResponse, CreatedWithLocation } from '../../interceptors/created-with-location.decorator'
import { ProjectDto } from '../project/project.dto'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import TemplateCreateProjectGuard from './guards/template.create-project.guard'
import { CreateProjectFromTemplateDto, TemplateDto } from './template.dto'
import TemplateService from './template.service'

const PARAM_TEMPLATE_ID = 'templateId'
const TemplateId = () => Param(PARAM_TEMPLATE_ID)

const ROUTE_TEMPLATES = 'templates'
const ROUTE_TEMPLATE_ID = ':templateId'

const teamSlugFromCreateDto: AuditLogTeamSlugProvider = (context: ExecutionContext) => {
  const dto = context.switchToHttp().getRequest().body as CreateProjectFromTemplateDto
  return dto?.teamSlug ?? null
}

@Controller(ROUTE_TEMPLATES)
@ApiTags(ROUTE_TEMPLATES)
@DisableTeamAccessGuard()
export default class TemplateHttpController {
  constructor(
    private service: TemplateService,
    private templateFileService: TemplateFileService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Response should include `id`, `name`, `description` and `technologies` of templates.',
    summary: 'Return list of templates on the platform.',
  })
  @ApiOkResponse({ type: TemplateDto, isArray: true, description: 'Templates listed.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for templates.' })
  async getTemplates(): Promise<TemplateDto[]> {
    return this.templateFileService.getTemplates()
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CreatedWithLocation()
  @ApiOperation({
    description:
      'Request must include `type`, `id`, and `name`. Response should include `id`, `name`, `description`, `type`, and `audit` log details of templates.',
    summary: 'Creates a new project from the selected template.',
  })
  @ApiBody({ type: CreateProjectFromTemplateDto })
  @ApiCreatedResponse({ type: ProjectDto, description: 'New project created.' })
  @ApiBadRequestResponse({ description: 'Bad request for project creation.' })
  @ApiConflictResponse({ description: 'Project name taken.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for project creation.' })
  @UseGuards(TemplateCreateProjectGuard)
  @AuditLogTeamSlug(teamSlugFromCreateDto)
  async createProject(
    @Body() request: CreateProjectFromTemplateDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<ProjectDto>> {
    const project = await this.service.createProjectFromTemplate(request, identity)

    return {
      url: `${request.teamSlug}/projects/${project.id}`,
      body: project,
    }
  }

  @Get(`${ROUTE_TEMPLATE_ID}/image`)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Request must include `templateId`.',
    summary: 'Retrieves the picture of the template',
  })
  @Header('content-type', 'image/jpeg')
  @ApiOkResponse({ description: 'Retrieve data of an image of a template.' })
  @ApiBadRequestResponse({ description: 'Bad request for template images.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for template images.' })
  @ApiNotFoundResponse({ description: 'Template images not found.' })
  async getImage(@TemplateId() templateId: string, @Response() response: ExpressResponse) {
    const image = await this.service.getImageStream(templateId)
    image.pipe(response)
  }
}
