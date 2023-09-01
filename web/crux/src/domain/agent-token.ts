import { generateNonce } from './utils'

export type AgentLegacyToken = {
  sub: string
  iss: string
  iat: number
}

export type AgentTokenType = 'install' | 'connection'

const AGENT_TOKEN_VERSION = '0.1.0'

export type AgentToken = {
  sub: string
  iss: string
  iat: number
  nonce: string
  version: string
  type: AgentTokenType
}

export const generateAgentToken = (nodeId: string, type: AgentTokenType): AgentToken => {
  const now = new Date().getTime()

  const token: AgentToken = {
    iat: Math.floor(now / 1000),
    iss: undefined, // this gets filled by JwtService by the sign() call
    sub: nodeId,
    nonce: generateNonce(),
    version: AGENT_TOKEN_VERSION,
    type,
  }

  return token
}
