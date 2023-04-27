import { Body, Controller, Get, Header, HttpCode, Param, Post, Response } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import { Response as ExpressResponse } from 'express'
import UuidParams from 'src/decorators/api-params.decorator'
import TemplateFileService from 'src/services/template.file.service'
import { ProductDto } from '../product/product.dto'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import { CreateProductFromTemplateDto, TemplateDto } from './template.dto'
import TemplateService from './template.service'

const PARAM_TEMPLATE_ID = 'templateId'
const TemplateId = () => Param(PARAM_TEMPLATE_ID)

const ROUTE_TEMPLATES = 'templates'
const ROUTE_TEMPLATE_ID = ':templateId'

@Controller(ROUTE_TEMPLATES)
@ApiTags(ROUTE_TEMPLATES)
export default class TemplateHttpController {
  constructor(private service: TemplateService, private templateFileService: TemplateFileService) {}

  @Get()
  @HttpCode(200)
  @ApiOkResponse({ type: TemplateDto, isArray: true, description: 'Return details of templates on the platform.' })
  async getTemplates(): Promise<TemplateDto[]> {
    return this.templateFileService.getTemplates()
  }

  @Post()
  @HttpCode(201)
  @CreatedWithLocation()
  @ApiBody({ type: CreateProductFromTemplateDto })
  @ApiCreatedResponse({ type: ProductDto, description: 'Create a new template.' })
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
  @Header('content-type', 'image/jpeg')
  @ApiOkResponse({ description: 'Retrieve data of an image of a template.' })
  @UuidParams(PARAM_TEMPLATE_ID)
  async getImage(@TemplateId() templateId: string, @Response() response: ExpressResponse) {
    const image = await this.service.getImageStream(templateId)
    image.pipe(response)
  }
}
