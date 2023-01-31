export type Token = {
  id: string
  name: string
  createdAt: string
  expiresAt: string
}

export type GenerateTokenRequest = {
  name: string
  expirationInDays: number
}

export type GenerateTokenResponse = Token & {
  token: string
}
