import { Injectable } from "@nestjs/common";
import { disassembleKratosRecoveryUrl } from "src/domain/utils";
import { EmailItem } from "./email.service";

const HOST = process.env.CRUX_UI_URL
const sender = { email: process.env.FROM_EMAIL, name: process.env.FROM_NAME }

type InviteTemaple = {
    subject: string,
    text: string,
    html: string
}

@Injectable()
export class EmailBuilder {

    buildInviteEmail(email: string, teamName: string, teamId?: string, kratosRecoveryLink?: string): EmailItem | null {

        if (!teamId && !kratosRecoveryLink) {
            return null
        }

        const inviteTemplate = this.getInviteTemplate(teamName, teamId, kratosRecoveryLink)

        const emailItem: EmailItem = {
            sender:  sender,
            recipient: email,
            subject: inviteTemplate.subject,
            text: inviteTemplate.text,
            html: inviteTemplate.html
        }

        return emailItem;
    }

    private getInviteTemplate(teamName: string, teamId? : string, kratosRecoveryLink?: string): InviteTemaple {
        const link = teamId ? `${HOST}/teams/${teamId}/invite` : disassembleKratosRecoveryUrl(HOST, kratosRecoveryLink)
        const mode = teamId ? "to accept" : "to accept and create a dyrector.io account,"
        const button = teamId ? "Accept" : "Create account"
        
        const InviteTemplate: InviteTemaple = {
            subject: "You're invited to a Team in dyrector.io",
            text: `Hi, You are invited to join the Team ${teamName}, to accept click the following link: {link}`,
            html: `<h2>Hi</h2>
            <p>You are invited to join the Team ${teamName}, ${mode} click the button below.</p>
            <a href="${link}" target="_blank">
            <button style="text-align:center; margin: 10px; padding: 10px 30px; background-color: #02D0BF; border-radius: 4px; border: none; font-weight: 700; box-shadow: 1px 1px 10px #888888;">${button}</button></a><br>
            <p>If you can't open copy this to your browser: ${link}</p>`
        }

        return InviteTemplate;
    }

}


