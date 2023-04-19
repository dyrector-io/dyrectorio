import { Module } from '@nestjs/common'
import ContainerMapper from './container.mapper'
import SharedMapper from './shared.mapper'
import RecaptchaService from './recaptcha.service'

@Module({
  imports: [],
  exports: [ContainerMapper, SharedMapper, RecaptchaService],
  controllers: [],
  providers: [ContainerMapper, SharedMapper, RecaptchaService],
})
export default class SharedModule {}
