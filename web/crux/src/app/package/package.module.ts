import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import NodeModule from '../node/node.module'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import VersionModule from '../version/version.module'
import PackageHttpController from './package.http.controller'
import PackageMapper from './package.mapper'
import PackageService from './package.service'
import ProjectModule from '../project/project.module'

@Module({
  imports: [ProjectModule, VersionModule, TeamModule, NodeModule],
  exports: [],
  controllers: [PackageHttpController],
  providers: [PrismaService, PackageService, PackageMapper, TeamRepository],
})
export default class PackageModule {}
