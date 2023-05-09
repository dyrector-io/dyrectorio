import { Module } from '@nestjs/common'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import ContainerModule from '../container/container.module'
import EditorModule from '../editor/editor.module'
import RegistryMapper from '../registry/registry.mapper'
import RegistryModule from '../registry/registry.module'
import TeamRepository from '../team/team.repository'
import ImageEventService from './image.event.service'
import ImageHttpController from './image.http.controller'
import ImageMapper from './image.mapper'
import ImageService from './image.service'

@Module({
  imports: [RegistryModule, EditorModule, ContainerModule],
  exports: [ImageService, ImageMapper, ImageEventService],
  providers: [
    PrismaService,
    ImageService,
    ImageMapper,
    TeamRepository,
    RegistryMapper,
    KratosService,
    ImageEventService,
  ],
  controllers: [ImageHttpController],
})
export default class ImageModule {}
