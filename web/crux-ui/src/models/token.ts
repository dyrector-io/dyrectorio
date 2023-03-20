export class Token {
  id: string

  name: string

  expiresAt: string

  createdAt: string
}

export class GenerateToken {
  name: string

  expirationInDays: number
}

export class GeneratedToken extends Token {
  token: string
}
