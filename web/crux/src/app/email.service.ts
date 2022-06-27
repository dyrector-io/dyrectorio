import { Injectable, Logger } from '@nestjs/common'
import * as SendGrid from '@sendgrid/mail'
import { disassembleKratosRecoveryUrl } from 'src/domain/utils'

const FROM_EMAIL = process.env.FROM_EMAIL
const FROM_NAME = process.env.FROM_NAME
const SENDGRID_KEY = process.env.SENDGRID_KEY
const HOST = process.env.CRUX_UI_URL

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)

  constructor() {
    SendGrid.setApiKey(SENDGRID_KEY)
  }

  async sendInviteEmailToExistingUser(email: string, teamId: string, teamName: string): Promise<boolean> {
    const acceptLink = `${HOST}/teams/${teamId}/invite`

    /* eslint-disable */
    const emailMessage = {
      to: email,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `You're invited to a Team in dyrector.io`,
      text: `Hi, You are invited to join the Team ${teamName}, to accept click the following link: ${acceptLink}`,
      html: `<h2>Hi</h2>
      <p>You are invited to join the Team ${teamName}, to accept click the button below.</p>
      <a href="${acceptLink}" target="_blank">
      <button style="text-align:center; padding: 10px 30px; background-color: #02D0BF; border-radius: 4px; border: none; font-weight: 700; box-shadow: 1px 1px 10px #888888;">Accept</button></a><br>
      <p>If you can't open copy this to your browser: ${acceptLink}</p>`,
    }
    /* eslint-enable */

    try {
      await SendGrid.send(emailMessage)
    } catch (error) {
      this.logger.error(error)
      return false
    }

    return true
  }

  async sendInviteEmail(email: string, teamName: string, kratosRecoveryLink: string): Promise<boolean> {
    const inviteLink = disassembleKratosRecoveryUrl(HOST, kratosRecoveryLink)

    const emailMessage = {
      to: email,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `You're invited to a Team in dyrector.io`,
      text: `Hi, You are invited to join the Team ${teamName}, to accept click the following link: ${inviteLink}`,
      html: `<h2>Hi</h2>
      <p>You are invited to join the Team ${teamName}, to accept and create a dyrector.io account, click the button below.</p>
      <a href="${inviteLink}" target="_blank">
      <button style="text-align:center; padding: 10px 30px; background-color: #02D0BF; border-radius: 4px; border: none; font-weight: 700; box-shadow: 1px 1px 10px #888888;">Create account</button></a><br>
      <p>If you can't open copy this to your browser: ${inviteLink}</p>`,
    }

    try {
      await SendGrid.send(emailMessage)
    } catch (error) {
      this.logger.error(error)
      return false
    }

    return true
  }
}
