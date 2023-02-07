/* eslint-disable */
import { Metadata } from '@grpc/grpc-js'
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices'
import { Observable } from 'rxjs'

export const protobufPackage = 'grpc.health.v1'

export interface HealthCheckRequest {
  service: string
}

export interface HealthCheckResponse {
  status: HealthCheckResponse_ServingStatus
}

export enum HealthCheckResponse_ServingStatus {
  UNKNOWN = 0,
  SERVING = 1,
  NOT_SERVING = 2,
  /** SERVICE_UNKNOWN - Used only by the Watch method. */
  SERVICE_UNKNOWN = 3,
  UNRECOGNIZED = -1,
}

export function healthCheckResponse_ServingStatusFromJSON(object: any): HealthCheckResponse_ServingStatus {
  switch (object) {
    case 0:
    case 'UNKNOWN':
      return HealthCheckResponse_ServingStatus.UNKNOWN
    case 1:
    case 'SERVING':
      return HealthCheckResponse_ServingStatus.SERVING
    case 2:
    case 'NOT_SERVING':
      return HealthCheckResponse_ServingStatus.NOT_SERVING
    case 3:
    case 'SERVICE_UNKNOWN':
      return HealthCheckResponse_ServingStatus.SERVICE_UNKNOWN
    case -1:
    case 'UNRECOGNIZED':
    default:
      return HealthCheckResponse_ServingStatus.UNRECOGNIZED
  }
}

export function healthCheckResponse_ServingStatusToJSON(object: HealthCheckResponse_ServingStatus): string {
  switch (object) {
    case HealthCheckResponse_ServingStatus.UNKNOWN:
      return 'UNKNOWN'
    case HealthCheckResponse_ServingStatus.SERVING:
      return 'SERVING'
    case HealthCheckResponse_ServingStatus.NOT_SERVING:
      return 'NOT_SERVING'
    case HealthCheckResponse_ServingStatus.SERVICE_UNKNOWN:
      return 'SERVICE_UNKNOWN'
    case HealthCheckResponse_ServingStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export const GRPC_HEALTH_V1_PACKAGE_NAME = 'grpc.health.v1'

function createBaseHealthCheckRequest(): HealthCheckRequest {
  return { service: '' }
}

export const HealthCheckRequest = {
  fromJSON(object: any): HealthCheckRequest {
    return { service: isSet(object.service) ? String(object.service) : '' }
  },

  toJSON(message: HealthCheckRequest): unknown {
    const obj: any = {}
    message.service !== undefined && (obj.service = message.service)
    return obj
  },
}

function createBaseHealthCheckResponse(): HealthCheckResponse {
  return { status: 0 }
}

export const HealthCheckResponse = {
  fromJSON(object: any): HealthCheckResponse {
    return { status: isSet(object.status) ? healthCheckResponse_ServingStatusFromJSON(object.status) : 0 }
  },

  toJSON(message: HealthCheckResponse): unknown {
    const obj: any = {}
    message.status !== undefined && (obj.status = healthCheckResponse_ServingStatusToJSON(message.status))
    return obj
  },
}

export interface HealthClient {
  check(request: HealthCheckRequest, metadata: Metadata, ...rest: any): Observable<HealthCheckResponse>

  watch(request: HealthCheckRequest, metadata: Metadata, ...rest: any): Observable<HealthCheckResponse>
}

export interface HealthController {
  check(
    request: HealthCheckRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<HealthCheckResponse> | Observable<HealthCheckResponse> | HealthCheckResponse

  watch(request: HealthCheckRequest, metadata: Metadata, ...rest: any): Observable<HealthCheckResponse>
}

export function HealthControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['check', 'watch']
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('Health', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = []
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcStreamMethod('Health', method)(constructor.prototype[method], method, descriptor)
    }
  }
}

export const HEALTH_SERVICE_NAME = 'Health'

function isSet(value: any): boolean {
  return value !== null && value !== undefined
}
