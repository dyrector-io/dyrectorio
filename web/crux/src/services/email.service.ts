import { Injectable, Logger } from '@nestjs/common'
import * as SendGrid from '@sendgrid/mail'
import { disassembleKratosRecoveryUrl } from 'src/domain/utils'

const SENDGRID_KEY = process.env.SENDGRID_KEY
const HOST = process.env.CRUX_UI_URL

export type EmailItem =  {
  sender: { email: string, name: string} ;
  recipient: string;
  subject: string,
  text: string,
  html: string
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)

  constructor() {
    SendGrid.setApiKey(SENDGRID_KEY)
  }

  async sendEmailAsync(item: EmailItem): Promise<boolean> {

    if (!item) {
      return false;
    }

    const email: SendGrid.MailDataRequired = {
      from: item.sender,
      to: item.recipient,
      subject: item.subject,
      text: item.text,
      html: item.html
    }

    try {
      await SendGrid.send(email);
      return true;
    } 
    catch (ex) {
      this.logger.error(ex);
      return false;
    }
  }
}
