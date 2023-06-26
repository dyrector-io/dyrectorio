export type TokenExpiration = number | 'never'

export class Token {
  id: string

  name: string

  expiresAt: string

  createdAt: string
}

export class GenerateToken {
  name: string

  expirationInDays: TokenExpiration
}

export class GeneratedToken extends Token {
  token: string
}
