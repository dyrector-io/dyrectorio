import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import KratosService from 'src/services/kratos.service'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import VersionModule from '../version/version.module'
import ProductMapper from './product.mapper'
import ProductService from './product.service'
import ProductHttpController from './product.http.controller'
import TokenModule from '../token/token.module'
import SharedModule from '../shared/shared.module'

@Module({
  imports: [VersionModule, TeamModule, TokenModule, SharedModule],
  exports: [ProductMapper, ProductService],
  controllers: [ProductHttpController],
  providers: [PrismaService, ProductService, ProductMapper, TeamRepository, KratosService],
})
export default class ProductModule {}
