import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import PrismaService from 'src/services/prisma.service'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import { HttpModule } from '@nestjs/axios'
import KratosService from 'src/services/kratos.service'
import DomainNotificationService from 'src/services/domain.notification.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { makeCounterProvider } from '@willsoto/nestjs-prometheus'
import TeamRepository from '../team/team.repository'
import AgentController from './agent.controller'
import AgentService from './agent.service'

@Module({
  imports: [
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          issuer: configService.get<string>('CRUX_AGENT_ADDRESS'),
        },
        verifyOptions: {
          issuer: configService.get<string>('CRUX_AGENT_ADDRESS'),
        },
      }),
    }),
  ],
  exports: [AgentService],
  controllers: [AgentController],
  providers: [
    AgentService,
    PrismaService,
    InterceptorGrpcHelperProvider,
    TeamRepository,
    DomainNotificationService,
    KratosService,
    makeCounterProvider({
      name: 'agent_counter',
      help: 'Agent connection counter',
    }),
  ],
})
export default class AgentModule {}
