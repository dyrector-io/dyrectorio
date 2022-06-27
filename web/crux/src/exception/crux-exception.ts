import { Status } from '@grpc/grpc-js/build/src/constants'
import { RpcException } from '@nestjs/microservices'

export type BaseGrpcExceptionOptions = {
  status: Status
  message: string
}

export class BaseGrpcException extends RpcException {
  constructor(error: BaseGrpcExceptionOptions) {
    super(BaseGrpcException.formatMessage(error))
  }

  private static formatMessage(error: BaseGrpcExceptionOptions) {
    const { status, message, ...props } = error

    return {
      code: status,
      message: JSON.stringify({
        message,
        details: props ? props : undefined,
      }),
    }
  }
}
