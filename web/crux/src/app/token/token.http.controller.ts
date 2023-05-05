import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common'
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
import { API_CREATED_LOCATION_HEADERS } from 'src/shared/const'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import TokenAccessGuard from './guards/token.access.guard'
import { IdentityFromRequest } from './jwt-auth.guard'
import TokenValidationPipe from './pipes/token.pipe'
import { GenerateTokenDto, GeneratedTokenDto, TokenDto } from './token.dto'
import TokenService from './token.service'

const PARAM_TOKEN_ID = 'tokenId'
const TokenId = () => Param(PARAM_TOKEN_ID)

const ROUTE_TOKENS = 'tokens'
const ROUTE_TOKEN_ID = ':tokenId'

@Controller(ROUTE_TOKENS)
@ApiTags(ROUTE_TOKENS)
@UseGuards(TokenAccessGuard)
export default class TokenHttpController {
  constructor(private service: TokenService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    description: "Access token's support is to provide secure access to the HTTP api without a cookie.",
    summary: 'List of tokens.',
  })
  @ApiOkResponse({
    type: TokenDto,
    isArray: true,
    description: 'Token list fetched.',
  })
  async getTokens(@IdentityFromRequest() identity: Identity): Promise<TokenDto[]> {
    return this.service.getTokenList(identity)
  }

  @Get(ROUTE_TOKEN_ID)
  @HttpCode(200)
  @ApiOperation({
    description:
      "Access token's details are `name`, `id`, and the time of creation and expiration. Request must include `tokenId`.",
    summary: 'Fetch token details.',
  })
  @ApiOkResponse({ type: TokenDto, description: 'Token details listed.' })
  @UuidParams(PARAM_TOKEN_ID)
  async getToken(@TokenId() id: string, @IdentityFromRequest() identity: Identity): Promise<TokenDto> {
    return this.service.getToken(id, identity)
  }

  @Post()
  @HttpCode(201)
  @CreatedWithLocation()
  @ApiOperation({
    description: 'Request must include `name` and `expirationInDays`.',
    summary: 'Create access token.',
  })
  @ApiBody({ type: GenerateTokenDto, description: 'Token created.' })
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
  @ApiOperation({
    description: 'Request must include `tokenId`.',
    summary: 'Delete an access token.',
  })
  @ApiNoContentResponse({ description: 'Delete token.' })
  @UuidParams(PARAM_TOKEN_ID)
  async deleteToken(@TokenId() id: string): Promise<void> {
    await this.service.deleteToken(id)
  }
}
