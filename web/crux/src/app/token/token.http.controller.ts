import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Response,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import { Response as ExpressResponse } from 'express'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { API_CREATED_LOCATION_HEADERS } from 'src/shared/const'
import TokenAccessGuard from './guards/token.access.guard'
import JwtAuthGuard, { IdentityFromRequest } from './jwt-auth.guard'
import TokenValidationPipe from './pipes/token.pipe'
import { GeneratedTokenDto, GenerateTokenDto, TokenDto } from './token.dto'
import TokenService from './token.service'

const TokenId = () => Param('tokenId')

const ROUTE_TOKENS = 'tokens'
const ROUTE_TOKEN_ID = ':tokenId'

@Controller(ROUTE_TOKENS)
@ApiTags(ROUTE_TOKENS)
@UsePipes(
  new ValidationPipe({
    transform: true,
  }),
)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor)
@UseGuards(JwtAuthGuard, TokenAccessGuard)
export default class TokenHttpController {
  constructor(private service: TokenService) {}

  @Get()
  @ApiOkResponse({
    type: TokenDto,
    isArray: true,
  })
  async getTokens(@IdentityFromRequest() identity: Identity): Promise<TokenDto[]> {
    return this.service.getTokenList(identity)
  }

  @Get(ROUTE_TOKEN_ID)
  @ApiOkResponse({ type: TokenDto })
  async getToken(@TokenId() id: string, @IdentityFromRequest() identity: Identity): Promise<TokenDto> {
    return this.service.getToken(id, identity)
  }

  @Post()
  @ApiBody({ type: GenerateTokenDto })
  @ApiCreatedResponse({
    type: GeneratedTokenDto,
    headers: API_CREATED_LOCATION_HEADERS,
  })
  @HttpCode(201)
  async generateToken(
    @Body(TokenValidationPipe) request: GenerateTokenDto,
    @IdentityFromRequest() identity: Identity,
    @Response() res: ExpressResponse,
  ): Promise<void> {
    const token = await this.service.generateToken(request, identity)

    res.location(`/tokens/${token.id}`).json(token)
  }

  @Delete(ROUTE_TOKEN_ID)
  @AuditLogLevel('disabled')
  @HttpCode(204)
  async deleteToken(@TokenId() id: string, @Response() res: ExpressResponse): Promise<void> {
    await this.service.deleteToken(id)
    res.end()
  }
}
