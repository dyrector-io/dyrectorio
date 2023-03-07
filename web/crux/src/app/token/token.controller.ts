import { Controller, UseGuards } from '@nestjs/common'
import {
  CruxTokenController,
  CruxTokenControllerMethods,
  GenerateTokenRequest,
  GenerateTokenResponse,
  IdRequest,
  TokenListResponse,
} from 'src/grpc/protobuf/proto/crux'

import { Metadata } from '@grpc/grpc-js'
import { UsePipes } from '@nestjs/common/decorators'
import { Identity } from '@ory/kratos-client'
import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
import { Empty } from 'src/grpc/protobuf/proto/common'
import { IdentityFromGrpcCall } from 'src/shared/user-access.guard'
import TokenAccessGuard from './guards/token.access.guard'
import TokenValidationPipe from './pipes/token.pipe'
import TokenService from './token.service'

@Controller()
@CruxTokenControllerMethods()
@UseGuards(TokenAccessGuard)
@UseGrpcInterceptors()
export default class TokenController implements CruxTokenController {
  constructor(private authService: TokenService) {}

  @UsePipes(TokenValidationPipe)
  async generateToken(
    request: GenerateTokenRequest,
    _: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<GenerateTokenResponse> {
    return this.authService.generateToken(request, identity)
  }

  async getTokenList(_: Empty, __: Metadata, @IdentityFromGrpcCall() identity: Identity): Promise<TokenListResponse> {
    return this.authService.getTokenList(identity)
  }

  async deleteToken(request: IdRequest): Promise<void> {
    await this.authService.deleteToken(request)
  }
}
