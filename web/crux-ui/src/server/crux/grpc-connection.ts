import { GRPC_STREAM_RECONNECT_TIMEOUT } from '@app/const'
import { Logger } from '@app/logger'
import grpc, { Metadata, StatusObject } from '@grpc/grpc-js'
import { Status } from '@grpc/grpc-js/build/src/constants'
import { fromGrpcError, parseGrpcError } from '@server/error-middleware'
import { promisify } from 'util'

export type ProtoSubscriptionOptions<O extends object> = {
  onMessage: (data: O) => void
  onError?: (error: grpc.ServiceError) => void
  onClose?: () => void
}

export class GrpcConnection<I, O extends object> {
  private stream: grpc.ClientReadableStream<I>

  private connecting = false

  private reconnecting = 0

  private lastConnectionAttempt = 0

  constructor(
    private readonly logger: Logger,
    private readonly call: () => grpc.ClientReadableStream<I>,
    private readonly transform: (data: I) => O,
    private readonly options: ProtoSubscriptionOptions<O>,
  ) {
    this.connect()
  }

  connect() {
    if (this.stream || this.connecting) {
      this.logger.verbose('Grpc connecting skipped')
      return
    }

    this.logger.debug('Grpc connecting')

    this.connecting = true
    this.lastConnectionAttempt = Date.now()

    this.stream = this.call()

    const onData = it => this.onData(it)
    const onStatus = it => this.onStatus(it)
    const onError = it => this.onError(it)
    const onEnd = () => this.onEnd()

    this.stream.on('data', onData)
    this.stream.on('status', onStatus)
    this.stream.on('error', onError)
    this.stream.on('end', onEnd)

    // There is no onOpen event on the stream
    // TODO (@m8vago): remove this hack and find a better solution, check nest.js's implementation
    setTimeout(() => {
      if (this.stream && !this.stream.destroyed) {
        if (!this.connecting) {
          this.onDisconnected()
          return
        }

        this.connecting = false
        this.reconnecting = 0
        this.logger.info(`Grpc connected on ${this.stream.getPeer()}`)
      }
    }, 100)
  }

  cancel() {
    this.logger.verbose('Grpc canceled')

    this.reconnecting = -1
    this.connecting = false
    this.stream?.cancel()
    this.stream?.destroy()
  }

  private onData(data: I) {
    this.logger.verbose('Grpc message', JSON.stringify(data, null, 2))

    const message = this.transform(data)
    this.options.onMessage(message)
  }

  private onStatus(status: StatusObject) {
    this.logger.debug('Grpc status', status)

    if (status.code === Status.UNAVAILABLE) {
      this.onDisconnected()
    }
  }

  private onError(err: grpc.ServiceError) {
    this.logger.debug('Grpc error', err)

    this.options.onError?.call(null, err)
  }

  private onEnd() {
    this.logger.debug('Grpc closed')

    this.options.onClose?.call(null)
    this.onDisconnected()
  }

  private onDisconnected() {
    this.stream.removeAllListeners()
    this.stream.destroy()
    this.stream = null

    if (this.reconnecting < 1) {
      this.logger.info('Grpc disconnected')

      if (this.reconnecting < 0) {
        return
      }
      this.logger.info('Grpc reconnecting...')
    }

    const reconnect = () => {
      this.connecting = false
      this.reconnecting += 1
      this.connect()
    }

    const elapsed = Date.now() - this.lastConnectionAttempt

    if (elapsed > GRPC_STREAM_RECONNECT_TIMEOUT) {
      reconnect()
      return
    }

    setTimeout(() => {
      if (this.reconnecting > -1) {
        reconnect()
      }
    }, GRPC_STREAM_RECONNECT_TIMEOUT - elapsed)
  }
}

export const createProtoMetadata = (cookie?: string) => {
  const meta = new Metadata()
  if (cookie) {
    meta.add('cookie', cookie)
  }
  return meta
}

type GrpcCall<Req, Res> = (
  request: Req,
  metadata: Metadata,
  callback: (error: grpc.ServiceError | null, response: Res) => void,
) => grpc.ClientUnaryCall

type GrpcSerializer<T> = {
  fromJSON: (object: any) => T
}

export const protomisify =
  <Req, Res>(
    client: grpc.Client,
    grpcCall: GrpcCall<Req, Res>,
    cookie?: string,
  ): ((serializer: GrpcSerializer<Req>, request: Req) => Promise<Res>) =>
  async (serializer, request) => {
    try {
      const req = serializer.fromJSON(request)
      const meta = createProtoMetadata(cookie)

      const res = await promisify<Req, Metadata, Res>(grpcCall).call(client, req, meta)
      return res
    } catch (err) {
      const error = parseGrpcError(err)
      throw fromGrpcError(error)
    }
  }
