import { Handler, ServerSurfaceCall } from '@grpc/grpc-js/build/src/server-call'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { AccessRequest } from 'src/grpc/protobuf/proto/crux'

type GrpcCallLog = {
  userId: string
  serviceCall: string
  data: any
}

/**
 * Interceptor context unwrapper
 *
 */
@Injectable()
export class InterceptorGrpcHelperProvider {
  mapToGrpcObject(context: ExecutionContext): GrpcCallLog {
    const request = context.getArgByIndex<AccessRequest>(0)
    const surfaceCall = context.getArgByIndex<ServerSurfaceCall>(2)
    return this.mapServerCallToGrpcLog(request, surfaceCall)
  }

  mapServerCallToGrpcLog(request: AccessRequest, surfaceCall: ServerSurfaceCall): GrpcCallLog {
    const serverCall = surfaceCall as any as ServerCall
    const handler = serverCall.call.handler

    return {
      userId: request.accessedBy,
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
