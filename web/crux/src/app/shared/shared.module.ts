import { Module } from '@nestjs/common'
import ContainerMapper from './container.mapper'
import SharedMapper from './shared.mapper'

@Module({
  imports: [],
  exports: [ContainerMapper, SharedMapper],
  controllers: [],
  providers: [ContainerMapper, SharedMapper],
})
export default class SharedModule {}
