import { Module } from '@nestjs/common'
import { PrismaService } from 'src/services/prisma.service'
import { InterceptorGrpcHelperProvider } from 'src/interceptors/helper.interceptor'
import { TeamController } from './team.controller'
import { TeamMapper } from './team.mapper'
import { TeamRepository } from './team.repository'
import { TeamService } from './team.service'
import { EmailService } from 'src/services/email.service'
import { KratosService } from 'src/services/kratos.service'
import { EmailBuilder } from 'src/services/email-builder.service'

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
    EmailBuilder
  ],
})
export class TeamModule {}
