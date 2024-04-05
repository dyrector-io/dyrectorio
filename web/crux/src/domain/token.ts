import { JwtSignOptions } from '@nestjs/jwt'
import { Identity } from '@ory/kratos-client'

export type JwtTokenPayload = {
  nonce: string
}

export type DeploymentTokenPayload = JwtTokenPayload & {
  deploymentId: string
}

export type JwtToken = (JwtTokenPayload | DeploymentTokenPayload) & {
  exp: number
  iss: string
  iat: number
  sub: string
}

export const tokenSignOptionsFor = (identity: Identity, expiration: Date | null): JwtSignOptions => {
  const options: JwtSignOptions = {
    subject: identity.id,
  }

  if (expiration) {
    options.expiresIn = Math.floor(expiration.getTime() / 1000)
  }

  return options
}
