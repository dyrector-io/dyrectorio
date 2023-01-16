import { ISendMailOptions } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { KratosInvitation } from 'src/shared/models'

type InviteTemaple = {
  subject: string
  text: string
  html: string
}

export type InviteTemplateOptions = {
  teamId: string
  teamName: string
  invitation?: KratosInvitation
}

@Injectable()
export default class EmailBuilder {
  private host: string

  constructor(configService: ConfigService) {
    this.host = configService.get<string>('CRUX_UI_URL')
  }

  buildInviteEmail(to: string, options: InviteTemplateOptions): ISendMailOptions {
    const inviteTemplate = this.getInviteTemplate(options)

    const emailItem: ISendMailOptions = {
      to,
      subject: inviteTemplate.subject,
      text: inviteTemplate.text,
      html: inviteTemplate.html,
    }

    return emailItem
  }

  private getInviteTemplate(options: InviteTemplateOptions): InviteTemaple {
    const { teamId, teamName, invitation: kratosInvitation } = options

    let link = `${this.host}/teams/${teamId}/invitation`
    let mode = 'to accept'
    let button = 'Accept'

    if (kratosInvitation) {
      const { flow, code } = kratosInvitation

      link = `${this.host}/auth/create-account?flow=${flow}&code=${code}&team=${teamId}`
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
