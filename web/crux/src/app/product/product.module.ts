import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import VersionModule from '../version/version.module'
import ProductController from './product.controller'
import ProductMapper from './product.mapper'
import ProductService from './product.service'

@Module({
  imports: [VersionModule, TeamModule],
  exports: [ProductMapper, ProductService],
  controllers: [ProductController],
  providers: [PrismaService, ProductService, ProductMapper, InterceptorGrpcHelperProvider, TeamRepository],
})
export default class ProductModule {}
