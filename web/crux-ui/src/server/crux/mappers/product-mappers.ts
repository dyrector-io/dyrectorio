import { ProductType } from '@app/models'
import {
  ProductType as ProtoProductType,
  productTypeFromJSON,
  productTypeToJSON,
} from '@app/models/grpc/protobuf/proto/crux'

export const typeToDyo = (type: ProtoProductType): ProductType => productTypeToJSON(type).toLowerCase() as ProductType

export const typeToProto = (type: ProductType): ProtoProductType => productTypeFromJSON(type.toUpperCase())
