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

  async getAndDelete(filters?: MailFilterOptions): Promise<Mail> {
    const res = await fetch(`${this.url}/mail`)
    const body = (await res.json()) as {
      mailItems: Mail[]
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

    return emails.length > 0 ? emails[0] : null
  }
}

export default MailSlurper
