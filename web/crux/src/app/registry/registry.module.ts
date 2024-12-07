import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import NotificationTemplateBuilder from 'src/builders/notification.template.builder'
import { CruxJwtModuleImports } from 'src/config/jwt.config'
import EncryptionService from 'src/services/encryption.service'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import RegistryClientProvider from './registry-client.provider'
import RegistryHttpController from './registry.http.controller'
import { RegistryJwtStrategy } from './registry.jwt.strategy'
import RegistryMapper from './registry.mapper'
import RegistryService from './registry.service'
import RegistryWebSocketGateway from './registry.ws.gateway'
import { CacheModule } from '@nestjs/cache-manager'
import V2ManifestClient from './v2-manifest-client.service'

@Module({
  imports: [HttpModule, TeamModule, AuditLoggerModule, CacheModule.register(), ...CruxJwtModuleImports],
  exports: [RegistryMapper, RegistryService],
  controllers: [RegistryHttpController],
  providers: [
    RegistryService,
    PrismaService,
    RegistryMapper,
    TeamRepository,
    KratosService,
    EncryptionService,
    NotificationTemplateBuilder,
    RegistryWebSocketGateway,
    RegistryClientProvider,
    RegistryJwtStrategy,
    V2ManifestClient,
  ],
})
export default class RegistryModule {}
