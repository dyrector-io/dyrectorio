import { Handler, ServerSurfaceCall } from '@grpc/grpc-js/build/src/server-call'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'

export type GrpcCallLog = {
  userId: string
  serviceCall: string
  data: any
}

/**
 * Utility methods for logging and transforming gRPC-related data
 */
@Injectable()
export default class InterceptorGrpcHelperProvider {
  mapToGrpcObject(context: ExecutionContext): GrpcCallLog {
    const request = context.getArgByIndex(0)
    const surfaceCall = context.getArgByIndex<IdentityAwareServerSurfaceCall>(2)
    return this.mapServerCallToGrpcLog(request, surfaceCall)
  }

  mapServerCallToGrpcLog(request: any, surfaceCall: IdentityAwareServerSurfaceCall): GrpcCallLog {
    const serverCall = surfaceCall as any as ServerCall
    const { handler } = serverCall.call

    return {
      userId: surfaceCall.user?.id,
      serviceCall: handler.path,
      data: request,
    }
  }
}

type ServerCall = {
  call: ServerCallStream
}

type ServerCallStream = {
  handler: Handler<any, any>
}

type IdentityAwareServerSurfaceCall = ServerSurfaceCall & {
  user: Identity
}
