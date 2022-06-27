import { Session } from '@ory/kratos-client'
import { internalError } from './error-middleware'

interface SendSessionResponseDto {
  code?: string
}

class Core {
  constructor(private url: string, private apiKey: string) {}

  private headers(headers?: any) {
    return {
      Authorization: this.apiKey,
      ...(headers ?? {}),
    }
  }

  private async post(endpoint: string, body: any): Promise<Response> {
    const res = await fetch(`${this.url}${endpoint}`, {
      method: 'POST',
      headers: this.headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(body),
    })

    if (!res.ok && res.status >= 500) {
      throw internalError(`Core request failed: POST ${this.url}${endpoint}`)
    }

    return res
  }

  private async delete(endpoint: string): Promise<Response> {
    const res = await fetch(`${this.url}${endpoint}`, {
      method: 'DELETE',
      headers: this.headers(),
    })

    return res
  }

  async postSession(
    session: Session,
  ): Promise<SendSessionResponseDto | 'not-verified' | 'user-not-found'> {
    const res = await this.post('/api/auth/hooks/sessions', session)

    if (!res.ok) {
      if (res.status === 403) {
        return 'not-verified'
      } else if (res.status === 404) {
        return 'user-not-found'
      } else {
        throw internalError(
          `Core request failed: POST sessions. Please check the core's logs.`,
        )
      }
    }

    return (await res.json()) as SendSessionResponseDto
  }

  async deleteSession(session: Session) {
    const res = await this.delete(`/api/auth/hooks/sessions/${session.id}`)

    if (!res.ok) {
      throw internalError(
        `Core request failed: DELETE sessions. Please check the core's logs.`,
      )
    }
  }

  codeExchangeUrl(code: string) {
    return `${this.url}/api/auth/code?authorization_code=${code}`
  }
}

const core = new Core(process.env.CORE_URL, process.env.CORE_API_KEY)

export default core
