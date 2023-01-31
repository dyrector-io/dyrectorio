import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import VersionModule from '../version/version.module'
import ProductController from './product.controller'
import ProductMapper from './product.mapper'
import ProductService from './product.service'
import ProductHttpController from './product.http.controller'
import AuthModule from '../auth/auth.module'

@Module({
  imports: [VersionModule, TeamModule, AuthModule],
  exports: [ProductMapper, ProductService],
  controllers: [ProductController, ProductHttpController],
  providers: [PrismaService, ProductService, ProductMapper, InterceptorGrpcHelperProvider, TeamRepository],
})
export default class ProductModule {}
