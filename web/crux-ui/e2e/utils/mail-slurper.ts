import { MAILSLURPER_TIMEOUT } from './common'

// further info: https://github.com/mailslurper/mailslurper/wiki/Email-Endpoints
type Mail = {
  id: string
  subject: string
  body: string
  toAddresses: string[]
}

type MailFilterOptions = {
  subject?: string
  toAddress?: string
}

class MailSlurper {
  constructor(private url: string) {}

  async getMail(filters?: MailFilterOptions, timeout: number = MAILSLURPER_TIMEOUT): Promise<Mail> {
    const startedAt = new Date().getTime()
    const result: Mail = null

    const timeoutReached = () => {
      const now = new Date().getTime()
      return now - startedAt >= timeout
    }

    while (!result) {
      if (timeoutReached()) {
        throw new Error('Mailslurper timeout reached')
      }

      const res = await fetch(`${this.url}/mail`)
      if (!res.ok) {
        throw new Error('Failed to get mails from Mailslurper')
      }

      const body = (await res.json()) as {
        mailItems: Mail[]
        totalRecords: number
      }

      if (body.totalRecords < 1) {
        continue
      }

      let emails = body.mailItems
      if (filters) {
        if (filters.subject) {
          emails = emails.filter(it => it.subject.startsWith(filters.subject))
        }

        if (filters.toAddress) {
          emails = emails.filter(it => it.toAddresses.includes(filters.toAddress))
        }
      }

      if (emails.length > 0) {
        return emails[0]
      }
    }
  }
}

export default MailSlurper
