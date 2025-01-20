import { HttpModule } from '@nestjs/axios'
import { forwardRef, Module } from '@nestjs/common'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import ContainerModule from '../container/container.module'
import DeployModule from '../deploy/deploy.module'
import EditorModule from '../editor/editor.module'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import ConfigBundlesHttpController from './config.bundle.http.controller'
import ConfigBundleMapper from './config.bundle.mapper'
import ConfigBundleService from './config.bundle.service'

@Module({
  imports: [HttpModule, TeamModule, AuditLoggerModule, EditorModule, DeployModule, forwardRef(() => ContainerModule)],
  exports: [ConfigBundleMapper, ConfigBundleService],
  controllers: [ConfigBundlesHttpController],
  providers: [ConfigBundleService, PrismaService, ConfigBundleMapper, TeamRepository, KratosService],
})
export default class ConfigBundleModule {}
