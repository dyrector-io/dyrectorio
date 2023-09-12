import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import EditorModule from '../editor/editor.module'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import ConfigBundlesHttpController from './config.bundle.http.controller'
import ConfigBundleMapper from './config.bundle.mapper'
import ConfigBundleService from './config.bundle.service'
import ConfigBundleWebSocketGateway from './config.bundle.ws.gateway'

@Module({
  imports: [HttpModule, TeamModule, AuditLoggerModule, EditorModule],
  exports: [ConfigBundleMapper, ConfigBundleService],
  controllers: [ConfigBundlesHttpController],
  providers: [
    ConfigBundleService,
    PrismaService,
    ConfigBundleMapper,
    TeamRepository,
    KratosService,
    ConfigBundleWebSocketGateway,
  ],
})
export default class ConfigBundleModule {}
