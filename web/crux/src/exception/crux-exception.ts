import { Status } from '@grpc/grpc-js/build/src/constants'
import { RpcException } from '@nestjs/microservices'

export type BaseGrpcExceptionOptions = {
  status: Status
  message: string
}

export default class BaseGrpcException extends RpcException {
  public readonly details: BaseGrpcExceptionOptions

  constructor(error: BaseGrpcExceptionOptions) {
    super(BaseGrpcException.formatMessage(error))
    this.details = error
  }

  private static formatMessage(error: BaseGrpcExceptionOptions) {
    const { status, message, ...props } = error

    return {
      code: status,
      message: JSON.stringify({
        message,
        details: props ?? undefined,
      }),
    }
  }
}
