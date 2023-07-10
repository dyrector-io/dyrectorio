import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import { API_CREATED_LOCATION_HEADERS } from 'src/shared/const'
import { CreatedResponse, CreatedWithLocation } from '../../interceptors/created-with-location.decorator'
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: "Access token's support is to provide secure access to the HTTP api without a cookie.",
    summary: 'List of tokens.',
  })
  @ApiOkResponse({
    type: TokenDto,
    isArray: true,
    description: 'Token list fetched.',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized request for tokens.' })
  async getTokens(@IdentityFromRequest() identity: Identity): Promise<TokenDto[]> {
    return this.service.getTokenList(identity)
  }

  @Get(ROUTE_TOKEN_ID)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      "Access token's details are `name`, `id`, and the time of creation and expiration. Request must include `tokenId`.",
    summary: 'Fetch token details.',
  })
  @ApiOkResponse({ type: TokenDto, description: 'Token details listed.' })
  @ApiBadRequestResponse({ description: 'Bad request for token details.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for token details.' })
  @ApiNotFoundResponse({ description: 'Token details not found.' })
  @UuidParams(PARAM_TOKEN_ID)
  async getToken(@TokenId() id: string, @IdentityFromRequest() identity: Identity): Promise<TokenDto> {
    return this.service.getToken(id, identity)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
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
  @ApiBadRequestResponse({ description: 'Bad request for token creation.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for token creation.' })
  @ApiConflictResponse({ description: 'Token name taken.' })
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Request must include `tokenId`.',
    summary: 'Delete an access token.',
  })
  @ApiNoContentResponse({ description: 'Delete token.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for token delete.' })
  @ApiNotFoundResponse({ description: 'Token not found.' })
  @UuidParams(PARAM_TOKEN_ID)
  async deleteToken(@TokenId() id: string): Promise<void> {
    await this.service.deleteToken(id)
  }
}
