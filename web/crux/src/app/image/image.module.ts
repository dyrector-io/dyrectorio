import { CacheModule } from '@nestjs/cache-manager'
import { forwardRef, Module } from '@nestjs/common'
import EncryptionService from 'src/services/encryption.service'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import ContainerModule from '../container/container.module'
import EditorModule from '../editor/editor.module'
import RegistryClientProvider from '../registry/registry-client.provider'
import RegistryMapper from '../registry/registry.mapper'
import RegistryModule from '../registry/registry.module'
import TeamRepository from '../team/team.repository'
import ImageHttpController from './image.http.controller'
import ImageMapper from './image.mapper'
import ImageService from './image.service'

@Module({
  imports: [RegistryModule, EditorModule, forwardRef(() => ContainerModule), AuditLoggerModule, CacheModule.register()],
  exports: [ImageService, ImageMapper],
  providers: [
    PrismaService,
    ImageService,
    ImageMapper,
    TeamRepository,
    RegistryMapper,
    KratosService,
    EncryptionService,
    RegistryClientProvider,
  ],
  controllers: [ImageHttpController],
})
export default class ImageModule {}
