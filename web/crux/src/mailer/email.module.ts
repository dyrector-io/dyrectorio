import { Module } from '@nestjs/common'
import EmailService from './email.service'

@Module({
  imports: [],
  controllers: [],
  providers: [EmailService],
})
class EmailModule {}

export default EmailModule
