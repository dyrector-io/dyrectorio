import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import KratosService from 'src/services/kratos.service'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import PrismaService from 'src/services/prisma.service'
import AuthService from './token.service'
import JwtStrategy from './jwt.strategy'
import AuthController from './token.controller'
import TokenMapper from './token.mapper'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { issuer: configService.get('CRUX_AGENT_ADDRESS') },
        verifyOptions: {
          issuer: configService.get('CRUX_AGENT_ADDRESS'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [InterceptorGrpcHelperProvider, AuthService, JwtStrategy, KratosService, PrismaService, TokenMapper],
  exports: [],
})
export default class AuthModule {}
