import { Module } from '@nestjs/common'
import { PrismaService } from 'src/config/prisma.service'
import { InterceptorGrpcHelperProvider } from 'src/interceptors/helper.interceptor'
import { EmailService } from '../email.service'
import { KratosService } from '../kratos.service'
import { TeamController } from './team.controller'
import { TeamMapper } from './team.mapper'
import { TeamRepository } from './team.repository'
import { TeamService } from './team.service'

@Module({
  imports: [],
  exports: [TeamRepository],
  controllers: [TeamController],
  providers: [
    TeamService,
    TeamRepository,
    PrismaService,
    EmailService,
    KratosService,
    TeamMapper,
    InterceptorGrpcHelperProvider,
  ],
})
export class TeamModule {}
