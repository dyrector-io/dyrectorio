import { Module } from '@nestjs/common'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import RegistryMapper from '../registry/registry.mapper'
import RegistryModule from '../registry/registry.module'
import TeamRepository from '../team/team.repository'
import ImageHttpController from './image.http.controller'
import ImageMapper from './image.mapper'
import ImageService from './image.service'
import EditorModule from '../editor/editor.module'

@Module({
  imports: [RegistryModule, EditorModule],
  exports: [ImageService, ImageMapper],
  providers: [
    PrismaService,
    ImageService,
    ImageMapper,
    InterceptorGrpcHelperProvider,
    TeamRepository,
    RegistryMapper,
    KratosService,
  ],
  controllers: [ImageHttpController],
})
export default class ImageModule {}
