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
import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
import { Empty } from 'src/grpc/protobuf/proto/common'
import { getIdentity } from 'src/interceptors/grpc.user.interceptor'
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
  async generateToken(request: GenerateTokenRequest, metadata: Metadata): Promise<GenerateTokenResponse> {
    return this.authService.generateToken(request, getIdentity(metadata))
  }

  async getTokenList(_: Empty, metadata: Metadata): Promise<TokenListResponse> {
    return this.authService.getTokenList(getIdentity(metadata))
  }

  async deleteToken(request: IdRequest): Promise<void> {
    await this.authService.deleteToken(request)
  }
}
