import { generateNonce } from './utils'

export type PipelineTokenPayload = {
  sub: string // pipelineId
  nonce: string
}

export const generatePipelineToken = (pipelineId: string): PipelineTokenPayload => ({
  sub: pipelineId,
  nonce: generateNonce(),
})
