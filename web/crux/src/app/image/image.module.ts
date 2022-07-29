import { Module } from '@nestjs/common'
import { PrismaService } from 'src/services/prisma.service'
import { InterceptorGrpcHelperProvider } from 'src/interceptors/helper.interceptor'
import { TeamRepository } from '../team/team.repository'
import { ImageController } from './image.controller'
import { ImageMapper } from './image.mapper'
import { ImageService } from './image.service'

@Module({
  imports: [],
  exports: [ImageService, ImageMapper],
  controllers: [ImageController],
  providers: [PrismaService, ImageService, ImageMapper, InterceptorGrpcHelperProvider, TeamRepository],
})
export class ImageModule {}
