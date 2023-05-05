import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import TokenService from './token.service'
import JwtStrategy from './jwt.strategy'
import TokenMapper from './token.mapper'
import TeamModule from '../team/team.module'
import TokenHttpController from './token.http.controller'

@Module({
  imports: [
    TeamModule,
    PassportModule.register({ session: true }),
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
  controllers: [TokenHttpController],
  providers: [TokenService, JwtStrategy, KratosService, PrismaService, TokenMapper],
  exports: [],
})
export default class TokenModule {}
