import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createTransport, SendMailOptions, Transporter } from 'nodemailer'
import { parseConnectionUrl } from 'nodemailer/lib/shared'
import SMTPConnection from 'nodemailer/lib/smtp-connection'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

@Injectable()
export default class EmailService {
  private readonly logger = new Logger(EmailService.name)

  private transporter: Transporter

  constructor(configService: ConfigService) {
    const transport = EmailService.smtpUriToTransport(configService.getOrThrow('SMTP_URI'))
    const defaults: SMTPTransport.Options = {
      from: {
        address: configService.get('FROM_EMAIL'),
        name: configService.get('FROM_NAME'),
      },
    }

    this.transporter = createTransport(transport, defaults)
  }

  async sendEmail(mail: SendMailOptions): Promise<boolean> {
    if (!mail) {
      return false
    }

    try {
      await this.transporter.sendMail(mail)
      return true
    } catch (err) {
      this.logger.error(err)
      return false
    }
  }

  private static smtpUriToTransport(uri: string): SMTPConnection.Options {
    const transport = parseConnectionUrl(uri)

    if (uri.toLowerCase().includes('skip_ssl_verify=true')) {
      transport.tls = {
        rejectUnauthorized: false,
      }
    }

    return transport
  }
}
