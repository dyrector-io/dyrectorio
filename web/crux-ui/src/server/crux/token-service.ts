import { Empty } from '@app/models/grpc/protobuf/proto/common'
import {
  CruxTokenClient,
  GenerateTokenRequest as ProtoGenerateTokenRequest,
  GenerateTokenResponse as ProtoGenerateTokenResponse,
  IdRequest,
  TokenListResponse,
} from '@app/models/grpc/protobuf/proto/crux'
import { GenerateTokenRequest, GenerateTokenResponse, Token } from '@app/models/token'
import { timestampToUTC } from '@app/utils'
import { protomisify } from '@server/crux/grpc-connection'

class DyoTokenService {
  constructor(private client: CruxTokenClient, private cookie: string) {}

  async getAll(): Promise<Token[]> {
    const response = await protomisify<Empty, TokenListResponse>(
      this.client,
      this.client.getTokenList,
      this.cookie,
    )(Empty, {})

    return response.data.map(it => ({
      ...it,
      createdAt: timestampToUTC(it.createdAt),
      expiresAt: timestampToUTC(it.expiresAt),
    }))
  }

  async generateToken(request: GenerateTokenRequest): Promise<GenerateTokenResponse> {
    const req: ProtoGenerateTokenRequest = {
      ...request,
    }

    const response = await protomisify<ProtoGenerateTokenRequest, ProtoGenerateTokenResponse>(
      this.client,
      this.client.generateToken,
      this.cookie,
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
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteToken, this.cookie)(IdRequest, req)
  }
}

export default DyoTokenService
