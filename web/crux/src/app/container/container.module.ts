import { Module } from '@nestjs/common'
import ContainerMapper from './container.mapper'

@Module({
  imports: [],
  exports: [ContainerMapper],
  controllers: [],
  providers: [ContainerMapper],
})
export default class ContainerModule {}
