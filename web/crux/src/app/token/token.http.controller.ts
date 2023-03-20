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
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { Response as ExpressResponse } from 'express'
import JwtAuthGuard, { IdentityFromRequest } from './jwt-auth.guard'
import { GenerateToken, Token, GeneratedToken } from './token.dto'
import TokenService from './token.service'
import TokenValidationPipe from './pipes/token.pipe'
import TokenAccessGuard from './guards/token.access.guard'

const TokenId = () => Param(':tokenId')

@Controller('tokens')
@ApiTags('tokens')
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
    type: Token,
    isArray: true,
  })
  async getTokens(@IdentityFromRequest() identity: Identity): Promise<Token[]> {
    return this.service.getTokenList(identity)
  }

  @Get(':tokenId')
  @ApiOkResponse({ type: Token })
  async getToken(@TokenId() id: string, @IdentityFromRequest() identity: Identity): Promise<Token> {
    return this.service.getToken(id, identity)
  }

  @Post()
  @ApiBody({ type: GenerateToken })
  @ApiCreatedResponse({
    type: GeneratedToken,
    headers: {
      Location: {
        description: 'URL of the created object.',
        schema: {
          type: 'URL',
        },
      },
    },
  })
  @HttpCode(201)
  async generateToken(
    @Body(TokenValidationPipe) request: GenerateToken,
    @IdentityFromRequest() identity: Identity,
    @Response() res: ExpressResponse,
  ): Promise<void> {
    const token = await this.service.generateToken(request, identity)

    res.location(`/tokens/${token.id}`).json(token)
  }

  @Delete(':tokenId')
  @AuditLogLevel('disabled')
  @HttpCode(204)
  async deleteToken(@TokenId() id: string, @Response() res: ExpressResponse): Promise<void> {
    await this.service.deleteToken(id)
    res.end()
  }
}
