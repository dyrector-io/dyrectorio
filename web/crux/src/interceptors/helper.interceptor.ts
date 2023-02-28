import { Handler, ServerSurfaceCall } from '@grpc/grpc-js/build/src/server-call'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { getIdentity } from './grpc.user.interceptor'

type GrpcCallLog = {
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
    const surfaceCall = context.getArgByIndex<ServerSurfaceCall>(2)
    return this.mapServerCallToGrpcLog(request, surfaceCall)
  }

  mapServerCallToGrpcLog(request: any, surfaceCall: ServerSurfaceCall): GrpcCallLog {
    const serverCall = surfaceCall as any as ServerCall
    const { handler } = serverCall.call

    const identity = getIdentity(surfaceCall.metadata)

    return {
      userId: identity?.id,
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
