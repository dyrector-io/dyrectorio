import { Injectable, Logger } from '@nestjs/common'
import * as SendGrid from '@sendgrid/mail'
import { MailDataRequired } from '@sendgrid/mail'

const { SENDGRID_KEY } = process.env

@Injectable()
export default class EmailService {
  private readonly logger = new Logger(EmailService.name)

  constructor() {
    SendGrid.setApiKey(SENDGRID_KEY)
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
