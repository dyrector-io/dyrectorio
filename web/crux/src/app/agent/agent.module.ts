import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PrismaService } from 'src/services/prisma.service'
import { InterceptorGrpcHelperProvider } from 'src/interceptors/helper.interceptor'
import { TeamRepository } from '../team/team.repository'
import { AgentController } from './agent.controller'
import { AgentService } from './agent.service'
import { HttpModule } from '@nestjs/axios'
import { KratosService } from 'src/services/kratos.service'
import { DomainNotificationService } from 'src/services/domain.notification.service'

@Module({
  imports: [
    HttpModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        issuer: process.env.CRUX_ADDRESS,
      },
      verifyOptions: {
        issuer: process.env.CRUX_ADDRESS,
      },
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
  ],
})
export class AgentModule {}
