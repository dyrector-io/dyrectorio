import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export default class EmailService {
  private readonly logger = new Logger(EmailService.name)

  constructor(private mailer: MailerService) {}

  async sendEmail(mail: ISendMailOptions): Promise<boolean> {
    if (!mail) {
      return false
    }

    try {
      await this.mailer.sendMail(mail)
      return true
    } catch (error) {
      this.logger.error(err)
      return false
    }
  }
}
