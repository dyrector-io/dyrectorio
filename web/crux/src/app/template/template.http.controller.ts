import {
  Body,
  Controller,
  Get,
  Response,
  Param,
  Post,
  Header,
  UseGuards,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import TemplateFileService from 'src/services/template.file.service'
import { Response as ExpressResponse } from 'express'
import UuidValidationGuard from 'src/guards/uuid-params.validation.guard'
import UuidParams from 'src/decorators/api-params.decorator'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
import { CreateProductFromTemplateDto, TemplateDto } from './template.dto'
import TemplateService from './template.service'
import { ProductDto } from '../product/product.dto'

const PARAM_TEMPLATE_ID = 'templateId'
const TemplateId = () => Param(PARAM_TEMPLATE_ID)

const ROUTE_TEMPLATES = 'templates'
const ROUTE_TEMPLATE_ID = ':templateId'

@Controller(ROUTE_TEMPLATES)
@ApiTags(ROUTE_TEMPLATES)
@UseGuards(JwtAuthGuard, UuidValidationGuard)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
export default class TemplateHttpController {
  constructor(private service: TemplateService, private templateFileService: TemplateFileService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    description: 'Response should include `id`, `name`, `description` and `technologies` of templates.',
    summary: 'Return details of templates on the platform.',
  })
  @ApiOkResponse({ type: TemplateDto, isArray: true, description: 'Template details listed.' })
  async getTemplates(): Promise<TemplateDto[]> {
    return this.templateFileService.getTemplates()
  }

  @Post()
  @HttpCode(201)
  @CreatedWithLocation()
  @ApiOperation({
    description:
      'Request must include `type`, `id`, and `name`. Response should include `id`, `name`, `description`, `type`, and `audit` log details of templates.',
    summary: 'Create a new template.',
  })
  @ApiBody({ type: CreateProductFromTemplateDto })
  @ApiCreatedResponse({ type: ProductDto, description: 'New template created.' })
  async createProduct(
    @Body() request: CreateProductFromTemplateDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<ProductDto>> {
    const product = await this.service.createProductFromTemplate(request, identity)

    return {
      url: `/products/${product.id}`,
      body: product,
    }
  }

  @Get(`${ROUTE_TEMPLATE_ID}/image`)
  @HttpCode(200)
  @ApiOperation({
    description: 'Request must include `templateId`.',
    summary: 'Retrieve data of images of a template.',
  })
  @Header('content-type', 'image/jpeg')
  @ApiOkResponse({ description: 'Retrieve data of an image of a template.' })
  @UuidParams(PARAM_TEMPLATE_ID)
  async getImage(@TemplateId() templateId: string, @Response() response: ExpressResponse) {
    const image = await this.service.getImageStream(templateId)
    image.pipe(response)
  }
}
