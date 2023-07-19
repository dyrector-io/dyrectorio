import { DeploymentTokenPayload } from './deployment-token'

export type UserTokenPayload = {
  sub: string
  nonce: string
}

export type JwtToken = {
  exp: number
  iss: string
  iat: number
  data: UserTokenPayload | DeploymentTokenPayload
}
