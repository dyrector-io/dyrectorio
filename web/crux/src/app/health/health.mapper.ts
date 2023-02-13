import { Injectable } from '@nestjs/common'
import { ServiceStatus } from 'src/grpc/protobuf/proto/crux'
import { HealthCheckResponse_ServingStatus } from 'src/grpc/protobuf/proto/health'

@Injectable()
export default class HealthMapper {
  serviceStatusToProto(status: ServiceStatus): HealthCheckResponse_ServingStatus {
    switch (status) {
      case ServiceStatus.OPERATIONAL:
        return HealthCheckResponse_ServingStatus.SERVING
      case ServiceStatus.DISRUPTED:
      case ServiceStatus.UNAVAILABLE:
        return HealthCheckResponse_ServingStatus.NOT_SERVING
      case ServiceStatus.UNRECOGNIZED:
        return HealthCheckResponse_ServingStatus.UNRECOGNIZED
      default:
        return HealthCheckResponse_ServingStatus.UNKNOWN
    }
  }
}
