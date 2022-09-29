import { RegistryNamespace, RegistryType } from '@app/models'
import {
  RegistryNamespace as ProtoRegistryNamespace,
  RegistryType as ProtoRegistryType,
  registryTypeToJSON,
} from '@app/models/grpc/protobuf/proto/crux'

export const registryTypeProtoToDto = (type: ProtoRegistryType): RegistryType =>
  registryTypeToJSON(type).toLocaleLowerCase() as RegistryType

export const registryNamespaceToGrpc = (type: RegistryNamespace): ProtoRegistryNamespace => {
  switch (type) {
    case 'organization':
      return ProtoRegistryNamespace.RNS_ORGANIZATION
    case 'user':
      return ProtoRegistryNamespace.RNS_USER
    case 'group':
      return ProtoRegistryNamespace.RNS_GROUP
    case 'project':
      return ProtoRegistryNamespace.RNS_PROJECT
    default:
      return null
  }
}

export const registryNamespaceToDto = (type: ProtoRegistryNamespace): RegistryNamespace => {
  switch (type) {
    case ProtoRegistryNamespace.RNS_ORGANIZATION:
      return 'organization'
    case ProtoRegistryNamespace.RNS_USER:
      return 'user'
    case ProtoRegistryNamespace.RNS_GROUP:
      return 'group'
    case ProtoRegistryNamespace.RNS_PROJECT:
      return 'project'
    default:
      return null
  }
}
