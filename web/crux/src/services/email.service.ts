import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as SendGrid from '@sendgrid/mail'
import { MailDataRequired } from '@sendgrid/mail'

@Injectable()
export default class EmailService {
  private readonly logger = new Logger(EmailService.name)

  constructor(private configService: ConfigService) {
    SendGrid.setApiKey(configService.get<string>('SENDGRID_KEY'))
  }

  async sendEmail(item: MailDataRequired): Promise<boolean> {
    if (!item) {
      return false
    }

    try {
      await SendGrid.send(item)
      return true
    } catch (err) {
      this.logger.error(err)
      return false
    }
  }
}
