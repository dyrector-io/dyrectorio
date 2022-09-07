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

  private statusChannel = new Subject<NodeConnectionStatus>()

  readonly jwt: string

  readonly address: string

  private token: AgentToken

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
