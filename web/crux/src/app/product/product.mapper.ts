import { Injectable } from '@nestjs/common'
import {
  AuditResponse,
  ProductDetailsReponse,
  ProductReponse,
  ProductType as GrpcProductType,
  productTypeFromJSON,
  productTypeToJSON,
} from 'src/grpc/protobuf/proto/crux'
import { Product, ProductTypeEnum } from '.prisma/client'
import VersionMapper, { VersionWithChildren } from '../version/version.mapper'

@Injectable()
export default class ProductMapper {
  constructor(private versionMapper: VersionMapper) {}

  listItemToProto(product: ProductWithCounts): ProductReponse {
    return {
      ...product,
      audit: AuditResponse.fromJSON(product),
      type: this.typeToProto(product.type),
      versionCount: product._count.versions,
    }
  }

  detailsToProto(product: ProductWithVersions): ProductDetailsReponse {
    return {
      ...product,
      audit: AuditResponse.fromJSON(product),
      type: this.typeToProto(product.type),
      deletable: product.deletable,
      versions: product.versions.map(it => this.versionMapper.listItemToProto(it)),
    }
  }

  typeToDb(type: GrpcProductType): ProductTypeEnum {
    return productTypeToJSON(type).toLowerCase() as ProductTypeEnum
  }

  typeToProto(type: ProductTypeEnum): GrpcProductType {
    return productTypeFromJSON(type.toUpperCase())
  }
}

type ProductWithVersions = Product & {
  versions: VersionWithChildren[]
  deletable: boolean
}

export type ProductWithCounts = Product & {
  _count: {
    versions: number
  }
}
