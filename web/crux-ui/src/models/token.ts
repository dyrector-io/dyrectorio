export class SimpleToken {
  id: string

  name: string

  expiresAt: string

  createdAt: string
}

export class TokenList {
  data: SimpleToken[]
}

export class GenerateToken {
  name: string

  expirationInDays: number
}

export class Token extends SimpleToken {
  token: string
}
