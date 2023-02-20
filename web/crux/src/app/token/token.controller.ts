import {
  CruxTokenController,
  CruxTokenControllerMethods,
  GenerateTokenRequest,
  AccessRequest,
  TokenListResponse,
  GenerateTokenResponse,
  IdRequest,
} from 'src/grpc/protobuf/proto/crux'
import { Controller, UseInterceptors, Body, UseGuards } from '@nestjs/common'

import GrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import AuthService from './token.service'
import TokenValidationPipe from './pipes/token.pipe'
import TokenDeleteAccessGuard from './guards/token.delete.guard'

@Controller()
@CruxTokenControllerMethods()
@UseInterceptors(GrpcLoggerInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class TokenController implements CruxTokenController {
  constructor(private authService: AuthService) {}

  async generateToken(@Body(TokenValidationPipe) request: GenerateTokenRequest): Promise<GenerateTokenResponse> {
    return this.authService.generateToken(request)
  }

  async getTokenList(request: AccessRequest): Promise<TokenListResponse> {
    return this.authService.getTokenList(request)
  }

  @UseGuards(TokenDeleteAccessGuard)
  async deleteToken(request: IdRequest): Promise<void> {
    await this.authService.deleteToken(request)
  }
}
