import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import KratosService from 'src/services/kratos.service'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import RegistryMapper from './registry.mapper'
import RegistryService from './registry.service'
import RegistryHttpController from './registry.http.controller'
import RegistryWebSocketGateway from './registry.ws.gateway'
import RegistryClientProvider from './registry-client.provider'

@Module({
  imports: [HttpModule, TeamModule],
  exports: [RegistryMapper, RegistryService],
  controllers: [RegistryHttpController],
  providers: [
    RegistryService,
    PrismaService,
    RegistryMapper,
    InterceptorGrpcHelperProvider,
    TeamRepository,
    KratosService,
    RegistryWebSocketGateway,
    RegistryClientProvider,
  ],
})
export default class RegistryModule {}
