import { Metadata, ServerUnaryCall } from '@grpc/grpc-js'
import { JwtService } from '@nestjs/jwt'
import { Observable, Subject } from 'rxjs'
import { AgentToken } from 'src/domain/agent'
import { InvalidArgumentException } from 'src/exception/errors'
import { NodeConnectionStatus } from 'src/grpc/protobuf/proto/crux'

export default class GrpcNodeConnection {
  public static META_NODE_TOKEN = 'dyo-node-token'

  public static META_DEPLOYMENT_ID = 'dyo-deployment-id'

  public static META_FILTER_PREFIX = 'dyo-filter-prefix'

  public static META_CONTAINER_ID = 'dyo-container-id'

  public static META_PREFIX = 'dyo-prefix'

  private statusChannel = new Subject<NodeConnectionStatus>()

  private token: AgentToken

  readonly jwt: string

  readonly address: string

  readonly connectedAt = new Date()

  get nodeId() {
    return this.token.sub
  }

  constructor(public readonly metadata: Metadata, private call: NodeUnaryCall) {
    this.jwt = this.getMetaData(GrpcNodeConnection.META_NODE_TOKEN)
    this.address = call.getPeer()

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

  getMetaData(key: string): string {
    const value = this.metadata.getMap()[key]
    if (typeof value !== 'string') {
      throw new InvalidArgumentException({
        message: 'Missing metadata.',
        property: key,
      })
    }

    return value
  }

  getMetaDataOrDefault(key: string): string {
    const map = this.metadata.getMap()
    if (key in map) {
      const value = map[key]
      if (typeof value !== 'string') {
        throw new InvalidArgumentException({
          message: 'Missing metadata.',
          property: key,
        })
      }

      return value
    }

    return undefined
  }

  private onClose() {
    this.statusChannel.next(NodeConnectionStatus.UNREACHABLE)

    this.call.removeAllListeners()
    this.statusChannel.complete()
    this.call.connection = null
  }
}

export type NodeUnaryCall = ServerUnaryCall<any, any> & {
  connection: GrpcNodeConnection
}
