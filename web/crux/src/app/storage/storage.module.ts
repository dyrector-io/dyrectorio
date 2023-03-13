import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import KratosService from 'src/services/kratos.service'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import StorageService from './storage.service'
import StorageMapper from './storage.mapper'
import StorageController from './storage.controller'

@Module({
  imports: [HttpModule, TeamModule],
  exports: [StorageMapper, StorageService],
  controllers: [StorageController],
  providers: [
    StorageService,
    PrismaService,
    StorageMapper,
    InterceptorGrpcHelperProvider,
    TeamRepository,
    KratosService,
  ],
})
export default class StorageModule {}
