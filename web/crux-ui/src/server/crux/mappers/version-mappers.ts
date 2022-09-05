import { VersionType } from '@app/models'
import {
  VersionType as ProtoVersionType,
  versionTypeFromJSON,
  versionTypeToJSON,
} from '@app/models/grpc/protobuf/proto/crux'

export const versionTypeToProto = (type: VersionType): ProtoVersionType => versionTypeFromJSON(type.toUpperCase())

export const versionTypeToDyo = (type: ProtoVersionType): VersionType =>
  versionTypeToJSON(type).toLowerCase() as VersionType
