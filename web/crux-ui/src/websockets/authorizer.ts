import { Identity } from '@ory/kratos-client'
import { randomUUID } from 'crypto'

type AuthorizationEntry = {
  expiration: Date
  identity: Identity
}

class WsAuthorizer {
  private static EXPIRATION = 5000 // millis

  private pendingTokens: Map<string, AuthorizationEntry> = new Map()

  generate(identity: Identity): string {
    const token = randomUUID()
    this.pendingTokens.set(token, {
      identity,
      expiration: new Date(),
    })
    return token
  }

  exchange(token: string): Identity {
    this.clearExpired()

    return this.pendingTokens.get(token)?.identity
  }

  private clearExpired() {
    const now = Date.now()
    const expired: Array<string> = []
    this.pendingTokens.forEach((value, key) => {
      if (now - value.expiration.getTime() >= WsAuthorizer.EXPIRATION) {
        expired.push(key)
      }
    })

    expired.forEach(it => this.pendingTokens.delete(it))
  }
}

export default WsAuthorizer
