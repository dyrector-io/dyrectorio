import { Body, Controller, Get, Response, Param, Post, Header, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import TemplateFileService from 'src/services/template.file.service'
import { Response as ExpressResponse } from 'express'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
import { CreateProductFromTemplateDto, TemplateDto } from './template.dto'
import TemplateService from './template.service'
import { ProductDto } from '../product/product.dto'

const ROUTE_TEMPLATES = 'templates'
const ROUTE_TEMPLATE_ID = ':templateId'
const TemplateId = () => Param('templateId')

@Controller(ROUTE_TEMPLATES)
@ApiTags(ROUTE_TEMPLATES)
@UseGuards(JwtAuthGuard)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
export default class TemplateHttpController {
  constructor(private service: TemplateService, private templateFileService: TemplateFileService) {}

  @Get()
  @ApiOkResponse({ type: TemplateDto, isArray: true })
  async getTemplates(): Promise<TemplateDto[]> {
    return this.templateFileService.getTemplates()
  }

  @Post()
  @CreatedWithLocation()
  @ApiBody({ type: CreateProductFromTemplateDto })
  @ApiCreatedResponse({ type: ProductDto })
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
  @Header('content-type', 'image/jpeg')
  async getImage(@TemplateId() templateId: string, @Response() response: ExpressResponse) {
    const image = await this.service.getImageStream(templateId)
    image.pipe(response)
  }
}
