import { Metadata } from '@grpc/grpc-js'
import { HandlerType, ServerSurfaceCall } from '@grpc/grpc-js/build/src/server-call'
import { JwtService } from '@nestjs/jwt'
import { Observable, Subject } from 'rxjs'
import { NodeConnectionStatus } from 'src/app/shared/shared.dto'
import { AgentToken } from 'src/domain/agent'
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

  readonly jwt: string

  readonly address: string

  readonly connectedAt = new Date()

  get nodeId() {
    return this.token.sub
  }

  constructor(public readonly metadata: Metadata, private call: NodeGrpcCall) {
    if (call.call.handler.type === 'clientStream' && !call.end) {
      // TODO(@m8vago): nestjs tries to call end() on a ServerReadableStream, when the client
      // cancels the call, but ServerReadableStream does not have one.
      // We should open an issue to them probably.

      call.end = nestjsClientStreamEndCallWorkaround
    }

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
      throw new CruxBadRequestException({
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
        throw new CruxBadRequestException({
          message: 'Missing metadata.',
          property: key,
        })
      }

      return value
    }

    return undefined
  }

  private onClose() {
    this.statusChannel.next('unreachable')

    this.call.removeAllListeners()
    this.statusChannel.complete()
    this.call.connection = null
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
