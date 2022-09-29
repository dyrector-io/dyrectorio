import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MailDataRequired } from '@sendgrid/mail'
import { disassembleKratosRecoveryUrl } from 'src/domain/utils'
import { EmailBuilderException } from 'src/exception/errors'

type InviteTemaple = {
  subject: string
  text: string
  html: string
}

@Injectable()
export default class EmailBuilder {
  private host: string

  private from: { email: string; name: string }

  constructor(private configService: ConfigService) {
    this.host = configService.get<string>('CRUX_UI_URL')
    this.from = {
      email: configService.get<string>('FROM_EMAIL'),
      name: configService.get<string>('FROM_NAME'),
    }
  }

  buildInviteEmail(email: string, teamName: string, teamId?: string, kratosRecoveryLink?: string): MailDataRequired {
    if (!teamId && !kratosRecoveryLink) {
      throw new EmailBuilderException()
    }

    const inviteTemplate = this.getInviteTemplate(teamName, teamId, kratosRecoveryLink)

    const emailItem: MailDataRequired = {
      from: this.from,
      to: email,
      subject: inviteTemplate.subject,
      text: inviteTemplate.text,
      html: inviteTemplate.html,
    }

    return emailItem
  }

  private getInviteTemplate(teamName: string, teamId?: string, kratosRecoveryLink?: string): InviteTemaple {
    let link = `${this.host}/teams/${teamId}/invite`
    let mode = 'to accept'
    let button = 'Accept'

    if (kratosRecoveryLink) {
      link = disassembleKratosRecoveryUrl(this.host, kratosRecoveryLink)
      mode = 'to accept and create a dyrector.io account,'
      button = 'Create account'
    }

    const InviteTemplate: InviteTemaple = {
      subject: "You're invited to a Team in dyrector.io",
      text: `Hi, You are invited to join the Team ${teamName}, to accept click the following link: {link}`,
      html: `<h2>Hi</h2>
            <p>You are invited to join the Team ${teamName}, ${mode} click the button below.</p>
            <a href="${link}" target="_blank">
            <button style="text-align:center; margin: 10px; padding: 10px 30px; background-color: #02D0BF; border-radius: 4px; border: none; font-weight: 700; box-shadow: 1px 1px 10px #888888;">${button}</button></a><br>
            <p>If you can't open copy this to your browser: ${link}</p>`,
    }

    return InviteTemplate
  }
}
