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
import { HttpIdentityInterceptor, IdentityFromRequest } from 'src/interceptors/http.identity.interceptor'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { Response as ExpressResponse } from 'express'
import JwtAuthGuard from './jwt-auth.guard'
import { GenerateToken, SimpleToken, Token, TokenList } from './token.dto'
import TokenService from './token.service'
import TokenValidationPipe from './pipes/token.pipe'
import TokenAccessGuard from './guards/token.access.guard'

@Controller('tokens')
@ApiTags('tokens')
@UsePipes(
  new ValidationPipe({
    transform: true,
  }),
)
@UseInterceptors(HttpLoggerInterceptor, HttpIdentityInterceptor, PrismaErrorInterceptor)
@UseGuards(JwtAuthGuard, TokenAccessGuard)
export default class TokenHttpController {
  constructor(private service: TokenService) {}

  @Get()
  @AuditLogLevel('disabled')
  @ApiOkResponse({ type: TokenList })
  async getTokens(@IdentityFromRequest() identity: Identity): Promise<TokenList> {
    return this.service.getTokenList(identity)
  }

  @Get(':id')
  @AuditLogLevel('disabled')
  @ApiOkResponse({ type: SimpleToken })
  async getToken(@Param('id') id: string, @IdentityFromRequest() identity: Identity): Promise<SimpleToken> {
    return this.service.getToken(id, identity)
  }

  @Post()
  @AuditLogLevel('disabled')
  @ApiBody({ type: GenerateToken })
  @ApiCreatedResponse({
    type: Token,
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

  @Delete(':id')
  @AuditLogLevel('disabled')
  @HttpCode(204)
  async deleteToken(@Param('id') id: string, @Response() res: ExpressResponse): Promise<void> {
    await this.service.deleteToken(id)
    res.end()
  }
}
