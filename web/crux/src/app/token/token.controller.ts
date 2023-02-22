import {
  CruxTokenController,
  CruxTokenControllerMethods,
  GenerateTokenRequest,
  TokenListResponse,
  GenerateTokenResponse,
  IdRequest,
} from 'src/grpc/protobuf/proto/crux'
import { Controller, UseInterceptors, UseGuards } from '@nestjs/common'

import GrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import GrpcUserInterceptor, { getAccessedBy } from 'src/interceptors/grpc.user.interceptor'
import { Metadata } from '@grpc/grpc-js'
import { Empty } from 'src/grpc/protobuf/proto/common'
import { UsePipes } from '@nestjs/common/decorators'
import AuthService from './token.service'
import TokenValidationPipe from './pipes/token.pipe'
import TokenAccessGuard from './guards/token.access.guard'

@Controller()
@CruxTokenControllerMethods()
@UseGuards(TokenAccessGuard)
@UseInterceptors(GrpcLoggerInterceptor, GrpcUserInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class TokenController implements CruxTokenController {
  constructor(private authService: AuthService) {}

  @UsePipes(TokenValidationPipe)
  async generateToken(request: GenerateTokenRequest, metadata: Metadata): Promise<GenerateTokenResponse> {
    return this.authService.generateToken(request, getAccessedBy(metadata))
  }

  async getTokenList(_: Empty, metadata: Metadata): Promise<TokenListResponse> {
    return this.authService.getTokenList(getAccessedBy(metadata))
  }

  async deleteToken(request: IdRequest): Promise<void> {
    await this.authService.deleteToken(request)
  }
}
