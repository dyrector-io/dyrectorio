import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import EncryptionService from 'src/services/encryption.service'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import RegistryClientProvider from './registry-client.provider'
import RegistryHttpController from './registry.http.controller'
import RegistryMapper from './registry.mapper'
import RegistryService from './registry.service'
import RegistryWebSocketGateway from './registry.ws.gateway'

@Module({
  imports: [HttpModule, TeamModule, AuditLoggerModule],
  exports: [RegistryMapper, RegistryService],
  controllers: [RegistryHttpController],
  providers: [
    RegistryService,
    PrismaService,
    RegistryMapper,
    TeamRepository,
    KratosService,
    EncryptionService,
    RegistryWebSocketGateway,
    RegistryClientProvider,
  ],
})
export default class RegistryModule {}
