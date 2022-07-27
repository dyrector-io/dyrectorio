import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { PrismaService } from 'src/services/prisma.service'
import { InterceptorGrpcHelperProvider } from 'src/interceptors/helper.interceptor'
import { TeamModule } from '../team/team.module'
import { TeamRepository } from '../team/team.repository'
import { RegistryController } from './registry.controller'
import { RegistryMapper } from './registry.mapper'
import { RegistryService } from './registry.service'

@Module({
  imports: [HttpModule, TeamModule],
  exports: [],
  controllers: [RegistryController],
  providers: [RegistryService, PrismaService, RegistryMapper, InterceptorGrpcHelperProvider, TeamRepository],
})
export class RegistryModule {}
