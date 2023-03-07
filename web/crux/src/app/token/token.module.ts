import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import KratosService from 'src/services/kratos.service'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import PrismaService from 'src/services/prisma.service'
import TokenService from './token.service'
import JwtStrategy from './jwt.strategy'
import AuthController from './token.controller'
import TokenMapper from './token.mapper'
<<<<<<< HEAD
import TeamModule from '../team/team.module'

@Module({
  imports: [
    PassportModule,
    TeamModule,
=======
import { session } from 'passport'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', session: true }),
>>>>>>> 1095b230 (DRAFT: Initial auditlog and dashboard http API with session based authguard)
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
  providers: [InterceptorGrpcHelperProvider, TokenService, JwtStrategy, KratosService, PrismaService, TokenMapper],
  exports: [],
})
export default class TokenModule {}
