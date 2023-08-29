import { Metadata } from '@grpc/grpc-js'
import { HandlerType, ServerSurfaceCall } from '@grpc/grpc-js/build/src/server-call'
import { JwtService } from '@nestjs/jwt'
import { Observable, Subject } from 'rxjs'
import { NodeConnectionStatus } from 'src/app/node/node.dto'
import { AgentToken } from 'src/domain/agent-token'
import { CruxBadRequestException } from 'src/exception/crux-exception'

const nestjsClientStreamEndCallWorkaround = () => {}
export default class GrpcNodeConnection {
  public static META_NODE_TOKEN = 'dyo-node-token'

  public static META_DEPLOYMENT_ID = 'dyo-deployment-id'

  public static META_FILTER_PREFIX = 'dyo-filter-prefix'

  public static META_CONTAINER_PREFIX = 'dyo-container-prefix'

  public static META_CONTAINER_NAME = 'dyo-container-name'

  private statusChannel = new Subject<NodeConnectionStatus>()

  private token: AgentToken

  private signedToken: string

  get jwt(): string {
    return this.signedToken
  }

  readonly address: string

  readonly connectedAt = new Date()

  get nodeId() {
    return this.token.sub
  }

  constructor(
    public readonly metadata: Metadata,
    private call: NodeGrpcCall,
  ) {
    if (call.call.handler.type === 'clientStream' && !call.end) {
      // TODO(@m8vago): nestjs tries to call end() on a ServerReadableStream, when the client
      // cancels the call, but ServerReadableStream does not have one.
      // We should open an issue to them probably.

      call.end = nestjsClientStreamEndCallWorkaround
    }

    this.signedToken = this.getStringMetadataOrThrow(GrpcNodeConnection.META_NODE_TOKEN)

    const xRealIp = this.getFirstItemOfStringArrayMetadata('x-real-ip')
    const xForwarderFor = this.getFirstItemOfStringArrayMetadata('x-forwarded-for')

    this.address = xRealIp ?? xForwarderFor ?? call.getPeer()

    call.connection = this
    call.on('close', () => this.onClose())
  }

  verify(jwtService: JwtService): boolean {
    try {
      this.token = jwtService.verify(this.jwt)
      return true
    } catch {
      return false
    }
  }

  status(): Observable<NodeConnectionStatus> {
    return this.statusChannel.asObservable()
  }

  getStringMetadataOrThrow(key: string): string {
    const value = this.metadata.getMap()[key]
    if (typeof value !== 'string') {
      throw new CruxBadRequestException({
        message: 'Missing metadata.',
        property: key,
      })
    }

    return value
  }

  getStringMetadata(key: string): string | null {
    const map = this.metadata.getMap()
    const value = map[key]
    if (!value) {
      return null
    }

    if (typeof value !== 'string') {
      throw new CruxBadRequestException({
        message: 'Invalid metadata.',
        property: key,
      })
    }

    return value
  }

  onTokenReplaced(token: AgentToken, signedToken: string) {
    this.token = token
    this.signedToken = signedToken
  }

  private onClose() {
    this.statusChannel.next('unreachable')

    this.call.removeAllListeners()
    this.statusChannel.complete()
    this.call.connection = null
  }

  private getFirstItemOfStringArrayMetadata(key: string): string | null {
    const value = this.metadata.get(key)
    if (!value || value.length < 1) {
      return null
    }

    return value[0] as string
  }
}

export type NodeGrpcCall = ServerSurfaceCall & {
  connection: GrpcNodeConnection
  call: {
    handler: {
      type: HandlerType
    }
  }
  end?: VoidFunction
}
