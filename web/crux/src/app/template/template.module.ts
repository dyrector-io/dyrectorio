import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import ProductModule from '../product/product.module'
import TemplateService from './template.service'
import TemplateController from './template.controller'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import TemplateFileService from 'src/services/template.file.service'

@Module({
  imports: [ProductModule, HttpModule],
  exports: [TemplateService],
  controllers: [TemplateController],
  providers: [
    TemplateService,
    InterceptorGrpcHelperProvider,
    PrismaService,
    TemplateFileService,
  ],
})
export default class TemplateModule {}
