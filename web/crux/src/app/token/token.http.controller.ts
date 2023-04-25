import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { API_CREATED_LOCATION_HEADERS } from 'src/shared/const'
import UuidValidationGuard from 'src/guards/uuid-params.validation.guard'
import UuidParams from 'src/decorators/api-params.decorator'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'
import TokenAccessGuard from './guards/token.access.guard'
import JwtAuthGuard, { IdentityFromRequest } from './jwt-auth.guard'
import TokenValidationPipe from './pipes/token.pipe'
import { GeneratedTokenDto, GenerateTokenDto, TokenDto } from './token.dto'
import TokenService from './token.service'

const PARAM_TOKEN_ID = 'tokenId'
const TokenId = () => Param(PARAM_TOKEN_ID)

const ROUTE_TOKENS = 'tokens'
const ROUTE_TOKEN_ID = ':tokenId'

@Controller(ROUTE_TOKENS)
@ApiTags(ROUTE_TOKENS)
@UsePipes(
  new ValidationPipe({
    transform: true,
  }),
)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
@UseGuards(JwtAuthGuard, UuidValidationGuard, TokenAccessGuard)
export default class TokenHttpController {
  constructor(private service: TokenService) {}

  @Get()
  @HttpCode(200)
  @ApiOkResponse({
    type: TokenDto,
    isArray: true,
  })
  async getTokens(@IdentityFromRequest() identity: Identity): Promise<TokenDto[]> {
    return this.service.getTokenList(identity)
  }

  @Get(ROUTE_TOKEN_ID)
  @HttpCode(200)
  @ApiOkResponse({ type: TokenDto })
  @UuidParams(PARAM_TOKEN_ID)
  async getToken(@TokenId() id: string, @IdentityFromRequest() identity: Identity): Promise<TokenDto> {
    return this.service.getToken(id, identity)
  }

  @Post()
  @HttpCode(201)
  @CreatedWithLocation()
  @ApiBody({ type: GenerateTokenDto })
  @ApiCreatedResponse({
    type: GeneratedTokenDto,
    headers: API_CREATED_LOCATION_HEADERS,
  })
  async generateToken(
    @Body(TokenValidationPipe) request: GenerateTokenDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<GeneratedTokenDto>> {
    const token = await this.service.generateToken(request, identity)

    return {
      url: `/tokens/${token.id}`,
      body: token,
    }
  }

  @Delete(ROUTE_TOKEN_ID)
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Token deleted' })
  @UuidParams(PARAM_TOKEN_ID)
  async deleteToken(@TokenId() id: string): Promise<void> {
    await this.service.deleteToken(id)
  }
}
