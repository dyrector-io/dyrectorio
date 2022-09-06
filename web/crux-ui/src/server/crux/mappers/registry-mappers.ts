import { RegistryType } from '@app/models'
import { RegistryType as ProtoRegistryType, registryTypeToJSON } from '@app/models/grpc/protobuf/proto/crux'

const registryTypeProtoToDto = (type: ProtoRegistryType): RegistryType =>
  registryTypeToJSON(type).toLocaleLowerCase() as RegistryType

export default registryTypeProtoToDto
