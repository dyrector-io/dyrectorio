import { MailerModule } from '@nestjs-modules/mailer'
import { TransportType } from '@nestjs-modules/mailer/dist/interfaces/mailer-options.interface'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { parseConnectionUrl } from 'nodemailer/lib/shared'
import EmailService from './email.service'

const smtpUriToTransport = (uri: string): TransportType => {
  const transport = parseConnectionUrl(uri)

  if (uri.toLowerCase().includes('skip_ssl_verify=true')) {
    transport.tls = {
      rejectUnauthorized: false,
    }
  }

  return transport
}

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: smtpUriToTransport(configService.getOrThrow('SMTP_URI')),
        defaults: {
          from: {
            address: configService.get('FROM_EMAIL'),
            name: configService.get('FROM_NAME'),
          },
        },
        // TODO (@m8vago): templates
        // https://github.com/yanarp/nestjs-mailer
        // template:
      }),
    }),
  ],
  controllers: [],
  providers: [EmailService],
})
class EmailModule {}

export default EmailModule
