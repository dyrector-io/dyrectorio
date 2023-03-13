import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import KratosService from 'src/services/kratos.service'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import VersionModule from '../version/version.module'
import ProductMapper from './product.mapper'
import ProductService from './product.service'
import ProductHttpController from './product.http.controller'
import TokenModule from '../token/token.module'

@Module({
  imports: [VersionModule, TeamModule, TokenModule],
  exports: [ProductMapper, ProductService],
  controllers: [ProductHttpController],
  providers: [
    PrismaService,
    ProductService,
    ProductMapper,
    InterceptorGrpcHelperProvider,
    TeamRepository,
    KratosService,
  ],
})
export default class ProductModule {}
