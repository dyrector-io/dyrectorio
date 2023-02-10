import { Empty } from '@app/models/grpc/protobuf/proto/common'
import {
  AccessRequest,
  CruxTokenClient,
  GenerateTokenRequest as ProtoGenerateTokenRequest,
  GenerateTokenResponse as ProtoGenerateTokenResponse,
  IdRequest,
  TokenListResponse,
} from '@app/models/grpc/protobuf/proto/crux'
import { GenerateTokenRequest, GenerateTokenResponse, Token } from '@app/models/token'
import { timestampToUTC } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { protomisify } from '@server/crux/grpc-connection'

class DyoTokenService {
  constructor(private client: CruxTokenClient, private identity: Identity) {}

  async getAll(): Promise<Token[]> {
    const req: AccessRequest = {
      accessedBy: this.identity.id,
    }

    const response = await protomisify<AccessRequest, TokenListResponse>(this.client, this.client.getTokenList)(
      AccessRequest,
      req,
    )

    return response.data.map(it => ({
      ...it,
      createdAt: timestampToUTC(it.createdAt),
      expiresAt: timestampToUTC(it.expiresAt),
    }))
  }

  async generateToken(request: GenerateTokenRequest): Promise<GenerateTokenResponse> {
    const req: ProtoGenerateTokenRequest = {
      accessedBy: this.identity.id,
      ...request,
    }

    const response = await protomisify<AccessRequest, ProtoGenerateTokenResponse>(
      this.client,
      this.client.generateToken,
    )(ProtoGenerateTokenRequest, req)

    return {
      ...response,
      createdAt: timestampToUTC(response.createdAt),
      expiresAt: timestampToUTC(response.expiresAt),
    }
  }

  async delete(id: string) {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteToken)(IdRequest, req)
  }
}

export default DyoTokenService
