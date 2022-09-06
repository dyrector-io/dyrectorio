import { ServiceStatus } from '@app/models'
import { ServiceStatus as ProtoServiceStatus, serviceStatusToJSON } from '@app/models/grpc/protobuf/proto/crux'

const serviceStatusToDto = (status: ProtoServiceStatus): ServiceStatus =>
  serviceStatusToJSON(status).toLocaleLowerCase() as ServiceStatus

export default serviceStatusToDto
