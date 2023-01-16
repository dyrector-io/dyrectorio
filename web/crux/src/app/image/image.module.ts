import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import TeamRepository from '../team/team.repository'
import ImageController from './image.controller'
import ImageMapper from './image.mapper'
import ImageService from './image.service'
import RegistryMapper from '../registry/registry.mapper'
import ImageHttpController from './image.http.controller'

@Module({
  imports: [],
  exports: [ImageService, ImageMapper],
  providers: [PrismaService, ImageService, ImageMapper, InterceptorGrpcHelperProvider, TeamRepository, RegistryMapper],
  controllers: [ImageController, ImageHttpController],
})
export default class ImageModule {}
