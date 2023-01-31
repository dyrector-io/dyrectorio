import {
  CruxAuthController,
  TokenResponse,
  CruxAuthControllerMethods,
  TokenRequest,
  AccessRequest,
} from 'src/grpc/protobuf/proto/crux'
import { Controller, UseInterceptors } from '@nestjs/common'

import GrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import AuthService from './auth.service'

@Controller()
@CruxAuthControllerMethods()
@UseInterceptors(GrpcLoggerInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class AuthController implements CruxAuthController {
  constructor(private authService: AuthService) {}

  async generateToken(request: TokenRequest): Promise<TokenResponse> {
    return await this.authService.generateToken(request)
  }

  async getUserTokens(request: AccessRequest): Promsise<UserTokenListResponse> {
    return await this.authService.getUserTokens(request)
  }
}
