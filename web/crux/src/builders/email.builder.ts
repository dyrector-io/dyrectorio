import { ISendMailOptions } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { KratosInvitation } from 'src/domain/identity'
import NotificationTemplateBuilder from './notification.template.builder'

type InviteTemplate = {
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

  constructor(configService: ConfigService, private templateBuilder: NotificationTemplateBuilder) {
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

  private getInviteTemplate(options: InviteTemplateOptions): InviteTemplate {
    const { teamId, teamName, invitation: kratosInvitation } = options

    const templateData = {
      teamName,
      kratos: !!kratosInvitation,
      link: kratosInvitation
        ? `${this.host}/auth/create-account?flow=${kratosInvitation.flow}&code=${kratosInvitation.code}&team=${teamId}`
        : `${this.host}/teams/${teamId}/invitation`,
    }

    return this.templateBuilder.processTemplate('email', 'team-invite', templateData) as InviteTemplate
  }
}
